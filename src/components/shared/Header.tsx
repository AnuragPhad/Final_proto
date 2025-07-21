'use client';

import { ArrowLeft, Flower2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function Header() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="flex items-center gap-2 mr-4">
          {!isHomePage && (
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
          )}
          <Link href="/" className="flex items-center gap-2">
            <Flower2 className="h-6 w-6 text-primary" />
            <span className="font-headline text-xl font-bold text-primary">Kisan AI</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
