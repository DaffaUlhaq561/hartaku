import os
import time
import logging
from typing import Optional
# pyrefly: ignore [missing-import]
from fastapi import FastAPI, File, UploadFile, HTTPException, Query
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
# pyrefly: ignore [missing-import]
from fastapi.responses import JSONResponse
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv

# Load environment variables from .env file BEFORE module imports
load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("fastapi_app")

# --- Force headless BEFORE importing scanner / ultralytics ---
os.environ.setdefault("QT_QPA_PLATFORM", "offscreen")
os.environ.setdefault("OPENCV_IO_ENABLE_OPENEXR", "1")
os.environ.setdefault("DISPLAY", "")

# --- Import scanner SAFELY (never crash app on import failures) ---
run_yolo_scan = None
analyze_with_openai = None
get_yolo_model = None
_SCANNER_IMPORT_ERROR = None

try:
    from scanner import run_yolo_scan as _rys, analyze_with_openai as _awo, get_yolo_model as _gym
    run_yolo_scan = _rys
    analyze_with_openai = _awo
    get_yolo_model = _gym
    logger.info("scanner module imported successfully.")
except Exception as _e:
    _SCANNER_IMPORT_ERROR = _e
    logger.error(f"CRITICAL: scanner module IMPORT FAILED (but app will keep running!): {type(_e).__name__}: {_e}")
    try:
        from backend.scanner import run_yolo_scan as _rys2, analyze_with_openai as _awo2, get_yolo_model as _gym2
        run_yolo_scan = _rys2
        analyze_with_openai = _awo2
        get_yolo_model = _gym2
        _SCANNER_IMPORT_ERROR = None
        logger.info("scanner module imported via backend.scanner fallback.")
    except Exception as _e2:
        logger.error(f"scanner fallback import also failed: {type(_e2).__name__}: {_e2}")
        # Provide DUMMY fallbacks so app still boots (scan endpoint will return graceful error)
        def _dummy_run_yolo_scan(image_bytes, conf_threshold=0.40):
            return {
                "detected": False,
                "detections": [],
                "model_classes": [],
                "yolo_error": f"scanner_import_failed: {_SCANNER_IMPORT_ERROR}"
            }
        def _dummy_analyze_with_openai(image_bytes, yolo_result):
            return {
                "status": "openai_disabled",
                "message": f"Scanner module unavailable: {_SCANNER_IMPORT_ERROR}",
                "corrected_item": "Tidak Terdeteksi",
                "is_corrected": False
            }
        def _dummy_get_yolo_model():
            raise RuntimeError(f"YOLO unavailable - scanner import failed: {_SCANNER_IMPORT_ERROR}")
        run_yolo_scan = _dummy_run_yolo_scan
        analyze_with_openai = _dummy_analyze_with_openai
        get_yolo_model = _dummy_get_yolo_model


app = FastAPI(
    title="Hartaku - Item Scanner API",
    description="FastAPI Backend for Scanning Items using YOLO best.pt Model with OpenAI Vision Fallback & Correction",
    version="1.0.0"
)

def _parse_cors_origins(env_value: str) -> list:
    """Parse comma-separated FRONTEND_ORIGIN list. Supports wildcard '*'.
    Falls back to localhost + common Railway/Vercel defaults if unset."""
    if env_value and env_value.strip():
        origins = [o.strip() for o in env_value.split(",") if o.strip()]
        if origins:
            return origins
    return [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://hartaku-production.up.railway.app",
    ]

_cors_origins = _parse_cors_origins(os.getenv("FRONTEND_ORIGIN", ""))

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins if "*" not in _cors_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Pre-load model on startup to ensure fast first inference. ALWAYS succeeds (app must not crash)."""
    logger.info("=" * 60)
    logger.info("Initializing FastAPI Backend...")
    logger.info(f"CORS allowed origins: {_cors_origins}")
    if _SCANNER_IMPORT_ERROR:
        logger.error(f"⚠️ Scanner unavailable at startup (import failed): {_SCANNER_IMPORT_ERROR}")
        logger.error("App will still respond to / /health /scan — check libxcb / libGL fixes + opencv-python-headless")
    try:
        if get_yolo_model is None:
            logger.warning("get_yolo_model not available")
        else:
            model = get_yolo_model()
            logger.info(f"✅ YOLO model ready with {len(model.names)} classes.")
    except Exception as e:
        logger.warning(f"Could not pre-load YOLO model on startup: {type(e).__name__}: {e}")
        logger.warning("Scan endpoint will still work (will rely on OpenAI fallback only).")
    logger.info("=" * 60)


@app.get("/")
async def root():
    """Healthcheck and API Info."""
    openai_key = os.getenv("OPENAI_API_KEY", "").strip()
    has_openai = bool(openai_key and openai_key != "your_openai_api_key_here")
    
    def _mask(orig):
        if orig == "*":
            return "*"
        if len(orig) <= 12:
            return orig
        return orig[:6] + "..." + orig[-6:]

    return {
        "status": "online",
        "service": "Hartaku Item Scanner API",
        "yolo_model": os.getenv("YOLO_MODEL_PATH", "best.pt"),
        "scanner_import_ok": _SCANNER_IMPORT_ERROR is None,
        "scanner_import_error": str(_SCANNER_IMPORT_ERROR) if _SCANNER_IMPORT_ERROR else None,
        "openai_configured": has_openai,
        "openai_model": os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        "cors_origins": [_mask(o) for o in _cors_origins],
        "endpoints": {
            "health": "/health",
            "scan_item": "/scan",
            "model_classes": "/classes"
        }
    }


@app.get("/health")
async def health_check():
    """Detailed health status. Returns 200 as long as HTTP server lives."""
    return {
        "status": "ok",
        "timestamp": time.time(),
        "scanner_import": ("ok" if _SCANNER_IMPORT_ERROR is None else f"failed: {_SCANNER_IMPORT_ERROR}")
    }


@app.get("/classes")
async def get_model_classes():
    """Get all classes trained inside best.pt model."""
    try:
        if get_yolo_model is None:
            raise RuntimeError("YOLO unavailable (scanner import failed)")
        model = get_yolo_model()
        return {
            "success": True,
            "total_classes": len(model.names),
            "classes": model.names
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal mengambil data kelas model: {str(e)}")


@app.post("/scan")
async def scan_item(
    file: UploadFile = File(...),
    conf_threshold: Optional[float] = Query(None, description="Confidence threshold untuk YOLO (0.0 - 1.0)"),
    skip_openai: bool = Query(False, description="Lewati verifikasi/koreksi OpenAI")
):
    """
    Endpoint utama untuk scan gambar barang.
    Graceful degradation: jika YOLO fail, cuma pakai OpenAI fallback.
    """
    # 1. Validasi tipe file
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File harus berupa gambar (JPEG, PNG, WEBP, dll).")

    try:
        image_bytes = await file.read()
        if len(image_bytes) == 0:
            raise HTTPException(status_code=400, detail="File gambar kosong.")

        if conf_threshold is None:
            conf_threshold = float(os.getenv("YOLO_CONF_THRESHOLD", "0.40"))

        start_time = time.time()

        yolo_result = run_yolo_scan(image_bytes, conf_threshold=conf_threshold)

        openai_result = None
        source = "yolo"
        final_item_name = "Tidak Terdeteksi"
        is_corrected = False
        details = {}

        if skip_openai:
            if yolo_result["detected"]:
                final_item_name = yolo_result["detections"][0]["label"]
                source = "yolo_unverified"
            elif yolo_result.get("yolo_error"):
                final_item_name = "Scanner Error - Gunakan OpenAI"
                source = "yolo_unavailable"
        else:
            openai_result = analyze_with_openai(image_bytes, yolo_result)

            if openai_result.get("status") == "success":
                final_item_name = openai_result.get("detected_item", "Unknown")
                is_corrected = openai_result.get("is_corrected", False)
                details = {
                    "category": openai_result.get("category"),
                    "description": openai_result.get("description"),
                    "confidence": openai_result.get("confidence"),
                    "reasoning": openai_result.get("reasoning")
                }

                if not yolo_result["detected"]:
                    source = "openai_fallback"
                elif is_corrected:
                    source = "openai_corrected"
                else:
                    source = "yolo_verified"
            else:
                if yolo_result["detected"]:
                    final_item_name = yolo_result["detections"][0]["label"]
                    source = "yolo_unverified"
                else:
                    source = "not_found"
                    # Even if not found, we return OpenAI details if any for debugging
                    if openai_result and openai_result.get("message"):
                        details["message"] = openai_result.get("message")

        processing_time = round(time.time() - start_time, 3)

        return JSONResponse(
            content={
                "success": True,
                "detected_item": final_item_name,
                "source": source,
                "is_corrected": is_corrected,
                "processing_time_seconds": processing_time,
                "yolo_detection": {
                    "detected": yolo_result["detected"],
                    "count": len(yolo_result["detections"]),
                    "items": yolo_result["detections"],
                    "error": yolo_result.get("yolo_error")
                },
                "openai_analysis": details if openai_result else None,
                "message": (
                    f"Barang berhasil diidentifikasi: {final_item_name}"
                    if final_item_name != "Tidak Terdeteksi"
                    else "Barang tidak terdeteksi oleh model maupun OpenAI."
                )
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during scan: {type(e).__name__}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan saat memproses scan: {str(e)}")


if __name__ == "__main__":
    # pyrefly: ignore [missing-import]
    import uvicorn
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host=host, port=port)
