
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CalendarIcon, Mic, LocateFixed, Bot, LayoutGrid, List, Wheat, Apple, Carrot, Grape, LeafyGreen, Citrus, HandPlatter } from 'lucide-react';
import { format } from 'date-fns';
import { states, districts } from '@/data/locations';
import { getMandiRates, type MandiRate } from '@/data/mandi-rates';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { understandMandiRateQuery } from '@/ai/flows/mandi-rate-nlu';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

type ViewMode = 'table' | 'tile';

const commodityIcons: { [key: string]: React.ReactNode } = {
  'Onion': <HandPlatter className="inline-block mr-2 text-red-500" />,
  'Potato': <Carrot className="inline-block mr-2 text-yellow-600" />, // No potato icon, using carrot as a substitute for root vegetable
  'Tomato': <Apple className="inline-block mr-2 text-red-600" />, // No tomato icon, using apple as a substitute
  'Wheat': <Wheat className="inline-block mr-2 text-yellow-500" />,
  'Grapes': <Grape className="inline-block mr-2 text-purple-600" />,
  'Lemon': <Citrus className="inline-block mr-2 text-yellow-400" />,
  'Cabbage': <LeafyGreen className="inline-block mr-2 text-green-600" />,
  'default': <HandPlatter className="inline-block mr-2 text-gray-500" />,
};

const getCommodityIcon = (commodity: string) => {
    const lowerCommodity = commodity.toLowerCase();
    for (const key in commodityIcons) {
        if (lowerCommodity.includes(key.toLowerCase())) {
            return commodityIcons[key];
        }
    }
    return commodityIcons['default'];
};


export default function MandiRatesClient() {
  const [selectedState, setSelectedState] = useState<string>('Maharashtra');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Pune');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [allRates, setAllRates] = useState<MandiRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('tile');
  const { toast } = useToast();

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    error: speechError,
    hasRecognitionSupport,
  } = useSpeechRecognition();

  useEffect(() => {
    // Set date only on client-side to avoid hydration mismatch
    setSelectedDate(new Date());
  }, []);

  const fetchRates = useCallback(async (state: string, district: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedRates = await getMandiRates(state, district);
      setAllRates(fetchedRates);
    } catch (e) {
      console.error(e);
      setError('Failed to fetch mandi rates. The data.gov.in API might be temporarily unavailable.');
      toast({
        variant: 'destructive',
        title: 'API Error',
        description: 'Could not fetch data from data.gov.in.',
      });
      setAllRates([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  useEffect(() => {
    if (selectedState && selectedDistrict) {
        fetchRates(selectedState, selectedDistrict);
    }
  }, [selectedState, selectedDistrict, fetchRates]);


  const filteredRates = useMemo(() => {
    if (!selectedDate) return [];
    return allRates.filter(rate => {
      if (!rate.arrival_date) return false;
      // The API returns dates in DD/MM/YYYY format.
      const [day, month, year] = rate.arrival_date.split('/');
      if (!day || !month || !year) return false;
      try {
        const apiDate = new Date(Number(year), Number(month) - 1, Number(day));
        return format(apiDate, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
      } catch (e) {
        console.error('Invalid date format from API:', rate.arrival_date);
        return false;
      }
    });
  }, [allRates, selectedDate]);
  
  const ratesByMarket = useMemo(() => {
    return filteredRates.reduce((acc, rate) => {
      const { market } = rate;
      if (!acc[market]) {
        acc[market] = [];
      }
      acc[market].push(rate);
      return acc;
    }, {} as Record<string, MandiRate[]>);
  }, [filteredRates]);


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
      
      const matchedState = states.find(s => result.market.toLowerCase().includes(s.toLowerCase()));
      
      if (matchedState) {
          const matchedDistrict = districts[matchedState]?.find(d => result.market.toLowerCase().includes(d.toLowerCase()));
          setSelectedState(matchedState);
          if (matchedDistrict) {
            setSelectedDistrict(matchedDistrict);
          } else if (districts[matchedState] && districts[matchedState].length > 0) {
            setSelectedDistrict(districts[matchedState][0]);
          }
      }
      
      if (result.date) {
        try {
            setSelectedDate(new Date(result.date));
            const summary = `Showing rates for ${result.commodity} in ${result.market} for ${format(new Date(result.date), 'PPP')}.`;
            const utterance = new SpeechSynthesisUtterance(summary);
            window.speechSynthesis.speak(utterance);
        } catch (e) {
            console.error("Invalid date from NLU:", result.date);
        }
      }
      
    } catch (e) {
      toast({ variant: 'destructive', title: 'AI Error', description: 'Could not understand your query.' });
    } finally {
        // Data fetching will be triggered by state changes in useEffect
    }
  };

  const handleUseLocation = () => {
    toast({ title: 'Locating...', description: 'Please wait while we fetch your location.' });
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            const response = await fetch(`/api/geocode?lat=${latitude}&lon=${longitude}`);
            const data = await response.json();
            
            if (response.ok) {
              const { state } = data;
              let district = data.district;

              // Clean the district name before matching
              if (district && district.includes(' (District)')) {
                district = district.replace(' (District)', '').trim();
              }
              
              const stateExists = states.find(s => s.toLowerCase() === state?.toLowerCase());
              if (stateExists) {
                 const districtExists = districts[stateExists]?.find(d => d.toLowerCase() === district?.toLowerCase());
                 if (districtExists) {
                    toast({ title: 'Location Found!', description: `Setting location to ${districtExists}, ${stateExists}.` });
                    setSelectedState(stateExists);
                    setSelectedDistrict(districtExists);
                 } else {
                    toast({
                      variant: 'destructive',
                      title: 'District Not Supported',
                      description: `Your district (${district}) is not currently in our supported list for ${state}. You can select it manually.`,
                    });
                 }
              } else {
                toast({
                  variant: 'destructive',
                  title: 'State Not Supported',
                  description: `Your state (${state}) is not currently in our supported list. You can select it manually.`,
                });
              }
            } else {
                 toast({
                  variant: 'destructive',
                  title: 'Location Not Found',
                  description: data.error || 'Could not determine your location from the coordinates.',
                });
            }
          } catch (error) {
              console.error("Reverse geocoding error:", error);
              toast({
                  variant: 'destructive',
                  title: 'Geocoding Error',
                  description: 'Could not fetch location details. Please try again.',
              });
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast({
            variant: 'destructive',
            title: 'Location Error',
            description: 'Could not get your location. Please ensure you have granted permission.',
          });
        }
      );
    } else {
      toast({
        variant: 'destructive',
        title: 'Unsupported',
        description: 'Geolocation is not supported by your browser.',
      });
    }
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
              if (districts[value] && districts[value].length > 0) {
                setSelectedDistrict(districts[value][0]);
              }
            }}>
              <SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger>
              <SelectContent>
                {states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={selectedDistrict} onValueChange={setSelectedDistrict} disabled={!selectedState}>
              <SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger>
              <SelectContent>
                {districts[selectedState]?.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
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
        <div className="flex justify-between items-center mb-4">
            <h2 className="font-headline text-2xl font-bold">
              Rates for {selectedDistrict} on {selectedDate ? format(selectedDate, 'do MMMM yyyy') : '...'}
            </h2>
            <div className="flex items-center gap-1 rounded-full border bg-muted p-1">
                 <Button variant={viewMode === 'table' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('table')} className="rounded-full h-8 w-8">
                    <List className="h-4 w-4" />
                    <span className="sr-only">Table View</span>
                </Button>
                <Button variant={viewMode === 'tile' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('tile')} className="rounded-full h-8 w-8">
                    <LayoutGrid className="h-4 w-4" />
                    <span className="sr-only">Tile View</span>
                </Button>
            </div>
        </div>

         {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
             <Card><Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Commodity</TableHead>
                    <TableHead>Variety</TableHead>
                    <TableHead>Market</TableHead>
                    <TableHead className="text-right">Price (₹/Quintal)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                    </TableRow>
                    ))}
                </TableBody>
             </Table></Card>
          ) : viewMode === 'table' && filteredRates.length > 0 ? (
            <Card>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Commodity</TableHead>
                    <TableHead>Variety</TableHead>
                    <TableHead>Market</TableHead>
                    <TableHead className="text-right">Price (₹/Quintal)</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredRates.map((rate, index) => (
                    <TableRow key={`${rate.commodity}-${rate.market}-${rate.variety}-${index}`}>
                        <TableCell className="font-medium flex items-center">{getCommodityIcon(rate.commodity)} {rate.commodity}</TableCell>
                        <TableCell>{rate.variety}</TableCell>
                        <TableCell>{rate.market}</TableCell>
                        <TableCell className="text-right">
                          <div className="font-bold text-lg text-primary">{rate.modalPrice}</div>
                          <div className="text-xs text-muted-foreground">
                            Min: {rate.minPrice} | Max: {rate.maxPrice}
                          </div>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
            </Card>
          ) : viewMode === 'tile' && filteredRates.length > 0 ? (
            <Accordion type="single" collapsible className="w-full space-y-2">
                {Object.entries(ratesByMarket).map(([market, rates]) => (
                    <AccordionItem value={market} key={market} className="bg-card border rounded-lg">
                        <AccordionTrigger className="px-4 py-3 font-headline hover:no-underline">
                            {market}
                        </AccordionTrigger>
                        <AccordionContent className="p-0">
                           <div className="space-y-2 p-4">
                            {rates.map((rate, index) => (
                                <div key={`${rate.commodity}-${rate.variety}-${index}`} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                                    <div className="flex items-center">
                                        <div className="mr-4 text-primary">{getCommodityIcon(rate.commodity)}</div>
                                        <div>
                                            <div className="font-bold">{rate.commodity}</div>
                                            <div className="text-sm text-muted-foreground">{rate.variety}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-lg text-primary">₹{rate.modalPrice}</div>
                                        <div className="text-xs text-muted-foreground">
                                            Min: ₹{rate.minPrice} | Max: ₹{rate.maxPrice}
                                        </div>
                                         <div className="text-xs text-muted-foreground">per Quintal</div>
                                    </div>
                                </div>
                            ))}
                           </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
          ) : (
            <Card className="h-40 flex items-center justify-center">
                 <p className="text-center text-muted-foreground">No data available for the selected criteria. The market may be closed on this day.</p>
            </Card>
          )}
      </div>
    </div>
  );
}

    
