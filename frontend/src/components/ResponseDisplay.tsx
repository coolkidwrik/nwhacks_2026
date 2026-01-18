import { CheckCircle, AlertCircle, Copy, Check, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface AnalysisResponse {
  feedback: string;
  reference_frames: number;
  user_frames: number;
  error?: string;
}

interface ResponseDisplayProps {
  response: AnalysisResponse | null;
  error: string | null;
}

export const ResponseDisplay = ({ response, error }: ResponseDisplayProps) => {
  const [copied, setCopied] = useState(false);

  if (!response && !error) return null;

  const handleCopy = async () => {
    if (response) {
      await navigator.clipboard.writeText(response.feedback);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (error) {
    return (
      <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-destructive">Error</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (response?.error) {
    return (
      <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-destructive">Analysis Error</p>
            <p className="text-sm text-muted-foreground mt-1">{response.error}</p>
          </div>
        </div>
      </div>
    );
  }

  const feedbackLower = response?.feedback?.toLowerCase() || '';
  const isExcellentForm = feedbackLower.includes('excellent') || feedbackLower.includes('closely matches') || feedbackLower.includes('great form') || feedbackLower.includes('good job');

  return (
    <div className="space-y-4">
      {/* Analysis Stats */}
      <div className="p-3 bg-muted/20 border border-border/30 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Info className="w-4 h-4 text-primary" />
          <span>Analyzed <span className="text-foreground font-medium">{response?.reference_frames}</span> reference frames and <span className="text-foreground font-medium">{response?.user_frames}</span> user frames</span>
        </div>
      </div>

      {/* Feedback */}
      <div className={`p-5 border rounded-lg ${
        isExcellentForm 
          ? 'bg-success/10 border-success/30' 
          : 'bg-primary/5 border-primary/20'
      }`}>
        <div className="flex items-start gap-3">
          <CheckCircle className={`w-6 h-6 shrink-0 mt-0.5 ${
            isExcellentForm ? 'text-success' : 'text-primary'
          }`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className={`font-bold text-lg ${
                isExcellentForm ? 'text-success' : 'text-primary'
              }`}>
                {isExcellentForm ? '🏆 Perfect Form!' : '💪 Coach Feedback'}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-7 px-2 text-muted-foreground hover:text-foreground"
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <div className="mt-2">
              <p className="text-sm text-foreground bg-background/50 p-3 rounded-lg whitespace-pre-wrap">
                {response?.feedback}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
