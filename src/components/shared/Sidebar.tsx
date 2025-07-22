
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetHeader } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Carrot, HeartPulse, ScrollText, Settings, BrainCircuit, Flower2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/use-language';

const SidebarContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
}>({
  open: false,
  setOpen: () => {},
});

export const useSidebar = () => React.useContext(SidebarContext);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);

  return (
    <SidebarContext.Provider value={{ open, setOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function Sidebar({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { t } = useLanguage();
  const pathname = usePathname();

  const features = [
    {
      title: t.mandi_rates_title,
      href: '/mandi-rates',
      icon: <Carrot className="h-5 w-5" />,
    },
    {
      title: t.crop_doctor_title,
      href: '/crop-doctor',
      icon: <HeartPulse className="h-5 w-5" />,
    },
    {
      title: t.commodity_intel_title,
      href: '/commodity-intelligence',
      icon: <BrainCircuit className="h-5 w-5" />,
    },
    {
      title: t.govt_schemes_title,
      href: '/schemes',
      icon: <ScrollText className="h-5 w-5" />,
    },
    {
      title: t.settings_title,
      href: '/settings',
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="p-4 border-b">
           <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2" onClick={() => onOpenChange(false)}>
                <Flower2 className="h-6 w-6 text-primary" />
                <span className="font-headline text-xl font-bold text-primary">{t.kisan_ai}</span>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
            </Button>
           </div>
        </SheetHeader>
        <div className="p-4">
          <nav className="flex flex-col gap-1">
            {features.map((feature) => (
              <Button
                key={feature.href}
                variant={pathname === feature.href ? 'secondary' : 'ghost'}
                className="justify-start gap-2"
                asChild
                onClick={() => onOpenChange(false)}
              >
                <Link href={feature.href}>
                  {feature.icon}
                  {feature.title}
                </Link>
              </Button>
            ))}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
