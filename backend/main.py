import os
import json
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import cv2
import tempfile

from pose_utils import extract_pose_angles
from compare import *


# ----------------------------
# App setup
# ----------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

ANGLES_DIR = "../uploads"
os.makedirs(ANGLES_DIR, exist_ok=True)

# ----------------------------
# Helper functions
# ----------------------------

async def find_angles(file: UploadFile):
    """
    Extract angles from uploaded videos.
    Returns tuple [angles]
    """
    if not file or not file.filename:
        return None
    
    # Get the file extension and create proper JSON filename
    filename = str(file.filename)
    # Remove any video extension to create JSON filename
    base_name = filename
    for ext in ['.mp4', '.webm', '.avi', '.mov', '.mkv']:
        if base_name.lower().endswith(ext):
            base_name = base_name[:-len(ext)]
            break
    
    json_filename = f"{base_name}.json"
    json_path = os.path.join(ANGLES_DIR, json_filename)
    file_angles = None

    # Check if we already have cached angles
    if os.path.exists(json_path):
        with open(json_path, "r") as f:
            file_angles = json.load(f)
    else:
        # Determine the file suffix from the original filename
        suffix = os.path.splitext(filename)[1] or ".mp4"
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            content = await file.read()
            tmp.write(content)
            tmp.flush()
            tmp_path = tmp.name
        
        try:
            cap = cv2.VideoCapture(tmp_path)
            if not cap.isOpened():
                print(f"Warning: Could not open video file {filename}")
                return None
            
            file_angles = extract_pose_angles(cap)
            cap.release()
            
            if file_angles:
                with open(json_path, "w") as f:
                    json.dump(file_angles, f)
        finally:
            # Clean up temp file
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

    return file_angles


# ----------------------------
# API endpoints
# ----------------------------

@app.post("/analyze")
async def analyze(
    reference: Optional[UploadFile] = File(None),
    user: Optional[UploadFile] = File(None)
):
    """
    Analyze pose comparison.
    - Use reference_json/user_json to pass names of pre-extracted JSON files
    - Use reference/user to upload videos (will be processed in memory, not saved)
    """
 
    ref_angles = await find_angles(reference)
    user_angles = await find_angles(user)

    if not ref_angles or not user_angles:
        return {"error": "Pose could not be detected in one or both videos."}

    feedback = await get_feedback(compare_general_action(ref_angles, user_angles))

    return {
        "feedback": feedback,
        "reference_frames": len(ref_angles),
        "user_frames": len(user_angles)
    }
