import numpy as np
from scipy.spatial.distance import euclidean
from fastdtw import fastdtw
import os
from dotenv import load_dotenv
import httpx

# Load environment variables from .env file
load_dotenv()

# Helper: convert sequence of dicts -> matrix
def sequence_to_matrix(sequence):
    """
    sequence: List[Dict[joint_name -> angle]]
    returns: (np.ndarray [T x J], joint_names)
    """
    joint_names = list(sequence[0].keys())
    matrix = np.array([
        [frame[j] for j in joint_names]
        for frame in sequence
    ])
    return matrix, joint_names


# Temporal alignment using DTW
def align_sequences(ref_seq, user_seq):
    ref_mat, joint_names = sequence_to_matrix(ref_seq)
    user_mat, _ = sequence_to_matrix(user_seq)

    _, path = fastdtw(ref_mat, user_mat, dist=euclidean)
    return ref_mat, user_mat, path, joint_names


# Automatically detect active joints, i.e., find the joints that actually move in the video
def find_active_joints(ref_seq, std_threshold=8.0):

    active = []
    for joint in ref_seq[0].keys():
        values = [frame[joint] for frame in ref_seq]
        if np.std(values) > std_threshold:
            active.append(joint)
    return active


# Main comparison function, returns list of textual feedback strings.
def compare_general_action(ref_seq, user_seq):
    ref_mat, user_mat, path, joint_names = align_sequences(ref_seq, user_seq)
    active_joints = find_active_joints(ref_seq)

    joint_errors = {j: [] for j in active_joints}

    for ref_i, user_i in path:
        for idx, joint in enumerate(joint_names):
            if joint in active_joints:
                diff = abs(ref_mat[ref_i, idx] - user_mat[user_i, idx])
                joint_errors[joint].append(diff)
        
    return joint_errors

# Default feedback function if no apikey / ai throws
def default_feedback(joint_errors): 
    feedback = []
    for joint, errors in joint_errors.items():
        avg_error = float(np.mean(errors))
        if avg_error > 12.0:
            feedback.append(
                f"{joint.replace('_', ' ').title()} differs by "
                f"{avg_error:.1f}°. Try matching the reference movement more closely."
            )
    if not feedback:
        feedback.append("Excellent form. Your movement closely matches the reference.")
    return "\n".join(feedback)

async def get_feedback(joint_errors):
    api_key = os.getenv("API_KEY")
    
    # Fallback to basic feedback if no API key is set
    if not api_key:
        return default_feedback(joint_errors)
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            prompt = (
                "Provide concise feedback on the following joint angle differences "
                "between a user's movement and a reference movement:\n\n"
            )
            for joint, errors in joint_errors.items():
                avg_error = float(np.mean(errors))
                prompt += f"- {joint.replace('_', ' ').title()}: {avg_error:.1f}° difference\n"
            prompt += "\nGive specific advice for improvement if the average difference exceeds 12°."

            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "openai/gpt-3.5-turbo",
                    "messages": [
                        {"role": "system", "content": "You are a helpful fitness coach."},
                        {"role": "user", "content": prompt}
                    ],
                    "max_tokens": 150,
                    "temperature": 0.7
                }
            )
            
            response.raise_for_status()
            ai_feedback = response.json()["choices"][0]["message"]["content"]
            return ai_feedback
            
    except httpx.HTTPStatusError as e:
        # Try to get the error message from the API response
        try:
            error_detail = e.response.json().get("error", {}).get("message", str(e))
        except:
            error_detail = str(e)
        print(f"OpenAI API Error: {e.response.status_code} - {error_detail}")
        return f"Feedback unavailable (API error: {e.response.status_code}). {error_detail}"
    except httpx.RequestError as e:
        print(f"Request Error: {e}")
        return f"Feedback unavailable (connection error). Please check your form against the reference video."
    except (KeyError, IndexError) as e:
        print(f"Response parsing error: {e}")
        return "Feedback unavailable (unexpected response). Please check your form against the reference video."


    
