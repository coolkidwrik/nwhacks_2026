import { useEffect, useRef } from 'react';
import { Video, Circle, Square, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVideoRecorder } from '@/hooks/useVideoRecorder';

interface VideoRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
}

export const VideoRecorder = ({ onRecordingComplete }: VideoRecorderProps) => {
  const {
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
  } = useVideoRecorder();

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && previewStream) {
      videoRef.current.srcObject = previewStream;
    }
  }, [previewStream]);

  useEffect(() => {
    if (recordedBlob) {
      onRecordingComplete(recordedBlob);
      clearRecording();
    }
  }, [recordedBlob, onRecordingComplete, clearRecording]);

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">{error}</p>
        <Button variant="secondary" className="mt-4" onClick={startPreview}>
          Try Again
        </Button>
      </div>
    );
  }

  if (!isPreviewing) {
    return (
      <Button
        onClick={startPreview}
        variant="outline"
        size="lg"
        className="w-full py-8 flex flex-col gap-3 h-auto border-dashed"
      >
        <div className="p-3 rounded-full bg-primary/10">
          <Video className="w-8 h-8 text-primary" />
        </div>
        <span className="text-lg font-medium">Record a video</span>
        <span className="text-sm text-muted-foreground">Use your camera</span>
      </Button>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
        {isRecording && (
          <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-destructive rounded-full">
            <Circle className="w-3 h-3 fill-current recording-pulse" />
            <span className="text-sm font-medium text-destructive-foreground">Recording</span>
          </div>
        )}
      </div>
      
      <div className="flex justify-center gap-4">
        {!isRecording ? (
          <Button onClick={startRecording} size="lg" className="gap-2">
            <Circle className="w-5 h-5 fill-current" />
            Start Recording
          </Button>
        ) : (
          <Button onClick={stopRecording} variant="destructive" size="lg" className="gap-2">
            <Square className="w-4 h-4 fill-current" />
            Stop Recording
          </Button>
        )}
        <Button onClick={stopPreview} variant="outline" size="lg" className="gap-2">
          <X className="w-5 h-5" />
          Cancel
        </Button>
      </div>
    </div>
  );
};
