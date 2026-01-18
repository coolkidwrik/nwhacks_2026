import cv2
import numpy as np
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

# ----------------------------
# Joint definitions (indices)
# ----------------------------
JOINT_TRIPLES = {
    "left_elbow": (11, 13, 15),
    "right_elbow": (12, 14, 16),
    "left_shoulder": (13, 11, 23),
    "right_shoulder": (14, 12, 24),
    "left_hip": (11, 23, 25),
    "right_hip": (12, 24, 26),
    "left_knee": (23, 25, 27),
    "right_knee": (24, 26, 28),
    "spine": (11, 23, 24),
}

def calculate_angle(a, b, c):
    a, b, c = np.array(a), np.array(b), np.array(c)
    ba = a - b
    bc = c - b
    cos_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc))
    return np.degrees(np.arccos(np.clip(cos_angle, -1.0, 1.0)))

# ----------------------------
# PoseLandmarker options
# ----------------------------
base_options = python.BaseOptions(
    model_asset_path="pose_landmarker_lite.task"
)

options = vision.PoseLandmarkerOptions(
    base_options=base_options,
    running_mode=vision.RunningMode.VIDEO,
    num_poses=1
)

# ----------------------------
# Extract pose angles from video capture
# ----------------------------
def extract_pose_angles(cap: cv2.VideoCapture) -> list:
    """Extract pose angles from a cv2.VideoCapture object."""
    pose_detector = vision.PoseLandmarker.create_from_options(options)

    sequence = []
    timestamp_ms = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        mp_image = mp.Image(
            image_format=mp.ImageFormat.SRGB,
            data=frame
        )

        result = pose_detector.detect_for_video(mp_image, timestamp_ms)
        timestamp_ms += 33  # ~30 FPS

        if not result.pose_landmarks:
            continue

        landmarks = result.pose_landmarks[0]
        frame_angles = {}

        for joint, (a, b, c) in JOINT_TRIPLES.items():
            p1 = [landmarks[a].x, landmarks[a].y]
            p2 = [landmarks[b].x, landmarks[b].y]
            p3 = [landmarks[c].x, landmarks[c].y]
            frame_angles[joint] = calculate_angle(p1, p2, p3)

        sequence.append(frame_angles)

    cap.release()
    if hasattr(pose_detector, "close"):
        pose_detector.close()
    return sequence
