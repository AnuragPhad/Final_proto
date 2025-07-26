
'use client';

import { SidebarProvider, Sidebar, useSidebar } from '@/components/shared/Sidebar';
import Header from './Header';
import { useIsMobile } from '@/hooks/use-mobile';
import { useIsClient } from '@/hooks/use-is-client';
import { AuthProvider } from '@/hooks/use-auth';
import { FarmProvider } from '@/hooks/use-farm';
import { LocationProvider } from '@/hooks/use-location';
import { Button } from '../ui/button';
import { Mic } from 'lucide-react';
import { useState } from 'react';
import { VoiceAssistantDialog } from '@/components/voice-assistant/VoiceAssistantDialog';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  return (
    <AuthProvider>
      <FarmProvider>
        <LocationProvider>
          <SidebarProvider>
            <div className="relative flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <MobileSidebar />
            </div>
            <div className="fixed bottom-6 right-6 z-50">
                <Button 
                    size="icon" 
                    className="rounded-full w-16 h-16 shadow-lg"
                    onClick={() => setIsAssistantOpen(true)}
                >
                    <Mic className="h-8 w-8" />
                </Button>
            </div>
            <VoiceAssistantDialog open={isAssistantOpen} onOpenChange={setIsAssistantOpen} />
          </SidebarProvider>
        </LocationProvider>
      </FarmProvider>
    </AuthProvider>
  );
}

function MobileSidebar() {
    const { open, setOpen } = useSidebar();
    const isMobile = useIsMobile();
    const isClient = useIsClient();

    if (!isClient || !isMobile) {
        return null;
    }

    return <Sidebar open={open} onOpenChange={setOpen} />;
}
