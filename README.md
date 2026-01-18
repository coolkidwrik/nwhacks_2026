# Idea

Give the 2 reference and user videos and compares if you replicate the action correctly or not. 

We do this by comparing the angles between the joints. 

The main process of comparing the motions:
1. use `mediapipeline` to get the keymarkers for joints at 30fps
2. calculate the angles at each joint
3. align the two angles using dynamic time warping to align the videos
4. check which angles are active
5. compare the active angles at specific timepoints to see how off your angles are. 

-> converting a dictionary of joint and angles into a $T \times J$ matrix for quicker calculations. 

# Running the server

Make sure to have python $\geq$ 3.10, it should work with lower versions but we reccomend $\geq$ 3.10 version to ensure reliability. 
Make sure to `cd` into `./backend` before starting the server.
```bash
pip install numpy mediapipe uvicorn opencv-python fastapi scipy fastdtw python-multipart
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

# Testing backend

Have 2 videos for reference and usage and can test the analyse, function as following:
```bash
curl -v \
  -F "reference=@path/to/video.mp4" \
  -F "user=@path/to/video.mp4" \
  http://127.0.0.1:8000/analyze
```