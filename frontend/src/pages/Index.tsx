import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VideoDropzone } from '@/components/VideoDropzone';
import { VideoRecorder } from '@/components/VideoRecorder';
import { VideoPreview } from '@/components/VideoPreview';
import { ResponseDisplay } from '@/components/ResponseDisplay';
import { analyzeVideos, type AnalysisResponse } from '@/services/videoApi';

const Index = () => {
  const [referenceVideo, setReferenceVideo] = useState<File | Blob | null>(null);
  const [userVideo, setUserVideo] = useState<File | Blob | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [response, setResponse] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleReferenceVideoSelect = (file: File | Blob) => {
    setReferenceVideo(file);
    setResponse(null);
    setError(null);
  };

  const handleUserVideoSelect = (file: File | Blob) => {
    setUserVideo(file);
    setResponse(null);
    setError(null);
  };

  const handleClear = () => {
    setReferenceVideo(null);
    setUserVideo(null);
    setResponse(null);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!referenceVideo || !userVideo) return;

    setIsAnalyzing(true);
    setError(null);
    setResponse(null);

    try {
      const result = await analyzeVideos(referenceVideo, userVideo);
      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze videos');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <img 
              src="/content.png" 
              alt="Form Check Logo" 
              className="w-10 h-10 rounded-lg object-contain mix-blend-screen"
            />
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">Form Check</h1>
              <p className="text-sm text-muted-foreground">Perfect your technique</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-4xl mx-auto px-4 py-8">
        <div className="glass-panel p-6 space-y-6">
          {(!referenceVideo || !userVideo || (!response && !error)) ? (
            <>
              {/* Reference Video Section */}
              <div>
                <h2 className="text-lg font-medium mb-4 text-foreground">
                  Reference Video {referenceVideo && "✓"}
                </h2>
                {referenceVideo ? (
                  <VideoPreview video={referenceVideo} onClear={() => setReferenceVideo(null)} />
                ) : (
                  <>
                    <VideoDropzone onFileSelect={handleReferenceVideoSelect} />
                    <div className="flex items-center gap-4 my-4">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-sm text-muted-foreground">or</span>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                    <VideoRecorder onRecordingComplete={handleReferenceVideoSelect} />
                  </>
                )}
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-sm text-muted-foreground">then</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* User Video Section */}
              <div>
                <h2 className="text-lg font-medium mb-4 text-foreground">
                  Your Video {userVideo && "✓"}
                </h2>
                {userVideo ? (
                  <VideoPreview video={userVideo} onClear={() => setUserVideo(null)} />
                ) : (
                  <>
                    <VideoDropzone onFileSelect={handleUserVideoSelect} />
                    <div className="flex items-center gap-4 my-4">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-sm text-muted-foreground">or</span>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                    <VideoRecorder onRecordingComplete={handleUserVideoSelect} />
                  </>
                )}
              </div>

              {/* Submit Button */}
              {referenceVideo && userVideo && (
                <Button
                  onClick={handleSubmit}
                  disabled={isAnalyzing}
                  size="lg"
                  className="w-full gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Analyze Videos
                    </>
                  )}
                </Button>
              )}
            </>
          ) : (
            <>
              {/* Analysis Results */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium text-foreground">Analysis Complete</h2>
                  <Button variant="outline" onClick={handleClear}>
                    Start Over
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Reference Video</h3>
                    <VideoPreview video={referenceVideo} onClear={() => {}} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Your Video</h3>
                    <VideoPreview video={userVideo} onClear={() => {}} />
                  </div>
                </div>

                {/* Response Display */}
                <ResponseDisplay response={response} error={error} />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 p-4 bg-muted/20 rounded-lg border border-border/30">
          <p className="text-xs text-muted-foreground text-center">
            Powered by Heated Rivalries • <span className="text-primary font-medium">Form Check</span>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;
