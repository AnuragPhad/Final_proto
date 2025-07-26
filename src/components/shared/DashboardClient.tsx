
'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Carrot, HeartPulse, ScrollText, Settings, BrainCircuit, Tractor, Users, Mic, Send, Bot, Volume2, Sparkles, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { conversationalChat } from '@/ai/flows/conversational-chat-flow';
import { textToSpeech } from '@/ai/flows/tts';
import { useState, useRef, useEffect, FormEvent } from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function DashboardClient() {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();
  
  const handleAudioResponse = async (text: string) => {
      if (!text || isSpeaking) return;
      setIsSpeaking(true);
      try {
        const { audioDataUri } = await textToSpeech({ text });
        if (audioRef.current) {
          audioRef.current.src = audioDataUri;
          audioRef.current.play();
        }
      } catch (e) {
        console.error("TTS Error", e);
        toast({
          variant: 'destructive',
          title: 'Audio Error',
          description: 'Could not play the audio response.'
        });
      } finally {
        setIsSpeaking(false);
      }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement> | string) => {
    if (typeof e !== 'string') {
      e.preventDefault();
    }
    const query = typeof e === 'string' ? e : input;
    if (!query.trim()) return;

    setInput('');
    const userMessage: Message = { role: 'user', content: query };
    setMessages(prev => [...prev, userMessage]);
    setIsThinking(true);

    try {
      const result = await conversationalChat({ query, language });
      const assistantMessage: Message = { role: 'assistant', content: result.response };
      setMessages(prev => [...prev, assistantMessage]);
      handleAudioResponse(result.response);
    } catch (err) {
      console.error("Chatbot error", err);
      const errorMessage: Message = { role: 'assistant', content: "Sorry, I couldn't process that. Please try again." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  const {
    isListening,
    startListening,
    stopListening,
    error: speechError,
    hasRecognitionSupport
  } = useSpeechRecognition({
      onTranscript: (transcript) => {
        handleSubmit(transcript);
      }
  });

  useEffect(() => {
    if (speechError) {
      toast({
        variant: 'destructive',
        title: 'Voice Error',
        description: `There was an issue with speech recognition: ${speechError}`
      });
    }
  }, [speechError, toast]);

  const features = [
    {
      title: t.mandi_rates_title,
      description: t.mandi_rates_desc,
      href: '/mandi-rates',
      icon: <Carrot className="h-8 w-8 text-primary" />,
    },
    {
      title: t.crop_doctor_title,
      description: t.crop_doctor_desc,
      href: '/crop-doctor',
      icon: <HeartPulse className="h-8 w-8 text-primary" />,
    },
    {
        title: t.my_farm_title,
        description: t.my_farm_desc,
        href: '/my-farm',
        icon: <Tractor className="h-8 w-8 text-primary" />,
    },
    {
        title: t.community_title,
        description: t.community_desc,
        href: '/community',
        icon: <Users className="h-8 w-8 text-primary" />,
    },
    {
      title: t.market_intel_title,
      description: t.market_intel_desc,
      href: '/market-intelligence',
      icon: <BrainCircuit className="h-8 w-8 text-primary" />,
    },
    {
      title: t.govt_schemes_title,
      description: t.govt_schemes_desc,
      href: '/schemes',
      icon: <ScrollText className="h-8 w-8 text-primary" />,
    },
    {
      title: t.settings_title,
      description: t.settings_desc,
      href: '/settings',
      icon: <Settings className="h-8 w-8 text-primary" />,
    },
  ];

  return (
    <div className="container mx-auto p-4 md:p-8">
       <div className="text-center mb-8">
          <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter mb-2">
            {t.welcome_to_kisan_ai}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.welcome_subtitle}
          </p>
        </div>
        
        <Accordion type="single" collapsible className="w-full mb-8" defaultValue="item-1">
          <AccordionItem value="item-1" className="border-none">
              <AccordionTrigger asChild>
                  <Card className="p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                     <div className="flex justify-between items-center">
                       <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                          <Bot className="h-8 w-8 text-primary animate-pulse" />
                        </div>
                        <div>
                           <h2 className="font-headline text-xl font-semibold">Kisan AI Assistant</h2>
                           <p className="text-sm text-muted-foreground">Tap to ask a question with your voice.</p>
                        </div>
                       </div>
                       <Sparkles className="h-6 w-6 text-yellow-500 animate-sparkle" />
                     </div>
                  </Card>
              </AccordionTrigger>
              <AccordionContent className="pt-2">
                <Card className="h-[450px] flex flex-col">
                  <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, index) => (
                      <div key={index} className={cn("flex items-start gap-3", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                        {msg.role === 'assistant' && <Avatar className="h-8 w-8 bg-primary text-primary-foreground flex items-center justify-center"><Bot className="h-5 w-5" /></Avatar>}
                        <div className={cn("max-w-xs md:max-w-md p-3 rounded-lg", msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none')}>
                          <p className="text-sm">{msg.content}</p>
                          {msg.role === 'assistant' && (
                            <Button variant="ghost" size="icon" className="h-6 w-6 mt-1" onClick={() => handleAudioResponse(msg.content)} disabled={isSpeaking}>
                              <Volume2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                     {isThinking && (
                        <div className="flex items-start gap-3 justify-start">
                           <Avatar className="h-8 w-8 bg-primary text-primary-foreground flex items-center justify-center"><Bot className="h-5 w-5" /></Avatar>
                           <div className="max-w-xs md:max-w-md p-3 rounded-lg bg-muted rounded-bl-none">
                              <p className="text-sm text-muted-foreground animate-pulse">Thinking...</p>
                           </div>
                        </div>
                     )}
                  </CardContent>
                  <CardFooter className="border-t p-2">
                    <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
                      <Input 
                        placeholder="Type your question here..." 
                        value={input} 
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isListening || isThinking}
                      />
                       {hasRecognitionSupport ? (
                        <Button type="button" size="icon" onClick={isListening ? stopListening : startListening} disabled={isThinking} className={cn(isListening && 'bg-destructive')}>
                          <Mic className="h-5 w-5" />
                        </Button>
                       ) : (
                         <Button type="button" size="icon" disabled>
                           <AlertCircle className="h-5 w-5" />
                         </Button>
                       )}
                      <Button type="submit" size="icon" disabled={!input.trim() || isListening || isThinking}>
                        <Send className="h-5 w-5" />
                      </Button>
                    </form>
                  </CardFooter>
                </Card>
              </AccordionContent>
          </AccordionItem>
        </Accordion>
        <audio ref={audioRef} className="hidden" onEnded={() => setIsSpeaking(false)} />


      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature) => (
          <Link href={feature.href} key={feature.href} className="group">
            <Card className="h-full transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl hover:border-primary/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="font-headline text-xl font-semibold">{feature.title}</CardTitle>
                {feature.icon}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
