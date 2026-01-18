import { useState, useCallback, DragEvent } from 'react';
import { Upload, FileVideo } from 'lucide-react';

interface VideoDropzoneProps {
  onFileSelect: (file: File) => void;
}

export const VideoDropzone = ({ onFileSelect }: VideoDropzoneProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOut = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/')) {
        onFileSelect(file);
      }
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  }, [onFileSelect]);

  return (
    <div
      className={`drop-zone cursor-pointer ${isDragging ? 'drop-zone-active' : 'hover:border-primary/50 hover:bg-muted/30'}`}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => document.getElementById('video-input')?.click()}
    >
      <input
        id="video-input"
        type="file"
        accept="video/*"
        onChange={handleFileInput}
        className="hidden"
      />
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="p-4 rounded-full bg-primary/10">
          {isDragging ? (
            <FileVideo className="w-10 h-10 text-primary" />
          ) : (
            <Upload className="w-10 h-10 text-primary" />
          )}
        </div>
        <div>
          <p className="text-lg font-medium text-foreground">
            {isDragging ? 'Drop your video here' : 'Drag & drop a video'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            or click to browse files
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          MP4, WebM, MOV supported
        </p>
      </div>
    </div>
  );
};
