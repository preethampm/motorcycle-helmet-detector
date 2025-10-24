import cv2
import os
import time

# Choose class label (helmet / no_helmet)
label = input("Enter label (helmet / no_helmet): ").strip().lower()
save_dir = f"data/{label}"

os.makedirs(save_dir, exist_ok=True)

cap = cv2.VideoCapture(0)  # webcam

count = 0
print("Press SPACE to capture, ESC to exit.")

while True:
    ret, frame = cap.read()
    if not ret:
        break

    cv2.imshow("Capture", frame)
    key = cv2.waitKey(1) & 0xFF

    if key == 27:  # ESC
        break
    elif key == 32:  # SPACE
        filename = os.path.join(save_dir, f"{label}_{int(time.time())}.jpg")
        cv2.imwrite(filename, frame)
        print(f"Saved {filename}")
        count += 1

cap.release()
cv2.destroyAllWindows()
print(f"Captured {count} images for class: {label}")
