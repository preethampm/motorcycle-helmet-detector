from ultralytics import YOLO
import cv2

# Load your trained YOLO model
model = YOLO(r"C:\Users\p14pr\Desktop\helmet\runs\detect\train\weights\best.pt")

# Open webcam (0 = default camera)
cap = cv2.VideoCapture(0)

CONF_THRESHOLD = 0.75  # Only show detections with confidence >= 75%

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Run YOLO inference
    results = model(frame, stream=True)

    for r in results:
        for box in r.boxes:
            conf = float(box.conf[0])
            if conf < CONF_THRESHOLD:
                continue  # skip low-confidence detections

            x1, y1, x2, y2 = map(int, box.xyxy[0])
            cls = int(box.cls[0])
            label = model.names[cls]

            # Draw only high-confidence boxes
            color = (0, 255, 0) if label == "helmet" else (0, 0, 255)
            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
            cv2.putText(frame, f"{label} {conf:.2f}", (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

    # Display the live video
    cv2.imshow("Helmet Detection", frame)

    # Press 'q' to quit
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
