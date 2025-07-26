
'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Carrot, HeartPulse, ScrollText, Settings, BrainCircuit, Tractor, Users, Mic } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { useState } from 'react';
import VoiceAssistantDialog from '../voice-assistant/VoiceAssistantDialog';

export default function DashboardClient() {
  const { t } = useLanguage();
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
 
  const features = [
    {
      title: 'Voice Assistant',
      description: 'Interact with the app using your voice',
      href: '#',
      icon: <Mic className="h-8 w-8 text-primary" />,
      action: () => setIsAssistantOpen(true)
    },
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

  const renderCard = (feature: typeof features[0]) => (
     <Card className="h-full transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl hover:border-primary/50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="font-headline text-xl font-semibold">{feature.title}</CardTitle>
          {feature.icon}
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{feature.description}</p>
        </CardContent>
      </Card>
  )

  return (
    <>
    <VoiceAssistantDialog open={isAssistantOpen} onOpenChange={setIsAssistantOpen} />
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
        {features.map((feature) => (
            feature.action ? (
                <button key={feature.title} onClick={feature.action} className="group text-left">
                   {renderCard(feature)}
                </button>
            ) : (
                <Link href={feature.href} key={feature.href} className="group">
                    {renderCard(feature)}
                </Link>
            )
        ))}
      </div>
    </div>
    </>
  );
}
