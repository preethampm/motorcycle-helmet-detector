# Motorcycle Helmet Detector

A computer vision project that detects whether motorcycle riders are wearing helmets or not using YOLO-based object detection.

---

## Overview
This project uses a deep learning model to automatically identify riders with and without helmets in real-time video feeds or images.  
It can be applied in traffic surveillance, road safety enforcement, and smart city monitoring systems.

---

## Features
- Detects riders wearing and not wearing helmets.  
- Works with images, videos, and live webcam feeds.  
- Real-time performance using YOLO models (`yolov8n.pt`, `yolo11n.pt`).  
- Simple Python scripts for quick testing and demo.  
- Customizable thresholds for detection confidence.  

---

## Model Architecture
The system is based on the YOLO (You Only Look Once) object detection framework for fast and accurate real-time performance.

1. **Model Used:** YOLOv8n / YOLO11n (custom trained).  
2. **Classes:** `helmet`, `no_helmet`.  
3. **Framework:** Ultralytics YOLO + OpenCV.  
4. **Output:** Bounding boxes and labels over detected riders.

---

## Dataset and Configuration
- Dataset stored under `Dataset2/` with YOLO-formatted annotations.  
- Configuration files:
  - `data.yaml` → defines dataset paths and class names.  
  - `helmet.yaml` → defines model and hyperparameters.  
- You can extend the dataset by adding new labeled images.

---

## Installation

### Prerequisites
- Python 3.8+  
- PyTorch + CUDA (for GPU acceleration, optional)  
- pip for dependencies  

### Setup
```bash
git clone https://github.com/preethampm/motorcycle-helmet-detector.git
cd motorcycle-helmet-detector
pip install -r requirements.txt
