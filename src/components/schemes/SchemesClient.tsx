'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { schemesData, Scheme } from '@/data/schemes';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Rocket } from 'lucide-react';

const allCategories = ['All', ...Array.from(new Set(schemesData.map(s => s.category)))];
const allStates = ['All', ...Array.from(new Set(schemesData.map(s => s.state)))];
const ageGroups = [
  { label: 'All Ages', value: 'all' },
  { label: '18-40 years', value: '18-40' },
  { label: '41-60 years', value: '41-60' },
  { label: '60+ years', value: '60-100' },
];

export default function SchemesClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedAge, setSelectedAge] = useState('all');

  const filteredSchemes = schemesData.filter(scheme => {
    const query = searchQuery.toLowerCase();
    const matchesQuery = scheme.title.toLowerCase().includes(query) || scheme.description.toLowerCase().includes(query);
    const matchesCategory = selectedCategory === 'All' || scheme.category === selectedCategory;
    const matchesState = selectedState === 'All' || scheme.state === selectedState || scheme.state === 'Central';
    
    let matchesAge = true;
    if (selectedAge !== 'all') {
      const [minAge, maxAge] = selectedAge.split('-').map(Number);
      matchesAge = scheme.age[0] <= maxAge && scheme.age[1] >= minAge;
    }

    return matchesQuery && matchesCategory && matchesState && matchesAge;
  });

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="text-center mb-8">
        <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tighter">
          Government Schemes for Farmers
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-2">
          Discover central and state government schemes to support your farming activities.
        </p>
      </div>

      <Alert className="mb-8 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <Rocket className="h-4 w-4 text-blue-600" />
        <AlertTitle className="font-bold text-blue-800 dark:text-blue-300">Looking for a more personalized search?</AlertTitle>
        <AlertDescription className="text-blue-700 dark:text-blue-400">
          Visit the official <a href="https://www.myscheme.gov.in/search" target="_blank" rel="noopener noreferrer" className="underline font-semibold">myScheme portal</a> to find schemes tailored specifically to you.
        </AlertDescription>
      </Alert>


      <Card className="mb-8">
        <CardHeader>
            <CardTitle>Filter Schemes</CardTitle>
            <CardDescription>Find the right schemes by filtering by category, location, and age.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Input 
            placeholder="Search by keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
            <SelectContent>
                {allCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger><SelectValue placeholder="Select State/Central" /></SelectTrigger>
            <SelectContent>
                {allStates.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedAge} onValueChange={setSelectedAge}>
            <SelectTrigger><SelectValue placeholder="Select Age Group" /></SelectTrigger>
            <SelectContent>
                {ageGroups.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSchemes.length > 0 ? (
          filteredSchemes.map((scheme) => (
            <Card key={scheme.id} className="flex flex-col justify-between">
              <CardHeader>
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="font-headline text-xl">{scheme.title}</CardTitle>
                  <Badge variant="secondary" className="whitespace-nowrap">{scheme.state}</Badge>
                </div>
                 <CardDescription className="text-xs pt-1">{scheme.ministry}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground mb-4">{scheme.description}</p>
                <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{scheme.category}</Badge>
                    <Badge variant="outline">Age: {scheme.age[0]}-{scheme.age[1]}</Badge>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <a href={scheme.link} target="_blank" rel="noopener noreferrer">
                    Learn More
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <p className="text-muted-foreground col-span-full text-center">No schemes found matching your criteria.</p>
        )}
      </div>
    </div>
  );
}
