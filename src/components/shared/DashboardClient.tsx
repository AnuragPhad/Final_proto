'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Carrot, HeartPulse, ScrollText, Settings, BrainCircuit, Tractor, Users, Mic, Bot, Volume2 } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { useCallback, useEffect, useRef, useState } from 'react';
import { MandiRateQueryOutput, understandMandiRateQuery } from '@/ai/flows/mandi-rate-nlu';
import { getMandiRates } from '@/data/mandi-rates';
import { mandiRateSummary } from '@/ai/flows/mandi-rate-summary';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { format } from 'date-fns';
import { textToSpeech } from '@/ai/flows/tts';

export default function DashboardClient() {
  const { t, language } = useLanguage();
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [audioDataUri, setAudioDataUri] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const handleVoiceSearch = async (query: string) => {
    if (!query) return;
    setIsProcessing(true);
    setAiResponse(t.listening);
    
    try {
      const nluResult = await understandMandiRateQuery({ query });
      setAiResponse(`Fetching rates for ${nluResult.commodity}...`);

      const rates = await getMandiRates('Maharashtra', nluResult.market || 'Pune'); // Default to Pune if no market is mentioned
      
      const ratesForSummary = rates.filter(rate => {
        const [day, month, year] = rate.arrival_date.split('/');
        const apiDate = new Date(Number(year), Number(month) - 1, Number(day));
        const isToday = format(apiDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
        const isCommodityMatch = rate.commodity.toLowerCase().includes(nluResult.commodity.toLowerCase());
        return isToday && isCommodityMatch;
      });

      const summaryResult = await mandiRateSummary({
        commodity: nluResult.commodity,
        district: nluResult.market || 'Pune',
        date: format(new Date(), 'do MMMM yyyy'),
        rates: ratesForSummary.map(r => ({
            market: r.market,
            minPrice: r.minPrice,
            maxPrice: r.maxPrice,
            modalPrice: r.modalPrice,
        })),
        language: language,
      });

      setAiResponse(summaryResult.summary);
      
    } catch (e: any) {
      console.error(e);
      toast({ variant: 'destructive', title: 'AI Error', description: e.message || 'Could not process your voice command.' });
      setAiResponse('Sorry, I had trouble understanding. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    error: speechError,
    hasRecognitionSupport,
  } = useSpeechRecognition({onTranscript: handleVoiceSearch});
  
  useEffect(() => {
    if (speechError) {
      toast({ variant: 'destructive', title: 'Speech Error', description: speechError });
    }
  }, [speechError, toast]);

  const handlePlaySummary = useCallback(async () => {
    if (!aiResponse || isProcessing) return;

    setIsProcessing(true);
    setAudioDataUri(null);
    try {
      const { audioDataUri } = await textToSpeech({ text: aiResponse });
      setAudioDataUri(audioDataUri);
    } catch (e: any) {
      console.error("TTS error", e);
      toast({ variant: 'destructive', title: 'Audio Error', description: e.message || 'Could not generate audio for the summary.' });
    } finally {
      setIsProcessing(false);
    }
  }, [aiResponse, isProcessing, toast]);

  useEffect(() => {
    if (audioDataUri && audioRef.current) {
        audioRef.current.play();
    }
  }, [audioDataUri]);

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
      <div className="mb-8 text-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter mb-2">
          {t.welcome_to_kisan_ai}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t.welcome_subtitle}
        </p>
      </div>

       <Card className="mb-8">
          <CardHeader>
              <CardTitle className="font-headline text-xl">Voice Assistant</CardTitle>
              <CardDescription>Tap the microphone to ask for market rates.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4">
              {hasRecognitionSupport ? (
              <>
                  <Button 
                      onClick={isListening ? stopListening : startListening} 
                      className={cn(
                          'rounded-full h-24 w-24 p-0 shadow-lg transition-transform transform hover:scale-110', 
                          isListening ? 'bg-destructive animate-pulse' : 'bg-primary'
                      )}
                      aria-label={isListening ? 'Stop listening' : 'Start voice search'}
                      disabled={isProcessing}
                  >
                      <Mic className="h-10 w-10" />
                  </Button>
                  <p className="text-sm text-muted-foreground h-4">
                      {isListening ? `${t.listening} "${transcript}"` : (isProcessing ? aiResponse : t.tap_to_search_voice)}
                  </p>
              </>
              ) : (
                  <p className="text-destructive">{t.voice_search_not_supported}</p>
              )}

              {aiResponse && !isListening && !isProcessing && (
                  <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 w-full">
                      <Bot className="h-4 w-4 text-blue-600" />
                      <div className='flex items-center justify-between'>
                          <AlertTitle className="font-headline text-blue-800 dark:text-blue-300">{t.ai_summary}</AlertTitle>
                          <Button variant="ghost" size="icon" onClick={handlePlaySummary} disabled={isProcessing}>
                              <Volume2 className={cn("h-5 w-5 text-blue-600", isProcessing && "animate-pulse")} />
                          </Button>
                      </div>
                      <AlertDescription className="text-blue-700 dark:text-blue-400">
                          {aiResponse}
                      </AlertDescription>
                  </Alert>
              )}
               {audioDataUri && <audio ref={audioRef} src={audioDataUri} className="hidden" onEnded={() => setAudioDataUri(null)} />}
          </CardContent>
      </Card>


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
