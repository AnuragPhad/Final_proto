'use client';

import { ArrowLeft, Flower2, Globe } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLanguage } from '@/hooks/use-language';
import type { Language } from '@/lib/types';


export default function Header() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const { language, handleLanguageChange, t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="flex flex-1 items-center gap-2 mr-4">
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
            <span className="font-headline text-xl font-bold text-primary">{t.kisan_ai}</span>
          </Link>
        </div>
        
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Globe className="h-5 w-5" />
                    <span className="sr-only">Change language</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>{t.language}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={language} onValueChange={(val) => handleLanguageChange(val as Language)}>
                    <DropdownMenuRadioItem value="en">{t.english}</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="hi">{t.hindi}</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="mr">{t.marathi}</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </header>
  );
}
