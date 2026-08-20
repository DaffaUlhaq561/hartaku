# Backend Scanner API (FastAPI + YOLO best.pt + OpenAI Vision)

API FastAPI untuk melakukan scan/pindai barang menggunakan model YOLO (`best.pt`). Jika barang yang di-scan tidak terdeteksi oleh model `best.pt`, atau jika model `best.pt` salah mengenali barang, sistem secara otomatis akan menggunakan OpenAI Vision API (`gpt-4o-mini` / `gpt-4o`) untuk mengenali dan membenarkan hasil scan barang tersebut.

---

## 🚀 Fitur Utama

1. **Deteksi Objek Lokal (YOLO `best.pt`)**:
   - Memroses deteksi gambar secara cepat tanpa latency internet jika barang terdaftar di model.
2. **Fallback OpenAI Vision API**:
   - Jika `best.pt` tidak mendeteksi objek apapun, sistem akan meminta OpenAI Vision untuk mengidentifikasi barang dari gambar.
3. **Koreksi Otomatis OpenAI**:
   - Jika `best.pt` salah mengenali barang, OpenAI Vision akan memeriksa dan membenarkan (koreksi) nama barang yang terdeteksi.
4. **Konfigurasi Mudah via `.env`**:
   - Menaruh `OPENAI_API_KEY`, pilihan model, threshold confidence, dan port server dalam file `.env`.

---

## 🛠️ Cara Instalasi & Persiapan

### 1. Masuk ke direktori backend
```bash
cd backend
```

### 2. Buat & Aktifkan Virtual Environment (Disarankan)
```bash
python -m venv venv

# Di Windows PowerShell:
.\venv\Scripts\Activate.ps1

# Di Linux / macOS:
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

---

## 🔑 Menaruh OpenAI API Key di File `.env`

File `.env` sudah dibuat di direktori `backend/`. Buka file `backend/.env` dan masukkan `OPENAI_API_KEY` milik Anda:

```env
# ==========================================
# FastAPI Backend Configuration
# ==========================================

# Taruh OpenAI API Key milik Anda di sini:
OPENAI_API_KEY=sk-proj-xxxxxx...

# Pilihan Model OpenAI (gpt-4o-mini atau gpt-4o)
OPENAI_MODEL=gpt-4o-mini

# Konfigurasi Model YOLO
YOLO_MODEL_PATH=best.pt
YOLO_CONF_THRESHOLD=0.40

# Setting Server FastAPI
HOST=0.0.0.0
PORT=8000
```

---

## 🏃 Cara Menjalankan Server API

Jalankan perintah berikut untuk memulai server FastAPI:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Atau jalankan langsung file `main.py`:
```bash
python main.py
```

Server akan berjalan di: `http://localhost:8000`  
Dokumentasi Interaktif Swagger UI: `http://localhost:8000/docs`

---

## 📡 Endpoint API

### 1. Healthcheck
- **GET** `/` atau `/health`
- **Respon**: Status server dan status konfigurasi OpenAI.

### 2. Daftar Kelas Model `best.pt`
- **GET** `/classes`
- **Respon**: Mengembalikan daftar label/kelas yang dilatih di file `best.pt`.

### 3. Scan Barang (Upload Gambar)
- **POST** `/scan`
- **Body**: `multipart/form-data` dengan field `file` (File Gambar JPG/PNG/WEBP).
- **Query Params Optional**:
  - `conf_threshold` (float, contoh `0.40`): Ambang batas kepastian YOLO.
  - `skip_openai` (boolean, default `false`): Jika `true`, hanya memakai YOLO murni tanpa memanggil OpenAI.

#### Contoh Respon JSON (`POST /scan`):
```json
{
  "success": true,
  "detected_item": "Minyak Goreng Bimoli 1L",
  "source": "openai_corrected",
  "is_corrected": true,
  "processing_time_seconds": 1.24,
  "yolo_detection": {
    "detected": true,
    "count": 1,
    "items": [
      {
        "class_id": 2,
        "label": "Botol Plastik",
        "confidence": 0.584,
        "bbox": [120.5, 45.0, 310.2, 580.0]
      }
    ]
  },
  "openai_analysis": {
    "category": "Sembako / Minyak",
    "description": "Kemasan kemasan pouch minyak goreng merek Bimoli 1 Liter",
    "confidence": 0.98,
    "reasoning": "Model mendeteksi 'Botol Plastik' namun secara visual barang tersebut adalah pouch minyak goreng Bimoli"
  },
  "message": "Barang berhasil diidentifikasi: Minyak Goreng Bimoli 1L"
}
```

---

## 🧪 Menguji Endpoint dengan `curl`

```bash
curl -X POST "http://localhost:8000/scan" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/gambar_barang.jpg"
```
