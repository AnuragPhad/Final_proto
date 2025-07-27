
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, MapPin } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { expertsData } from '@/data/experts';
import { useLocation } from '@/hooks/use-location';
import { Skeleton } from '@/components/ui/skeleton';


export default function ExpertsClient() {
  const { t } = useLanguage();
  const { location, isLocating } = useLocation();

  const mapQuery = location 
    ? `agronomists in ${location.district}, ${location.state}`
    : 'agronomists near me';

  const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="text-center mb-8">
        <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tighter">
          {t.talk_to_expert_title}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-2">
          {t.talk_to_expert_subtitle}
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
                <MapPin /> Find Local Agronomists
            </CardTitle>
            <CardDescription>
                {location ? `Showing results for "${mapQuery}"` : "Allow location access to see nearby experts."}
            </CardDescription>
        </CardHeader>
        <CardContent>
            {isLocating ? (
                <Skeleton className="w-full h-96" />
            ) : (
                <iframe
                    className="w-full h-96 rounded-md border"
                    src={mapUrl}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
            )}
        </CardContent>
      </Card>

        <div className="text-center my-12">
            <h2 className="font-headline text-2xl md:text-3xl font-bold tracking-tighter">
                Featured Remote Experts
            </h2>
            <p className="text-md text-muted-foreground max-w-xl mx-auto mt-2">
                Get advice from our curated list of specialists available for remote consultation.
            </p>
        </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {expertsData.map((expert) => (
          <Card key={expert.id} className="flex flex-col">
            <CardHeader className="items-center text-center">
              <Avatar className="w-24 h-24 mb-4">
                <AvatarImage src={expert.image} alt={expert.name} />
                <AvatarFallback>{expert.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <CardTitle className="font-headline">{expert.name}</CardTitle>
              <CardDescription>{expert.specialization}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
               <div className="flex flex-wrap justify-center gap-2">
                 {expert.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
               </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button asChild className="w-full">
                <a href={`tel:${expert.contact.phone}`}>
                  <Phone className="mr-2 h-4 w-4" /> Call Now
                </a>
              </Button>
              <Button asChild variant="outline" className="w-full">
                 <a href={`mailto:${expert.contact.email}`}>
                    <Mail className="mr-2 h-4 w-4" /> Email
                 </a>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
