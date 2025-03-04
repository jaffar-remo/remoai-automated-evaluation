
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Play, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  isSubmitting?: boolean;
  className?: string;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onRecordingComplete,
  isSubmitting = false,
  className,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      // Cleanup
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    audioChunksRef.current = [];
    setAudioUrl(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        onRecordingComplete(audioBlob);
        
        // Stop all tracks from the stream
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error('Error accessing microphone:', err);
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to record your answer.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handlePlayback = () => {
    const audio = new Audio(audioUrl!);
    audio.play();
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-col items-center justify-center space-y-4">
        {isRecording ? (
          <div className="flex items-center justify-center h-16 mb-2">
            <div className="flex space-x-1 items-end">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "w-1.5 bg-primary rounded-full",
                    `animate-wave-${i} h-8`
                  )}
                />
              ))}
            </div>
          </div>
        ) : audioUrl ? (
          <div className="flex items-center justify-center h-16 mb-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handlePlayback}
              className="h-12 w-12 rounded-full"
            >
              <Play className="h-6 w-6" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center h-16 mb-2">
            <div className="text-muted-foreground text-sm">
              Click record to start
            </div>
          </div>
        )}

        <div className="flex items-center gap-4">
          {!isRecording && !audioUrl && (
            <Button
              onClick={startRecording}
              variant="default"
              size="lg"
              className="rounded-full px-6 shadow-lg"
              disabled={isSubmitting}
            >
              <Mic className="h-5 w-5 mr-2" />
              Record Answer
            </Button>
          )}

          {isRecording && (
            <Button
              onClick={stopRecording}
              variant="destructive"
              size="lg"
              className="rounded-full px-6 shadow-lg animate-pulse-recording"
            >
              <Square className="h-5 w-5 mr-2" />
              Stop Recording ({formatTime(recordingTime)})
            </Button>
          )}

          {isSubmitting && (
            <Button disabled className="rounded-full px-6 shadow-lg">
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Evaluating your answer...
            </Button>
          )}
        </div>

        {audioUrl && !isSubmitting && (
          <div className="text-sm text-muted-foreground mt-2">
            Recording completed
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioRecorder;
