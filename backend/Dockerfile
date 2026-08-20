FROM python:3.11-slim

# Install system dependencies required by OpenCV / Qt / model runtime
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       libxcb1 libx11-6 libglib2.0-0 libsm6 libxrender1 libxext6 libgl1-mesa-glx \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python deps
COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy backend source
COPY backend /app

# Expose port (Railway / container platform will map externally)
ENV PORT=8000
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
