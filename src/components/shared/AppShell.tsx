
'use client';

import { SidebarProvider, Sidebar, useSidebar } from '@/components/shared/Sidebar';
import Header from './Header';
import { useIsMobile } from '@/hooks/use-mobile';
import { useIsClient } from '@/hooks/use-is-client';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <MobileSidebar />
      </div>
    </SidebarProvider>
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
