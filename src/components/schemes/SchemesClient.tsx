'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { schemesData } from '@/data/schemes';

export default function SchemesClient() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="text-center mb-8">
        <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tighter">
          Government Schemes for Farmers
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-2">
          Discover central government schemes to support your farming activities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schemesData.map((scheme) => (
          <Card key={scheme.title} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="font-headline text-xl">{scheme.title}</CardTitle>
                <Badge variant={scheme.category === 'Insurance' ? 'destructive' : 'secondary'}>
                  {scheme.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription>{scheme.description}</CardDescription>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <a href={scheme.link} target="_blank" rel="noopener noreferrer">
                  Learn More
                </a>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
