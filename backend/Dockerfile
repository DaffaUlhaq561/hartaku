FROM python:3.11-slim

# Install system dependencies required by OpenCV / headless runtime
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       libxcb1 libx11-6 libglib2.0-0 libsm6 libxrender1 libxext6 \
       libgl1-mesa-glx libglib2.0-0 libgtk2.0-0 libbz2-1.0 \
       libpango-1.0-0 libcairo2 libgdk-pixbuf2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Force headless mode for Qt/OpenCV (no X11 display required)
ENV QT_QPA_PLATFORM=offscreen
ENV OPENCV_IO_ENABLE_OPENEXR=1

WORKDIR /app

# Install Python deps
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt \
    && pip uninstall -y opencv-python opencv-contrib-python 2>/dev/null || true \
    && pip install --no-cache-dir --force-reinstall opencv-python-headless>=4.8.0

# Copy backend source (build context is ./backend)
COPY . /app

# Expose port (Railway / container platform will map externally)
ENV PORT=8000
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
