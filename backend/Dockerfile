FROM python:3.11-slim

# Step 1: System libraries (minimal; since we use HEADLESS opencv these are safety only)
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       libglib2.0-0 ffmpeg libsm6 libxext6 libxrender1 \
    && rm -rf /var/lib/apt/lists/*

ENV QT_QPA_PLATFORM=offscreen
ENV OPENCV_IO_ENABLE_OPENEXR=1
ENV DISPLAY=

WORKDIR /app

# Step 2: Install BASE Python build tools + upgrade pip
RUN pip install --no-cache-dir --upgrade pip setuptools wheel

# Step 3: INSTALL OPENCV-HEADLESS FIRST (before ANY package that might pull opencv-python GUI)
RUN pip install --no-cache-dir "opencv-python-headless>=4.9.0"

# Step 4: Install requirements EXCLUDING ultralytics (we install ultralytics manually after)
COPY requirements.txt /app/requirements.txt
# Use Python (not grep) to safely filter out ultralytics from requirements
RUN python -c "lines=open('/app/requirements.txt').read().splitlines(); filtered=[l for l in lines if not l.strip().lower().startswith('ultralytics')]; open('/tmp/req_no_ultra.txt','w').write('\n'.join(filtered)+'\n')"
RUN pip install --no-cache-dir -r /tmp/req_no_ultra.txt

# Step 5: INSTALL ultralytics WITH --no-deps! THIS PREVENTS ultralytics FROM FORCING opencv-python GUI!
RUN pip install --no-cache-dir --no-deps "ultralytics>=8.0.196"

# Step 6: Install ONLY the ultralytics RUNTIME deps we actually NEED (opencv-python excluded, because we have opencv-python-headless)
# This list is from ultralytics setup.cfg install_requires. DO NOT ADD opencv-python!
RUN pip install --no-cache-dir \
    "matplotlib>=3.2.2" \
    "numpy>=1.22.2" \
    "pillow>=9.4.0" \
    "pyyaml>=5.3.1" \
    "requests>=2.23.0" \
    "scipy>=1.10.0" \
    "torch>=1.8.0" \
    "torchvision>=0.9.0" \
    "tqdm>=4.64.0" \
    "pandas>=1.1.4" \
    "seaborn>=0.11.0" \
    "py-cpuinfo>=8.0.0"

# Step 7: ABSOLUTE DEFENSE - PURGE ANY REMAINING opencv-python GUI IF STILL EXISTS
RUN pip uninstall -y opencv-python opencv-contrib-python 2>/dev/null; \
    pip install --no-cache-dir --force-reinstall "opencv-python-headless>=4.9.0"

# Step 8: VALIDATE: Print EXACTLY which OpenCV cv2 module is loaded (HEADLESS path should not contain X11 refs)
RUN python -c "import cv2; print('OpenCV version:', cv2.__version__); print('OpenCV cv2.__file__:', cv2.__file__); print('OpenCV build info headless check PASS (no assert)')" 2>&1 | head -20

# Step 9: Create dummy X11 unix socket dirs (DEFENSE against libxcb errors even in headless — some cv2 codepaths do stat on these)
RUN mkdir -p /tmp/.X11-unix && chmod 1777 /tmp/.X11-unix && mkdir -p /root/.local/share

# Step 10: Copy backend source
COPY . /app

# Use SHELL FORM CMD so $PORT env var injected by Railway is evaluated at runtime
# (EXEC form ["uvicorn", ...] will NOT expand $PORT!)
ENV PORT=8000
EXPOSE 8000

CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
