import { useState, useRef, useCallback } from 'react';

interface UseVideoRecorderReturn {
  isRecording: boolean;
  isPreviewing: boolean;
  recordedBlob: Blob | null;
  previewStream: MediaStream | null;
  startPreview: () => Promise<void>;
  stopPreview: () => void;
  startRecording: () => void;
  stopRecording: () => void;
  clearRecording: () => void;
  error: string | null;
}

export const useVideoRecorder = (): UseVideoRecorderReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startPreview = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true,
      });
      setPreviewStream(stream);
      setIsPreviewing(true);
    } catch (err) {
      setError('Could not access camera. Please allow camera permissions.');
      console.error('Error accessing media devices:', err);
    }
  }, []);

  const stopPreview = useCallback(() => {
    if (previewStream) {
      previewStream.getTracks().forEach(track => track.stop());
      setPreviewStream(null);
    }
    setIsPreviewing(false);
    setIsRecording(false);
  }, [previewStream]);

  const startRecording = useCallback(() => {
    if (!previewStream) return;

    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(previewStream, {
      mimeType: 'video/webm;codecs=vp9',
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setRecordedBlob(blob);
      stopPreview();
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecording(true);
  }, [previewStream, stopPreview]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const clearRecording = useCallback(() => {
    setRecordedBlob(null);
    setError(null);
  }, []);

  return {
    isRecording,
    isPreviewing,
    recordedBlob,
    previewStream,
    startPreview,
    stopPreview,
    startRecording,
    stopRecording,
    clearRecording,
    error,
  };
};
