'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { translations } from '@/lib/i18n';
import type { Translation } from '@/lib/types';

type Language = 'en' | 'hi' | 'mr';

export default function SettingsClient() {
  const [language, setLanguage] = useState<Language>('en');
  const [notifications, setNotifications] = useState({
    push: true,
    email: false,
    sms: false,
  });
  const [t, setT] = useState<Translation>(translations.en);
  const { toast } = useToast();

  useEffect(() => {
    const savedLang = localStorage.getItem('kisan-ai-lang') as Language | null;
    if (savedLang && translations[savedLang]) {
      setLanguage(savedLang);
      setT(translations[savedLang]);
    }
  }, []);

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    setT(translations[newLang]);
    localStorage.setItem('kisan-ai-lang', newLang);
  };

  const handleSave = () => {
    toast({
      title: t.preferences_saved,
    });
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tighter mb-8">{t.title}</h1>
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>{t.language}</CardTitle>
              <CardDescription>Choose your preferred language for the app.</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={language} onValueChange={(val) => handleLanguageChange(val as Language)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="en" id="en" />
                  <Label htmlFor="en">{t.english}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="hi" id="hi" />
                  <Label htmlFor="hi">{t.hindi}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mr" id="mr" />
                  <Label htmlFor="mr">{t.marathi}</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t.notifications}</CardTitle>
              <CardDescription>Manage how you receive notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <Label htmlFor="push-notifications">{t.push_notifications}</Label>
                <Switch
                  id="push-notifications"
                  checked={notifications.push}
                  onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, push: checked }))}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <Label htmlFor="email-notifications">{t.email_notifications}</Label>
                <Switch
                  id="email-notifications"
                  checked={notifications.email}
                  onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, email: checked }))}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <Label htmlFor="sms-notifications">{t.sms_notifications}</Label>
                <Switch
                  id="sms-notifications"
                  checked={notifications.sms}
                  onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, sms: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSave} className="w-full">
            {t.save_preferences}
          </Button>
        </div>
      </div>
    </div>
  );
}
