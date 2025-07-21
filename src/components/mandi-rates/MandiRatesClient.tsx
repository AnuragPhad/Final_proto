
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CalendarIcon, Mic, LocateFixed, Bot } from 'lucide-react';
import { format } from 'date-fns';
import { states, districts } from '@/data/locations';
import { getMandiRates, type MandiRate } from '@/data/mandi-rates';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { understandMandiRateQuery } from '@/ai/flows/mandi-rate-nlu';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function MandiRatesClient() {
  const [selectedState, setSelectedState] = useState<string>('Maharashtra');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Pune');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [rates, setRates] = useState<MandiRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    error: speechError,
    hasRecognitionSupport,
  } = useSpeechRecognition();

  const fetchRates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch all rates for the district first
      const fetchedRates = await getMandiRates(selectedState, selectedDistrict);
      
      // Then filter by the selected date on the client side
      const dateFilteredRates = fetchedRates.filter(rate => {
        if (!rate.arrival_date) return false;
        
        // The API returns dates in DD/MM/YYYY format. We need to parse it correctly.
        const [day, month, year] = rate.arrival_date.split('/');
        // Note: The month in JavaScript's Date constructor is 0-indexed (0-11)
        const apiDate = new Date(Number(year), Number(month) - 1, Number(day));

        // Compare the formatted dates to ignore time differences
        return format(apiDate, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
      });

      setRates(dateFilteredRates);
    } catch (e) {
      console.error(e);
      setError('Failed to fetch mandi rates. Please try again later.');
      toast({
        variant: 'destructive',
        title: 'API Error',
        description: 'Could not fetch data from data.gov.in.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedState, selectedDistrict, selectedDate, toast]);


  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  useEffect(() => {
    if (speechError) {
      toast({ variant: 'destructive', title: 'Speech Error', description: speechError });
    }
  }, [speechError, toast]);

  useEffect(() => {
    if (!isListening && transcript) {
      handleVoiceSearch(transcript);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening, transcript]);

  const handleVoiceSearch = async (query: string) => {
    if (!query) return;
    setIsLoading(true);
    try {
      const result = await understandMandiRateQuery({ query });
      
      const matchedState = states.find(s => s.toLowerCase() === result.market.toLowerCase() || result.market.toLowerCase().includes(s.toLowerCase()));
      const matchedDistrict = districts[matchedState || selectedState]?.find(d => d.toLowerCase() === result.market.toLowerCase());

      if (matchedState) setSelectedState(matchedState);
      if (matchedDistrict) setSelectedDistrict(matchedDistrict);
      
      setSelectedDate(new Date(result.date));
      
      // Mock text-to-speech summary
      const summary = `Showing rates for ${result.commodity} in ${result.market} for ${format(new Date(result.date), 'PPP')}.`;
      const utterance = new SpeechSynthesisUtterance(summary);
      window.speechSynthesis.speak(utterance);
      
    } catch (e) {
      toast({ variant: 'destructive', title: 'AI Error', description: 'Could not understand your query.' });
    } finally {
        // fetchRates will be called by useEffect dependencies changing
    }
  };

  const handleUseLocation = () => {
    // This would typically use browser geolocation and a reverse geocoding API
    toast({ title: 'Locating...', description: 'Fetching your current location.' });
    setTimeout(() => {
      setSelectedState('Maharashtra');
      setSelectedDistrict('Nashik');
      toast({ title: 'Location Set!', description: 'Showing rates for Nashik, Maharashtra.' });
    }, 1000);
  };
  
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="text-center mb-8">
        <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tighter">Mandi Rates</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-2">
          Find the latest commodity prices from markets across India.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Select location and date to find rates. Or use your voice!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={selectedState} onValueChange={(value) => {
              setSelectedState(value);
              // Reset district when state changes
              setSelectedDistrict(districts[value][0]);
            }}>
              <SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger>
              <SelectContent>
                {states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
              <SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger>
              <SelectContent>
                {districts[selectedState]?.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, 'PPP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={selectedDate} onSelect={(d) => d && setSelectedDate(d)} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex flex-col md:flex-row gap-2">
            <Button onClick={handleUseLocation} variant="secondary" className="w-full">
              <LocateFixed className="mr-2 h-4 w-4" /> Use My Location
            </Button>
            {hasRecognitionSupport && (
                <Button onClick={isListening ? stopListening : startListening} className="w-full" variant={isListening ? "destructive" : "default"}>
                  <Mic className={`mr-2 h-4 w-4 ${isListening ? 'animate-pulse' : ''}`} />
                  {isListening ? 'Listening...' : 'Search with Voice'}
                </Button>
            )}
          </div>
          {isListening && (
            <Alert className="bg-accent/20 border-accent/50">
              <Bot className="h-4 w-4" />
              <AlertTitle className="font-headline">Listening...</AlertTitle>
              <AlertDescription>
                {transcript ? `"${transcript}"` : 'Say something like "What is the price of onions in Pune today?"'}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="mt-8">
        <h2 className="font-headline text-2xl font-bold mb-4">
          Rates for {selectedDistrict} on {format(selectedDate, 'do MMMM yyyy')}
        </h2>
         {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Commodity</TableHead>
                <TableHead>Variety</TableHead>
                <TableHead className="text-right">Min Price (₹/Quintal)</TableHead>
                <TableHead className="text-right">Max Price (₹/Quintal)</TableHead>
                <TableHead className="text-right">Modal Price (₹/Quintal)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : rates.length > 0 ? (
                rates.map((rate, index) => (
                  <TableRow key={`${rate.commodity}-${rate.variety}-${index}`}>
                    <TableCell className="font-medium">{rate.commodity}</TableCell>
                    <TableCell>{rate.variety}</TableCell>
                    <TableCell className="text-right">{rate.minPrice}</TableCell>
                    <TableCell className="text-right">{rate.maxPrice}</TableCell>
                    <TableCell className="text-right font-bold text-primary">{rate.modalPrice}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">No data available for the selected criteria.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
