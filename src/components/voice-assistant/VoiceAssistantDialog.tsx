
'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mic, Bot, User, Volume2, CornerDownLeft } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { useLanguage } from '@/hooks/use-language';
import { useLocation } from '@/hooks/use-location';
import { useToast } from '@/hooks/use-toast';
import { voiceAssistant } from '@/ai/flows/voice-assistant-flow';
import { textToSpeech } from '@/ai/flows/tts';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Input } from '../ui/input';
import { Skeleton } from '../ui/skeleton';

interface Message {
  id: number;
  type: 'user' | 'bot';
  text: string;
  audioDataUri?: string | null;
  isSpeaking?: boolean;
}

export default function VoiceAssistantDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { language } = useLanguage();
  const { location } = useLocation();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleAiResponse = async (query: string) => {
    if (!query) return;
    
    setIsThinking(true);
    setMessages(prev => [...prev, { id: Date.now(), type: 'user', text: query }]);

    try {
        const assistantResponse = await voiceAssistant({
            query: query,
            location: location ? `${location.district}, ${location.state}` : undefined,
            language: language
        });
        
        const { audioDataUri } = await textToSpeech({ text: assistantResponse });

        setMessages(prev => [...prev, {
            id: Date.now() + 1,
            type: 'bot',
            text: assistantResponse,
            audioDataUri: audioDataUri,
            isSpeaking: false,
        }]);

    } catch (err: any) {
        console.error(err);
        toast({ variant: 'destructive', title: 'AI Error', description: err.message || 'An error occurred.'});
        setMessages(prev => [...prev, {
            id: Date.now() + 1,
            type: 'bot',
            text: 'Sorry, I encountered an error. Please try again.',
        }]);
    } finally {
        setIsThinking(false);
    }
  }

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    error: speechError,
    hasRecognitionSupport,
  } = useSpeechRecognition({ onTranscriptFinal: handleAiResponse });
  
  useEffect(() => {
    if(speechError) toast({ variant: 'destructive', title: 'Speech Error', description: speechError });
  }, [speechError, toast]);
  
  useEffect(() => {
    if (open) {
        setMessages([{
            id: 1,
            type: 'bot',
            text: 'Hello! I am Kisan AI. How can I help you today?',
        }]);
    }
  }, [open]);

  const handlePlayAudio = (messageId: number) => {
    const message = messages.find(m => m.id === messageId);
    if (message && message.audioDataUri && audioRef.current) {
      audioRef.current.src = message.audioDataUri;
      audioRef.current.play();
      setMessages(msgs => msgs.map(m => m.id === messageId ? { ...m, isSpeaking: true } : { ...m, isSpeaking: false }));
      audioRef.current.onended = () => {
         setMessages(msgs => msgs.map(m => ({ ...m, isSpeaking: false })));
      }
    }
  };
  
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
        handleAiResponse(inputValue);
        setInputValue('');
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="flex items-center gap-2 font-headline"><Mic /> Voice Assistant</DialogTitle>
          <DialogDescription>Your AI-powered farming assistant.</DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6">
            {messages.map(message => (
              <div key={message.id} className={cn("flex items-start gap-3", message.type === 'user' && 'justify-end')}>
                {message.type === 'bot' && (
                  <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                    <AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback>
                  </Avatar>
                )}
                <div className={cn(
                    "max-w-md p-3 rounded-lg flex items-center gap-2", 
                    message.type === 'user' ? 'bg-muted' : 'bg-card border')}>
                   <p className="text-sm">{message.text}</p>
                   {message.type === 'bot' && message.audioDataUri && (
                     <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handlePlayAudio(message.id)}>
                        <Volume2 className={cn("h-4 w-4", message.isSpeaking && "text-primary animate-pulse")} />
                     </Button>
                   )}
                </div>
                {message.type === 'user' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback><User className="h-5 w-5"/></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isThinking && (
                <div className="flex items-start gap-3">
                   <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                    <AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback>
                  </Avatar>
                   <div className="max-w-md p-3 rounded-lg bg-card border">
                     <Skeleton className="h-4 w-24" />
                   </div>
                </div>
            )}
          </div>
        </ScrollArea>
        
        <DialogFooter className="p-4 border-t flex-col sm:flex-col sm:space-x-0 items-center gap-2">
            <div className="flex items-center justify-center mb-2">
                <Button 
                onClick={isListening ? stopListening : startListening}
                className={cn(
                    "rounded-full h-16 w-16 p-0 shadow-lg transition-transform transform hover:scale-110",
                    isListening ? 'bg-destructive animate-pulse' : 'bg-primary'
                )}
                >
                    <Mic className="h-8 w-8" />
                </Button>
            </div>
           <p className="text-xs text-center text-muted-foreground">
                {isListening ? (transcript || 'Listening...') : (hasRecognitionSupport ? 'Tap to speak, or type below.' : 'Voice not supported. Type below.')}
            </p>
           <form onSubmit={handleFormSubmit} className="w-full flex gap-2">
            <Input 
                placeholder="Type your message..."
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                disabled={isListening || isThinking}
            />
            <Button type="submit" disabled={isListening || isThinking || !inputValue.trim()}>
                <CornerDownLeft className="h-4 w-4"/>
            </Button>
           </form>
        </DialogFooter>

        <audio ref={audioRef} className="hidden" />
      </DialogContent>
    </Dialog>
  )
}
