'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Carrot, HeartPulse, ScrollText, Settings, BrainCircuit, Tractor, Users, Mic, LocateFixed, Bot } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { useState } from 'react';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from '@/hooks/use-location';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

export default function DashboardClient() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { location, setLocation, setIsLocating, isLocating } = useLocation();

  const handleUseLocation = () => {
    setIsLocating(true);
    toast({ title: 'Locating...', description: 'Please wait while we fetch your location.' });
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            const response = await fetch(`/api/geocode?lat=${latitude}&lon=${longitude}`);
            const data = await response.json();
            
            if (response.ok && data.state && data.district) {
              setLocation({ state: data.state, district: data.district });
              toast({ title: 'Location Found!', description: `Setting location to ${data.district}, ${data.state}.` });
            } else {
                 toast({
                  variant: 'destructive',
                  title: 'Location Not Found',
                  description: data.error || 'Could not determine your location from the coordinates.',
                });
            }
          } catch (error) {
              console.error("Reverse geocoding error:", error);
              toast({
                  variant: 'destructive',
                  title: 'Geocoding Error',
                  description: 'Could not fetch location details. Please try again.',
              });
          } finally {
            setIsLocating(false);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast({
            variant: 'destructive',
            title: 'Location Error',
            description: 'Could not get your location. Please ensure you have granted permission.',
          });
          setIsLocating(false);
        }
      );
    } else {
      toast({
        variant: 'destructive',
        title: 'Unsupported',
        description: 'Geolocation is not supported by your browser.',
      });
      setIsLocating(false);
    }
  };

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

        {!location && (
          <Alert className="mb-8 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 flex items-center justify-between">
            <div className="flex items-center">
              <LocateFixed className="h-5 w-5 mr-3 text-blue-600" />
              <div>
                <AlertTitle className="font-semibold text-blue-800 dark:text-blue-300">Set Your Location</AlertTitle>
                <AlertDescription className="text-blue-700 dark:text-blue-400 text-xs md:text-sm">
                  Enable location to get personalized information for weather and mandi rates.
                </AlertDescription>
              </div>
            </div>
            <Button onClick={handleUseLocation} variant="secondary" size="sm" disabled={isLocating}>
              {isLocating ? 'Locating...' : t.use_my_location}
            </Button>
          </Alert>
        )}
        
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
        
        <Link href="/settings" key="/settings" className="group">
          <Card className="h-full transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl hover:border-primary/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="font-headline text-xl font-semibold">{t.settings_title}</CardTitle>
              <Settings className="h-8 w-8 text-primary" />
              </CardHeader>
              <CardContent>
              <p className="text-sm text-muted-foreground">{t.settings_desc}</p>
              </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
