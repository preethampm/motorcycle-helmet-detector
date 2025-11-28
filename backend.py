import cv2
import asyncio
import base64
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from ultralytics import YOLO
import numpy as np

app = FastAPI()

# Load model
model = YOLO(r"./runs/detect/train/weights/best.pt")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    cap = cv2.VideoCapture(0)
    
    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break

            # Run inference
            results = model(frame, stream=True)
            
            detections = []
            
            # Process results
            for r in results:
                for box in r.boxes:
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    conf = float(box.conf[0])
                    cls = int(box.cls[0])
                    label = model.names[cls]
                    
                    detections.append({
                        "bbox": [x1, y1, x2, y2],
                        "conf": conf,
                        "label": label
                    })

            # Encode frame to base64
            _, buffer = cv2.imencode('.jpg', frame)
            frame_base64 = base64.b64encode(buffer).decode('utf-8')
            
            # Send data
            await websocket.send_json({
                "frame": frame_base64,
                "detections": detections
            })
            
            # Control frame rate
            await asyncio.sleep(0.03) 

    except WebSocketDisconnect:
        print("Client disconnected")
    finally:
        cap.release()
