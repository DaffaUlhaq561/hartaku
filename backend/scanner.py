import os

# --- HEADLESS ENV SETUP (MUST RUN BEFORE ANY OpenCV / QT / Ultralytics IMPORTS ---
os.environ.setdefault("QT_QPA_PLATFORM", "offscreen")
os.environ.setdefault("OPENCV_IO_ENABLE_OPENEXR", "1")
os.environ.setdefault("DISPLAY", "")

import io
import base64
import json
import logging
from typing import Dict, Any, List, Optional
from PIL import Image
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger("scanner")
logging.basicConfig(level=logging.INFO)

# Global model instance cache
_yolo_model = None
_yolo_import_error = None

def _import_yolo_or_fail_fast():
    """Attempt to import ultralytics/YOLO. Cache error to avoid repeated noisy logs."""
    global _yolo_import_error
    if _yolo_import_error:
        raise _yolo_import_error
    try:
        # Force headless cv2 backend BEFORE import ultralytics pulls opencv-python
        try:
            import sys
            # Ensure headless opencv loads first, if present
            if "cv2" not in sys.modules:
                try:
                    import cv2  # noqa: F401
                    logger.info(f"OpenCV backend ready: headless={getattr(cv2, 'ocl', None) is None or 'cv2' in str(cv2)}")
                except Exception as _cv_err:
                    logger.warning(f"OpenCV import warning (may still work via ultralytics bundled cv2): {_cv_err}")
        except Exception:
            pass
        from ultralytics import YOLO
        return YOLO
    except Exception as e:
        _yolo_import_error = e
        raise e


def get_yolo_model():
    """Lazy load YOLO model to optimize startup time. Returns None + raises descriptive error on failure."""
    global _yolo_model
    if _yolo_model is None:
        try:
            YOLO = _import_yolo_or_fail_fast()
            model_path = os.getenv("YOLO_MODEL_PATH", "best.pt")
            if not os.path.isabs(model_path):
                base_dir = os.path.dirname(os.path.abspath(__file__))
                model_path = os.path.join(base_dir, model_path)

            if not os.path.exists(model_path):
                available_files = os.listdir(os.path.dirname(model_path)) if os.path.isdir(os.path.dirname(model_path)) else []
                raise FileNotFoundError(
                    f"Model file not found at: {model_path}. "
                    f"Files in backend dir: {available_files}"
                )

            logger.info(f"Loading YOLO model from {model_path}...")
            _yolo_model = YOLO(model_path)
            logger.info(f"YOLO model loaded successfully. Known classes: {list(_yolo_model.names.values())[:20]}...")
        except FileNotFoundError as e:
            logger.error(f"Error loading YOLO model: {e}")
            raise e
        except Exception as e:
            logger.error(f"Error loading YOLO model: {type(e).__name__}: {e}")
            # Avoid spamming huge traceback, but log enough to debug libxcb / libGL errors
            if "libxcb" in str(e) or "libGL" in str(e) or "libX11" in str(e) or "cannot open shared object file" in str(e):
                logger.error(
                    "SYSTEM LIBRARY MISSING! Possible fixes: "
                    "1) Railway redeploy WITH Dockerfile (builder=dockerfile, context=backend), "
                    "2) Install opencv-python-headless instead of opencv-python. "
                    f"Missing lib: {e}"
                )
            raise e
    return _yolo_model


def run_yolo_scan(image_bytes: bytes, conf_threshold: float = 0.40) -> Dict[str, Any]:
    """
    Run object detection using YOLO best.pt model.
    NEVER crashes app - returns empty detections if YOLO unavailable.
    """
    try:
        model = get_yolo_model()
    except Exception as e:
        logger.warning(f"YOLO unavailable, skipping detection: {type(e).__name__}: {e}")
        return {
            "detected": False,
            "detections": [],
            "model_classes": [],
            "yolo_error": f"{type(e).__name__}: {e}"
        }

    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        results = model.predict(image, conf=conf_threshold, verbose=False)
        
        detections: List[Dict[str, Any]] = []
        
        if len(results) > 0 and len(results[0].boxes) > 0:
            boxes = results[0].boxes
            for box in boxes:
                class_id = int(box.cls[0].item())
                class_name = model.names.get(class_id, f"class_{class_id}")
                confidence = float(box.conf[0].item())
                xyxy = box.xyxy[0].tolist()
                
                detections.append({
                    "class_id": class_id,
                    "label": class_name,
                    "confidence": round(confidence, 4),
                    "bbox": [round(coord, 2) for coord in xyxy]
                })

        detections.sort(key=lambda x: x["confidence"], reverse=True)

        return {
            "detected": len(detections) > 0,
            "detections": detections,
            "model_classes": list(model.names.values()) if hasattr(model, "names") else []
        }
    except Exception as e:
        logger.error(f"YOLO predict runtime error: {type(e).__name__}: {e}", exc_info=True)
        return {
            "detected": False,
            "detections": [],
            "model_classes": [],
            "yolo_error": f"{type(e).__name__}: {e}"
        }


def analyze_with_openai(
    image_bytes: bytes, 
    yolo_result: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Use OpenAI Vision API (e.g., gpt-4o-mini) to:
    1. Identify items when YOLO finds nothing.
    2. Verify and correct YOLO detections if YOLO misclassified the item.
    """
    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    model_name = os.getenv("OPENAI_MODEL", "gpt-4o-mini").strip()

    if not api_key or api_key == "your_openai_api_key_here":
        fallback = yolo_result["detections"][0]["label"] if yolo_result["detected"] else "Tidak Terdeteksi"
        return {
            "status": "openai_disabled",
            "message": "OPENAI_API_KEY tidak dikonfigurasi. Menggunakan hasil deteksi YOLO murni atau fallback.",
            "corrected_item": fallback,
            "is_corrected": False
        }

    try:
        # pyrefly: ignore [missing-import]
        from openai import OpenAI
        client = OpenAI(api_key=api_key)

        base64_image = base64.b64encode(image_bytes).decode("utf-8")
        
        yolo_detected = yolo_result["detected"]
        yolo_items = [d["label"] for d in yolo_result["detections"]]

        if not yolo_detected:
            prompt = (
                "Gambar ini dipindai tetapi tidak dikenali oleh model deteksi lokal.\n"
                "Tolong analisis gambar ini dan sebutkan barang/produk yang tampak secara spesifik.\n"
                "Jawab HANYA dalam format JSON valid tanpa tanda markdown (tanpa ```json):\n"
                "{\n"
                '  "detected_item": "nama barang",\n'
                '  "category": "kategori barang",\n'
                '  "description": "deskripsi singkat barang",\n'
                '  "confidence": 0.95,\n'
                '  "reasoning": "penjelasan mengapa barang ini diidentifikasi sebagai nama tersebut"\n'
                "}"
            )
        else:
            prompt = (
                f"Model deteksi objek mendeteksi barang berikut dalam gambar: {', '.join(yolo_items)}.\n"
                "Tugas Anda:\n"
                "1. Periksa apakah hasil deteksi model tersebut BENAR atau SALAH/KURANG TEPAT.\n"
                "2. Jika salah atau kurang tepat, berikan nama barang yang benar secara spesifik.\n"
                "Jawab HANYA dalam format JSON valid tanpa tanda markdown (tanpa ```json):\n"
                "{\n"
                '  "is_yolo_correct": true,\n'
                '  "detected_item": "nama barang yang tepat",\n'
                '  "category": "kategori barang",\n'
                '  "description": "deskripsi singkat barang",\n'
                '  "confidence": 0.95,\n'
                '  "reasoning": "alasan jika hasil yolo dikoreksi atau dikonfirmasi"\n'
                "}"
            )

        response = client.chat.completions.create(
            model=model_name,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=350,
            temperature=0.2
        )

        content = response.choices[0].message.content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()

        parsed = json.loads(content)
        
        is_yolo_correct = parsed.get("is_yolo_correct", True if yolo_detected else False)
        
        return {
            "status": "success",
            "openai_response": parsed,
            "detected_item": parsed.get("detected_item", "Unknown Item"),
            "category": parsed.get("category", "General"),
            "description": parsed.get("description", ""),
            "confidence": parsed.get("confidence", 0.90),
            "is_corrected": not is_yolo_correct if yolo_detected else True,
            "reasoning": parsed.get("reasoning", "")
        }

    except Exception as e:
        logger.error(f"OpenAI analysis error: {type(e).__name__}: {e}")
        fallback_item = yolo_result["detections"][0]["label"] if yolo_result["detected"] else "Tidak Terdeteksi"
        return {
            "status": "error",
            "message": f"Gagal memproses dengan OpenAI API: {str(e)}",
            "detected_item": fallback_item,
            "is_corrected": False
        }
