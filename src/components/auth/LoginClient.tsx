'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/use-language';
import { Flower2 } from 'lucide-react';

export default function LoginClient() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleLogin = () => {
    // In a real app, you'd handle authentication here.
    toast({
      title: 'Login Successful',
      description: 'Welcome back!',
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
                <Flower2 className="h-8 w-8 text-primary" />
                <span className="font-headline text-2xl font-bold text-primary">{t.kisan_ai}</span>
            </div>
          <CardTitle className="text-2xl font-headline">{t.login_title}</CardTitle>
          <CardDescription>
            {t.login_desc}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">{t.email_label}</Label>
              <Input
                id="email"
                type="email"
                placeholder="farmer@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">{t.password_label}</Label>
                <Link
                  href="#"
                  className="ml-auto inline-block text-sm underline"
                >
                  {t.forgot_password}
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button onClick={handleLogin} type="submit" className="w-full">
              {t.login_button}
            </Button>
            <Button variant="outline" className="w-full">
              {t.login_with_google}
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            {t.no_account}{' '}
            <Link href="#" className="underline">
              {t.sign_up}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
