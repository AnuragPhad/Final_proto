'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mic, User, Bot, Volume2, CircleStop } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { useLanguage } from '@/hooks/use-language';
import { useLocation } from '@/hooks/use-location';
import { voiceAssistant } from '@/ai/flows/voice-assistant-flow';
import { textToSpeech } from '@/ai/flows/tts';
import { Skeleton } from '../ui/skeleton';

interface Message {
  sender: 'user' | 'bot';
  text: string;
  audioDataUri?: string;
  isAudioLoading?: boolean;
}

export function VoiceAssistantDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { language, t } = useLanguage();
  const { location } = useLocation();
  const [conversation, setConversation] = useState<Message[]>([]);
  const [isResponding, setIsResponding] = useState(false);

  // Add initial message when dialog opens
  useEffect(() => {
    if (open) {
      setConversation([{ sender: 'bot', text: 'Hello! I am Kisan AI. How can I help you today?' }]);
    }
  }, [open]);

  const handleAiResponse = async (query: string) => {
    if (!query) return;

    setConversation(prev => [...prev, { sender: 'user', text: query }]);
    setIsResponding(true);

    try {
      const responseText = await voiceAssistant({
        query,
        language,
        location: location ? `${location.district}, ${location.state}` : 'Not available',
      });
      setConversation(prev => [...prev, { sender: 'bot', text: responseText, isAudioLoading: false }]);
    } catch (error) {
      console.error('Voice assistant error:', error);
      setConversation(prev => [...prev, { sender: 'bot', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsResponding(false);
    }
  };

  const { isListening, startListening, stopListening, transcript } = useSpeechRecognition({
    onTranscriptFinal: handleAiResponse
  });

  const handlePlayAudio = async (index: number) => {
    const message = conversation[index];
    if (!message || message.sender !== 'bot' || !message.text) return;
    
    // If audio is already loaded, just play it
    if (message.audioDataUri) {
      const audio = new Audio(message.audioDataUri);
      audio.play();
      return;
    }
    
    // Otherwise, load and play
    setConversation(prev => prev.map((msg, i) => i === index ? { ...msg, isAudioLoading: true } : msg));

    try {
      const { audioDataUri } = await textToSpeech({ text: message.text });
      setConversation(prev => prev.map((msg, i) => i === index ? { ...msg, audioDataUri, isAudioLoading: false } : msg));
      const audio = new Audio(audioDataUri);
      audio.play();
    } catch (error) {
      console.error('TTS error:', error);
      setConversation(prev => prev.map((msg, i) => i === index ? { ...msg, isAudioLoading: false } : msg));
    }
  };
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the bottom whenever the conversation updates
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [conversation]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="font-headline text-2xl flex items-center gap-2">
            <Bot /> Voice Assistant
          </DialogTitle>
          <DialogDescription>Your AI-powered farming assistant.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="relative overflow-hidden flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {conversation.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-start gap-3',
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.sender === 'bot' && <Avatar className="bg-primary text-primary-foreground"><Bot className="h-5 w-5" /></Avatar>}
                <div
                  className={cn(
                    'p-3 rounded-lg max-w-sm',
                    message.sender === 'user' ? 'bg-muted' : 'bg-primary/10'
                  )}
                >
                  <p className="text-sm">{message.text}</p>
                   {message.sender === 'bot' && index !== 0 && (
                      <Button variant="ghost" size="icon" className="h-6 w-6 mt-1" onClick={() => handlePlayAudio(index)} disabled={message.isAudioLoading}>
                          {message.isAudioLoading ? <CircleStop className="h-4 w-4 animate-pulse" /> : <Volume2 className="h-4 w-4" />}
                      </Button>
                  )}
                </div>
                {message.sender === 'user' && <Avatar className="bg-muted"><User className="h-5 w-5" /></Avatar>}
              </div>
            ))}
            {isResponding && (
                <div className="flex items-start gap-3 justify-start">
                    <Avatar className="bg-primary text-primary-foreground"><Bot className="h-5 w-5" /></Avatar>
                    <div className="p-3 rounded-lg max-w-sm bg-primary/10">
                        <Skeleton className="h-4 w-8" />
                    </div>
                </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t flex flex-col items-center justify-center">
            {isListening && <p className="text-sm text-muted-foreground mb-2 h-5">{transcript || "Listening..."}</p>}
            {!isListening && <p className="h-5 mb-2"></p>}
            <Button
                onClick={isListening ? stopListening : startListening}
                className={cn(
                    'rounded-full h-20 w-20 p-0 shadow-lg transition-transform transform hover:scale-110',
                    isListening ? 'bg-destructive animate-pulse' : 'bg-primary'
                )}
                aria-label={isListening ? 'Stop listening' : 'Start voice search'}
            >
                <Mic className="h-8 w-8" />
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Simple Avatar placeholder
const Avatar = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={cn("h-10 w-10 rounded-full flex items-center justify-center shrink-0", className)}>
        {children}
    </div>
)
