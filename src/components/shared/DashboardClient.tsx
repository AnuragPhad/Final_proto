'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Carrot, HeartPulse, ScrollText, Settings, BrainCircuit, Tractor, Users, Mic, Bot } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { useState } from 'react';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from '@/hooks/use-location';
import { understandMandiRateQuery } from '@/ai/flows/mandi-rate-nlu';
import { getMandiRates } from '@/data/mandi-rates';
import { format } from 'date-fns';
import { mandiRateSummary } from '@/ai/flows/mandi-rate-summary';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

export default function DashboardClient() {
  const { t, language } = useLanguage();
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const { toast } = useToast();
  const { location } = useLocation();

  const handleVoiceSearch = async (query: string) => {
    if (!query) return;
    setIsSummarizing(true);
    setAiSummary(t.listening);

    if (!location) {
      toast({ variant: 'destructive', title: 'Location not available', description: 'Please enable location services.' });
      setAiSummary('Location not available. Please enable location services to use voice search.');
      setIsSummarizing(false);
      return;
    }

    try {
      const nluResult = await understandMandiRateQuery({ query });
      setAiSummary(nluResult.summary);
      
      const commodity = nluResult.commodity;
      const targetState = nluResult.state || location.state;
      const targetDistrict = nluResult.market || location.district;
      
      const rates = await getMandiRates(targetState, targetDistrict);
      const today = new Date();

       const ratesForSummary = rates.filter(rate => {
            const [day, month, year] = rate.arrival_date.split('/');
            const apiDate = new Date(Number(year), Number(month) - 1, Number(day));
            return format(apiDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd') && rate.commodity.toLowerCase().includes(commodity.toLowerCase());
        });
        
        const summaryResult = await mandiRateSummary({
            commodity: commodity,
            district: targetDistrict,
            date: format(today, 'do MMMM yyyy'),
            rates: ratesForSummary.map(r => ({
                market: r.market,
                minPrice: r.minPrice,
                maxPrice: r.maxPrice,
                modalPrice: r.modalPrice,
            })),
            language: language
        });
        setAiSummary(summaryResult.summary);

    } catch (e: any) {
        console.error(e);
        toast({ variant: 'destructive', title: 'AI Error', description: e.message || 'Could not process your voice command.' });
        setAiSummary('Sorry, I had trouble understanding. Please try again.');
    } finally {
        setIsSummarizing(false);
    }
  };
 
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    hasRecognitionSupport,
  } = useSpeechRecognition({onTranscriptFinal: handleVoiceSearch});

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
        
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {hasRecognitionSupport && (
          <Card className="sm:col-span-2 lg:col-span-3 bg-primary/10 border-primary/20">
            <CardHeader>
              <CardTitle className="font-headline text-xl font-semibold">Quick Voice Search</CardTitle>
              <CardDescription>Tap the button and ask a question like "What is the price of onions today?"</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center gap-4">
               <Button 
                onClick={isListening ? stopListening : startListening} 
                className={`rounded-full h-20 w-20 p-0 shadow-lg transition-transform transform hover:scale-110 ${isListening ? 'bg-destructive animate-pulse' : 'bg-primary'}`}
                aria-label={isListening ? 'Stop listening' : 'Start voice search'}
              >
                <Mic className="h-8 w-8" />
              </Button>
               <p className="text-sm text-muted-foreground h-4">
                {isListening && `${t.listening} "${transcript}"`}
              </p>

              {(aiSummary || isSummarizing) && (
                <Alert className="mt-4 bg-background/50">
                    <Bot className="h-4 w-4" />
                      <AlertTitle className="font-headline">{t.ai_summary}</AlertTitle>
                    <AlertDescription>
                      {isSummarizing && !transcript ? 'Listening...' : aiSummary}
                    </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}


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
