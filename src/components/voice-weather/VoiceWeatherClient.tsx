'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Sun, Cloud, Mic, Loader2, Volume2 } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { useToast } from '@/hooks/use-toast';
import { getWeatherVoiceSummary } from '@/ai/flows/weather-voice-flow';

export default function VoiceWeatherClient() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [audioDataUri, setAudioDataUri] = React.useState<string | null>(null);
  const [weatherSummary, setWeatherSummary] = React.useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const handleFetchWeather = () => {
    setIsLoading(true);
    setAudioDataUri(null);
    setWeatherSummary(null);

    if (!navigator.geolocation) {
      toast({
        variant: 'destructive',
        title: 'Geolocation Not Supported',
        description: 'Your browser does not support geolocation.',
      });
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const result = await getWeatherVoiceSummary({
            latitude,
            longitude,
            language,
          });
          setWeatherSummary(result.summary);
          setAudioDataUri(result.audioDataUri);
        } catch (error: any) {
          console.error('Error fetching weather voice summary:', error);
          toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message || 'Failed to get weather summary.',
          });
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast({
          variant: 'destructive',
          title: 'Location Error',
          description: 'Could not get your location. Please ensure you have granted permission.',
        });
        setIsLoading(false);
      }
    );
  };
  
  React.useEffect(() => {
    if (audioDataUri && audioRef.current) {
        audioRef.current.play().catch(e => console.error("Audio play failed", e));
    }
  }, [audioDataUri]);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tighter">
            Voice Weather
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-2">
            Click the button to hear the current weather conditions for your location.
          </p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit mb-4">
                 <Sun className="h-16 w-16 text-primary" />
            </div>
            <CardTitle className="font-headline text-2xl">Current Weather Report</CardTitle>
            <CardDescription>Get an instant audio summary of the weather.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button
              onClick={handleFetchWeather}
              disabled={isLoading}
              size="lg"
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Fetching Weather...
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-5 w-5" />
                  Get Voice Weather Report
                </>
              )}
            </Button>
            
            {weatherSummary && (
                <Alert className="mt-6 text-left">
                    <Volume2 className="h-4 w-4" />
                    <AlertTitle>AI Weather Summary</AlertTitle>
                    <AlertDescription>
                        {weatherSummary}
                    </AlertDescription>
                </Alert>
            )}

            {audioDataUri && (
                <audio ref={audioRef} src={audioDataUri} className="hidden" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
