const API_URL = 'http://127.0.0.1:8000';

export interface AnalysisResponse {
  feedback: string;
  reference_frames: number;
  user_frames: number;
  error?: string;
}

export const analyzeVideos = async (
  referenceVideo: Blob | File,
  userVideo: Blob | File
): Promise<AnalysisResponse> => {
  const formData = new FormData();
  formData.append('reference', referenceVideo, referenceVideo instanceof File ? referenceVideo.name : 'reference.webm');
  formData.append('user', userVideo, userVideo instanceof File ? userVideo.name : 'user.webm');

  const response = await fetch(`${API_URL}/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Analysis failed: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  return result;
};

// For backward compatibility - single video upload (can be used for testing)
export const uploadVideo = async (video: Blob | File): Promise<string> => {
  // This is a placeholder - you'd need to implement a single video endpoint
  // or use a default reference video
  throw new Error('Single video upload not implemented. Use analyzeVideos instead.');
};
