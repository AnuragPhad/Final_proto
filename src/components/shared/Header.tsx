
'use client';

import { ArrowLeft, Flower2, Globe, Menu, User, LogOut, MapPin } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLanguage } from '@/hooks/use-language';
import type { Language } from '@/lib/types';
import { useSidebar } from './Sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useIsClient } from '@/hooks/use-is-client';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useLocation } from '@/hooks/use-location';
import { Skeleton } from '../ui/skeleton';


export default function Header() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const { language, handleLanguageChange, t } = useLanguage();
  const { setOpen } = useSidebar();
  const isMobile = useIsMobile();
  const isClient = useIsClient();
  const { user, logout } = useAuth();
  const { location, isLocating } = useLocation();


  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="flex flex-1 items-center gap-2 mr-4">
          {isClient && isMobile ? (
            <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
              <Menu className="h-5 w-5" />
               <span className="sr-only">Open Menu</span>
            </Button>
          ) : !isHomePage && (
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
        
        <div className="flex items-center gap-2">
            <div className="flex-shrink-0 text-sm bg-muted px-3 py-1.5 rounded-md  items-center gap-2 whitespace-nowrap hidden sm:flex">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              {isLocating ? (
                <Skeleton className="h-4 w-24" />
              ) : location ? (
                <span className="font-medium">{location.district}, {location.state}</span>
              ) : (
                <span className="text-muted-foreground">Location not set</span>
              )}
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
                        <DropdownMenuRadioItem value="kn">{t.kannada}</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="ta">{t.tamil}</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            </DropdownMenu>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <span className="font-medium hidden sm:inline-block">{user.name}</span>
                    <Avatar className="h-8 w-8">
                       <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="icon" asChild>
                  <Link href="/login">
                      <User className="h-5 w-5" />
                      <span className="sr-only">Login</span>
                  </Link>
              </Button>
            )}
        </div>

      </div>
    </header>
  );
}
