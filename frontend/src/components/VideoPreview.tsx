import { useMemo } from 'react';
import { X, FileVideo } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoPreviewProps {
  video: File | Blob;
  onClear: () => void;
}

export const VideoPreview = ({ video, onClear }: VideoPreviewProps) => {
  const videoUrl = useMemo(() => URL.createObjectURL(video), [video]);
  const fileName = video instanceof File ? video.name : 'Recording.webm';
  const fileSize = (video.size / (1024 * 1024)).toFixed(2);

  return (
    <div className="space-y-4">
      <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
        <video
          src={videoUrl}
          controls
          className="w-full h-full object-contain"
        />
        <Button
          onClick={onClear}
          variant="destructive"
          size="icon"
          className="absolute top-3 right-3 rounded-full"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
        <div className="p-2 bg-primary/10 rounded-lg">
          <FileVideo className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{fileName}</p>
          <p className="text-xs text-muted-foreground">{fileSize} MB</p>
        </div>
      </div>
    </div>
  );
};
