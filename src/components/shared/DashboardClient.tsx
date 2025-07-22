'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Carrot, HeartPulse, ScrollText, Settings, BrainCircuit } from 'lucide-react';

const features = [
  {
    title: 'Mandi Rates',
    description: 'Check latest commodity prices',
    href: '/mandi-rates',
    icon: <Carrot className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Crop Doctor',
    description: 'Diagnose crop diseases with AI',
    href: '/crop-doctor',
    icon: <HeartPulse className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Commodity Intel',
    description: 'Analyze market trends for crops',
    href: '/commodity-intelligence',
    icon: <BrainCircuit className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Govt. Schemes',
    description: 'Find relevant farmer schemes',
    href: '/schemes',
    icon: <ScrollText className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Settings',
    description: 'Customize your app experience',
    href: '/settings',
    icon: <Settings className="h-8 w-8 text-primary" />,
  },
];

export default function DashboardClient() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8 text-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter mb-2">
          Welcome to Kisan AI
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your AI-powered friend for smarter farming. Get real-time data and insights to make informed decisions.
        </p>
      </div>

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
