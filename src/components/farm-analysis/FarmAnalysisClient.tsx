
'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Upload, Bot, Droplets, Cloud, Trees } from 'lucide-react';
import { farmVideoAnalysis, FarmVideoAnalysisOutput } from '@/ai/flows/farm-video-analysis';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/hooks/use-language';
import { Separator } from '../ui/separator';

type AnalysisResult = FarmVideoAnalysisOutput;

const LoadingSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </CardHeader>
    <CardContent className="space-y-4">
      <Skeleton className="h-20 w-full" />
      <Separator />
      <div className="space-y-2">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </CardContent>
  </Card>
);

export default function FarmAnalysisClient() {
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { language, t } = useLanguage();

  const handleVideoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        toast({
          variant: 'destructive',
          title: 'File too large',
          description: 'Please upload a video smaller than 50MB.',
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreview(URL.createObjectURL(file));
        setVideoFile(file);
        setAnalysisResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!videoFile) return;

    setIsLoading(true);
    setError(null);

    try {
        const reader = new FileReader();
        reader.readAsDataURL(videoFile);
        reader.onload = async (e) => {
            try {
                const videoDataUri = e.target?.result as string;
                if (!videoDataUri) {
                    throw new Error("Could not read video file.");
                }
                const result = await farmVideoAnalysis({
                    videoDataUri: videoDataUri,
                    language: language,
                });
                setAnalysisResult(result);
            } catch (aiError) {
                setError('Failed to analyze the video. The AI model may be unavailable or the video format is not supported.');
                toast({
                  variant: 'destructive',
                  title: 'Analysis Failed',
                  description: 'An error occurred while communicating with the AI. Please try another video.',
                });
                console.error(aiError);
            } finally {
                setIsLoading(false);
            }
        };
        reader.onerror = () => {
            setError("Failed to read video file.");
            setIsLoading(false);
        }
    } catch (e) {
      setError('An unexpected error occurred. Please try again.');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred.',
      });
      console.error(e);
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="text-center mb-8">
        <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tighter">{t.farm_analysis_title}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-2">
          {t.farm_analysis_subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <Card className="lg:col-span-1 sticky top-24">
          <CardHeader>
            <CardTitle>{t.upload_farm_video}</CardTitle>
            <CardDescription>{t.upload_farm_video_desc}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="w-full aspect-video rounded-lg border-2 border-dashed border-muted-foreground/50 flex items-center justify-center bg-muted/20 overflow-hidden">
                {videoPreview ? (
                  <video src={videoPreview} controls className="object-contain h-full w-full" />
                ) : (
                  <div className="text-center text-muted-foreground">
                    <Upload className="mx-auto h-12 w-12" />
                    <p>{t.video_preview_placeholder}</p>
                  </div>
                )}
              </div>
              <Input type="file" accept="video/*" ref={fileInputRef} onChange={handleVideoChange} className="hidden" />
              <div className="flex gap-2">
                <Button onClick={() => fileInputRef.current?.click()} className="w-full">
                  <Upload className="mr-2 h-4 w-4" /> {t.choose_video}
                </Button>
              </div>
              <Button onClick={handleAnalyze} disabled={!videoFile || isLoading} className="w-full">
                {isLoading ? t.analyzing : t.analyze_farm_video}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-1">
          {isLoading && <LoadingSkeleton />}
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {analysisResult && (
            <Card className="shadow-lg border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="font-headline text-2xl flex items-center gap-2">
                      <Bot /> {t.ai_analysis_report}
                    </CardTitle>
                </div>
                <CardDescription>
                  {analysisResult.overall_summary}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Separator />
                <div>
                  <h3 className="font-headline font-semibold flex items-center gap-2 mb-2"><Trees /> {t.crop_analysis}</h3>
                  <p className="text-sm text-muted-foreground">{analysisResult.crop_analysis}</p>
                </div>
                <div>
                  <h3 className="font-headline font-semibold flex items-center gap-2 mb-2"><Droplets /> {t.water_analysis}</h3>
                  <p className="text-sm text-muted-foreground">{analysisResult.water_analysis}</p>
                </div>
                <div>
                  <h3 className="font-headline font-semibold flex items-center gap-2 mb-2"><Cloud /> {t.weather_analysis}</h3>
                  <p className="text-sm text-muted-foreground">{analysisResult.weather_analysis}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

    