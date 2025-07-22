
'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Upload, Camera, Bot, Sprout, TestTube2, CloudSun, Map } from 'lucide-react';
import { cropDoctorInitialAnalysis, CropDoctorInitialAnalysisOutput } from '@/ai/flows/crop-doctor-initial-analysis';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/hooks/use-language';

interface AnalysisResult extends CropDoctorInitialAnalysisOutput {
  healthStatus: string;
  organicSolutions: string[];
  inorganicSolutions: string[];
  waterAdvisory: string;
  weatherAdvisory: string;
}

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

export default function CropDoctorClient() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        toast({
          variant: 'destructive',
          title: 'File too large',
          description: 'Please upload an image smaller than 4MB.',
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setAnalysisResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const mockAnalysis = (summary: string): AnalysisResult => {
    // This is a placeholder logic to generate a structured report
    // from a simple summary string. In a real app, the AI model
    // would return a structured JSON object.
    const isHealthy = /healthy/i.test(summary);
    return {
      summary: summary,
      healthStatus: isHealthy ? "Healthy" : "Early signs of Powdery Mildew",
      organicSolutions: isHealthy ? ["Maintain regular watering schedule."] : ["Neem oil spray.", "Milk and water solution."],
      inorganicSolutions: isHealthy ? ["No action needed."] : ["Apply sulfur-based fungicide.", "Use potassium bicarbonate spray."],
      waterAdvisory: "Ensure proper drainage to avoid root rot. Water early in the morning.",
      weatherAdvisory: "High humidity may increase fungal risk. Ensure good air circulation around plants."
    };
  };

  const handleAnalyze = async () => {
    if (!imagePreview) return;
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    try {
      const result = await cropDoctorInitialAnalysis({ photoDataUri: imagePreview });
      const detailedResult = mockAnalysis(result.summary);
      setAnalysisResult(detailedResult);
    } catch (e) {
      setError('Failed to analyze the image. Please try again.');
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'An error occurred while communicating with the AI. Please check your connection and try again.',
      });
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="text-center mb-8">
        <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tighter">{t.crop_doctor_page_title}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-2">
          {t.crop_doctor_page_subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle>{t.upload_crop_image}</CardTitle>
            <CardDescription>{t.upload_crop_image_desc}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="w-full aspect-video rounded-lg border-2 border-dashed border-muted-foreground/50 flex items-center justify-center bg-muted/20 overflow-hidden">
                {imagePreview ? (
                  <Image src={imagePreview} alt="Crop preview" width={400} height={225} className="object-contain h-full w-full" />
                ) : (
                  <div className="text-center text-muted-foreground">
                    <Upload className="mx-auto h-12 w-12" />
                    <p>{t.image_preview_placeholder}</p>
                  </div>
                )}
              </div>
              <Input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
              <div className="flex gap-2">
                <Button onClick={() => fileInputRef.current?.click()} className="w-full">
                  <Upload className="mr-2 h-4 w-4" /> {t.choose_file}
                </Button>
                <Button onClick={() => fileInputRef.current?.click()} className="w-full" variant="secondary">
                  <Camera className="mr-2 h-4 w-4" /> {t.use_camera}
                </Button>
              </div>
              <Button onClick={handleAnalyze} disabled={!imagePreview || isLoading} className="w-full">
                {isLoading ? t.analyzing : t.analyze_crop_health}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
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
                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                  <Bot /> {t.ai_analysis_report}
                </CardTitle>
                <CardDescription>
                  <Badge variant={analysisResult.healthStatus === 'Healthy' ? 'default' : 'destructive'}>{analysisResult.healthStatus}</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertTitle>{t.ai_summary_title}</AlertTitle>
                  <AlertDescription>{analysisResult.summary}</AlertDescription>
                </Alert>
                
                <Separator />
                
                <div>
                  <h3 className="font-headline font-semibold flex items-center gap-2 mb-2"><Sprout /> {t.organic_solutions}</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {analysisResult.organicSolutions.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-headline font-semibold flex items-center gap-2 mb-2"><TestTube2 /> {t.inorganic_solutions}</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {analysisResult.inorganicSolutions.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Alert variant="default" className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                      <CloudSun className="h-4 w-4 text-blue-600" />
                      <AlertTitle className="text-blue-800 dark:text-blue-300">{t.water_weather_advisory}</AlertTitle>
                      <AlertDescription className="text-blue-700 dark:text-blue-400 text-xs">
                        {analysisResult.waterAdvisory}<br />{analysisResult.weatherAdvisory}
                      </AlertDescription>
                    </Alert>
                    
                    <a href="https://www.google.com/maps/search/?api=1&query=fertilizer+pesticide+shops+near+me" target="_blank" rel="noopener noreferrer" className="block">
                        <Alert variant="default" className="h-full bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                            <Map className="h-4 w-4 text-green-600" />
                            <AlertTitle className="text-green-800 dark:text-green-300">{t.find_nearby_shops}</AlertTitle>
                            <AlertDescription className="text-green-700 dark:text-green-400 text-xs">
                                {t.find_nearby_shops_desc}
                            </AlertDescription>
                        </Alert>
                    </a>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
