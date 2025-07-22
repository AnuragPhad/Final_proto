
'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CalendarIcon, Mic, LocateFixed, Bot, LayoutGrid, List, Wheat, Apple, Carrot, Grape, LeafyGreen, Citrus, HandPlatter, Volume2, LineChart, TrendingUp } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { states, districts } from '@/data/locations';
import { getMandiRates as getMandiRatesFromApi, type MandiRate } from '@/data/mandi-rates';
import { puneMandiRates } from '@/data/pune-mandi-rates';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { understandMandiRateQuery, MandiRateQueryOutput } from '@/ai/flows/mandi-rate-nlu';
import { mandiRateSummary } from '@/ai/flows/mandi-rate-summary';
import { textToSpeech } from '@/ai/flows/tts';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { priceTrendFlow, PriceTrendInput, PriceTrendOutput } from '@/ai/flows/price-trend-flow';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { useLanguage } from '@/hooks/use-language';


type ViewMode = 'table' | 'tile';

const commodityIcons: { [key: string]: React.ReactNode } = {
  'Onion': <HandPlatter className="inline-block mr-2 text-red-500" />,
  'Potato': <Carrot className="inline-block mr-2 text-yellow-600" />,
  'Tomato': <Apple className="inline-block mr-2 text-red-600" />,
  'Wheat': <Wheat className="inline-block mr-2 text-yellow-500" />,
  'Grapes': <Grape className="inline-block mr-2 text-purple-600" />,
  'Lemon': <Citrus className="inline-block mr-2 text-yellow-400" />,
  'Cabbage': <LeafyGreen className="inline-block mr-2 text-green-600" />,
  'Apple': <Apple className="inline-block mr-2 text-red-600" />,
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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [allRates, setAllRates] = useState<MandiRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [audioSummaryUrl, setAudioSummaryUrl] = useState<string | null>(null);
  const [commodityFilter, setCommodityFilter] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [trendAdvice, setTrendAdvice] = useState<PriceTrendOutput | null>(null);
  const [isTrendLoading, setIsTrendLoading] = useState(false);
  const { t } = useLanguage();

  const { toast } = useToast();
  
  const getMandiRates = useCallback(async (state: string, district: string): Promise<MandiRate[]> => {
    // For this example, we use mock data for Pune to avoid API calls during development.
    // In a real application, you would remove this and rely on the API.
    if (district.toLowerCase() === 'pune') {
      return puneMandiRates;
    }
    // This is the real API call, which you can enable for production.
    return getMandiRatesFromApi(state, district);
  }, []);

  const handleVoiceSearch = async (query: string) => {
    if (!query) return;
    setIsSummarizing(true);
    setAudioSummaryUrl(null);
    setAiSummary(t.listening);
    
    try {
      // 1. Understand the user's query
      const nluResult = await understandMandiRateQuery({ query });
      setAiSummary(nluResult.summary);
      
      // 2. Determine target location from NLU result
      let targetDistrict = selectedDistrict;
      let targetState = selectedState;
      let locationFoundInNlu = false;
  
      if (nluResult.market) {
        for (const state of states) {
          const district = districts[state]?.find(d => nluResult.market!.toLowerCase().includes(d.toLowerCase()));
          if (district) {
            targetState = state;
            targetDistrict = district;
            locationFoundInNlu = true;
            break;
          }
        }
      }
      
      // 3. Set filters based on NLU result *without* triggering data refetch
      const newDate = nluResult.date ? new Date(nluResult.date) : new Date();
      setCommodityFilter(nluResult.commodity);
      setSelectedDate(newDate);

      // If a new location was found, update the main filters and fetch data.
      // Otherwise, use the existing data.
      if (locationFoundInNlu && (targetDistrict !== selectedDistrict || targetState !== selectedState)) {
          setSelectedState(targetState);
          setSelectedDistrict(targetDistrict);
          // The main useEffect will trigger the fetch
      } else {
        // 4. Fetch rates for the current location if not changed, or use existing `allRates`
        const ratesToProcess = await getMandiRates(targetState, targetDistrict);
        setAllRates(ratesToProcess);
        
        // 5. Filter rates for the summary
        const ratesForSummary = ratesToProcess.filter(rate => {
          const [day, month, year] = rate.arrival_date.split('/');
          const apiDate = new Date(Number(year), Number(month) - 1, Number(day));
          const isDateMatch = format(apiDate, 'yyyy-MM-dd') === format(newDate, 'yyyy-MM-dd');
          const isCommodityMatch = rate.commodity.toLowerCase().includes(nluResult.commodity.toLowerCase());
          return isDateMatch && isCommodityMatch;
        });

        // 6. Generate detailed AI summary and TTS
        setAiSummary('Generating detailed summary...');
        const summaryResult = await mandiRateSummary({
          commodity: nluResult.commodity,
          district: nluResult.market || targetDistrict,
          date: format(newDate, 'do MMMM yyyy'),
          rates: ratesForSummary.map(r => ({
              market: r.market,
              minPrice: r.minPrice,
              maxPrice: r.maxPrice,
              modalPrice: r.modalPrice,
          })),
        });

        setAiSummary(summaryResult.summary);
        if (summaryResult.summary) {
          const ttsResult = await textToSpeech({ text: summaryResult.summary });
          if (ttsResult.audioDataUri) {
            setAudioSummaryUrl(ttsResult.audioDataUri);
          }
        }
      }

    } catch (e: any) {
      console.error(e);
      toast({ variant: 'destructive', title: 'AI Error', description: e.message || 'Could not process your voice command.' });
      setAiSummary('Sorry, I had trouble understanding. Please try again.');
    } finally {
      setIsSummarizing(false);
    }
  };


  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    error: speechError,
    hasRecognitionSupport,
  } = useSpeechRecognition({onTranscript: handleVoiceSearch});

  const clearFiltersAndRefresh = () => {
    setCommodityFilter(null);
    setAiSummary(null);
    setAudioSummaryUrl(null);
    setTrendData([]);
    setTrendAdvice(null);
    fetchRates(selectedState, selectedDistrict);
  };

  const handleStartListening = () => {
    clearFiltersAndRefresh();
    startListening();
  };

  const fetchRates = useCallback(async (state: string, district: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedRates = await getMandiRates(state, district);
      setAllRates(fetchedRates);
    } catch (e) {
      console.error(e);
      setError('Failed to fetch mandi rates. The data might be temporarily unavailable.');
      toast({
        variant: 'destructive',
        title: 'API Error',
        description: 'Could not fetch data.',
      });
      setAllRates([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast, getMandiRates]);

  useEffect(() => {
    if (selectedState && selectedDistrict) {
      fetchRates(selectedState, selectedDistrict);
    }
  }, [selectedState, selectedDistrict, fetchRates]);


  const filteredRates = useMemo(() => {
    if (!selectedDate) return [];
    let rates = allRates.filter(rate => {
      if (!rate.arrival_date) return false;
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

    if (commodityFilter) {
      rates = rates.filter(rate => rate.commodity.toLowerCase().includes(commodityFilter.toLowerCase()));
    }

    return rates;
  }, [allRates, selectedDate, commodityFilter]);
  

  // This effect generates the trend data and advice when a commodity filter is applied.
  useEffect(() => {
    if (commodityFilter && allRates.length > 0) {
      setIsTrendLoading(true);
      const today = new Date();
      const thirtyDaysAgo = subDays(today, 30);
      
      const historicalData = allRates
        .filter(rate => rate.commodity.toLowerCase().includes(commodityFilter.toLowerCase()))
        .map(rate => {
          const [day, month, year] = rate.arrival_date.split('/');
          return {
            ...rate,
            date: new Date(Number(year), Number(month) - 1, Number(day)),
          };
        })
        .filter(rate => rate.date >= thirtyDaysAgo && rate.date <= today)
        .sort((a, b) => a.date.getTime() - b.date.getTime());

      if (historicalData.length > 1) {
        const formattedTrendData = historicalData.map(d => ({
          date: format(d.date, 'dd MMM'),
          price: d.modalPrice,
        }));
        setTrendData(formattedTrendData);
        
        const generateTrendAdvice = async () => {
            try {
              const advice = await priceTrendFlow({
                commodity: commodityFilter,
                prices: formattedTrendData.map(d => d.price)
              });
              setTrendAdvice(advice);
            } catch (e) {
              console.error("Trend advice error", e);
              setTrendAdvice(null);
            } finally {
              setIsTrendLoading(false);
            }
        };
        generateTrendAdvice();
      } else {
        setTrendData([]);
        setTrendAdvice(null);
        setIsTrendLoading(false);
      }
    } else {
      setTrendData([]);
      setTrendAdvice(null);
    }
  }, [commodityFilter, allRates]);


  useEffect(() => {
      if (audioSummaryUrl && audioRef.current) {
          audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
      }
  }, [audioSummaryUrl]);

  const handlePlayAudio = () => {
    if (audioRef.current) {
        audioRef.current.play();
    }
  };

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
              let { state, district } = data;

              if (!district) {
                toast({
                  variant: 'destructive',
                  title: 'Location Not Found',
                  description: 'Could not determine your district.',
                });
                return;
              }
              
              const cleanedDistrict = district.toLowerCase().replace(/\s*\(district\)/i, '').trim();
              const stateExists = states.find(s => s.toLowerCase() === state?.toLowerCase());
              
              if (stateExists) {
                 const districtExists = districts[stateExists]?.find(d => d.toLowerCase() === cleanedDistrict);
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
  
  const chartConfig = {
    price: {
      label: "Price",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="text-center mb-8">
        <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tighter">{t.mandi_rates_page_title}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-2">
          {t.mandi_rates_page_subtitle}
        </p>
      </div>

      <div className="flex flex-col items-center justify-center mb-8 space-y-4">
        {hasRecognitionSupport ? (
          <>
            <Button 
              onClick={isListening ? stopListening : handleStartListening} 
              className={`rounded-full h-24 w-24 p-0 shadow-lg transition-transform transform hover:scale-110 ${isListening ? 'bg-destructive animate-pulse' : 'bg-primary'}`}
              aria-label={isListening ? 'Stop listening' : 'Start voice search'}
            >
              <Mic className="h-10 w-10" />
            </Button>
            <p className="text-sm text-muted-foreground">
              {isListening ? `${t.listening} "${transcript}"` : t.tap_to_search_voice}
            </p>
          </>
        ) : (
          <p className="text-destructive">{t.voice_search_not_supported}</p>
        )}
      </div>

      {(aiSummary || isSummarizing) && (
        <Alert className="mb-8 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <Bot className="h-4 w-4 text-blue-600" />
            <div className='flex items-center justify-between'>
              <AlertTitle className="font-headline text-blue-800 dark:text-blue-300">{t.ai_summary}</AlertTitle>
              {audioSummaryUrl && !isSummarizing && (
                  <Button variant="ghost" size="icon" onClick={handlePlayAudio} className="h-7 w-7 text-blue-600 hover:bg-blue-200/50">
                      <Volume2 className="h-4 w-4" />
                      <span className="sr-only">Play Summary</span>
                  </Button>
              )}
            </div>
            <AlertDescription className="text-blue-700 dark:text-blue-400">
              {isSummarizing && !aiSummary ? 'Listening...' : aiSummary}
            </AlertDescription>
            {audioSummaryUrl && <audio ref={audioRef} src={audioSummaryUrl} className="hidden" />}
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t.filter_by_location_date}</CardTitle>
          <CardDescription>{t.filter_desc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={selectedState} onValueChange={(value) => {
              setSelectedState(value);
              if (districts[value] && districts[value].length > 0) {
                setSelectedDistrict(districts[value][0]);
              }
            }}>
              <SelectTrigger><SelectValue placeholder={t.select_state} /></SelectTrigger>
              <SelectContent>
                {states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={selectedDistrict} onValueChange={setSelectedDistrict} disabled={!selectedState}>
              <SelectTrigger><SelectValue placeholder={t.select_district} /></SelectTrigger>
              <SelectContent>
                {districts[selectedState]?.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, 'PPP') : <span>{t.pick_a_date}</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex flex-col md:flex-row gap-2">
            <Button onClick={clearFiltersAndRefresh} variant="outline" className="w-full">
              {t.clear_filters_refresh}
            </Button>
            <Button onClick={handleUseLocation} variant="secondary" className="w-full">
              <LocateFixed className="mr-2 h-4 w-4" /> {t.use_my_location}
            </Button>
          </div>
        </CardContent>
      </Card>

      {commodityFilter && (isTrendLoading || trendData.length > 0) && (
        <Card className="mt-8">
            <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                    <LineChart /> {t.price_trends_for} {commodityFilter}
                </CardTitle>
                <CardDescription>{t.last_30_days_prices} {selectedDistrict}.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 h-80">
                    {isTrendLoading ? (
                        <Skeleton className="h-full w-full" />
                    ) : (
                      <ChartContainer config={chartConfig} className="h-full w-full">
                        <AreaChart
                          accessibilityLayer
                          data={trendData}
                          margin={{
                            left: 12,
                            right: 12,
                          }}
                        >
                          <CartesianGrid vertical={false} />
                          <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => value.slice(0, 6)}
                          />
                          <Tooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dot" formatter={(value) => `Rs ${value}`} />}
                          />
                          <Area
                            dataKey="price"
                            type="natural"
                            fill="var(--color-price)"
                            fillOpacity={0.4}
                            stroke="var(--color-price)"
                          />
                        </AreaChart>
                      </ChartContainer>
                    )}
                </div>
                <div className="lg:col-span-1">
                  {isTrendLoading ? (
                     <div className="space-y-4">
                        <Skeleton className="h-8 w-1/3" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-3/4" />
                     </div>
                  ) : trendAdvice ? (
                     <Alert className="h-full bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <AlertTitle className="font-headline text-green-800 dark:text-green-300">{t.ai_selling_advice}</AlertTitle>
                        <AlertDescription className="text-green-700 dark:text-green-400">
                           <p className="font-bold">{trendAdvice.trend}</p>
                           <p>{trendAdvice.suggestion}</p>
                        </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        {t.not_enough_data_for_trend}
                    </div>
                  )}
                </div>
            </CardContent>
        </Card>
      )}

      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
            <div className="flex-1">
              <h2 className="font-headline text-2xl font-bold">
                {t.rates_for} {selectedDistrict} {t.on} {selectedDate ? format(selectedDate, 'do MMMM yyyy') : '...'}
              </h2>
              {commodityFilter && (
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary">{t.filtered_by} {commodityFilter}</Badge>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setCommodityFilter(null);
                    setTrendData([]);
                    setTrendAdvice(null);
                  }}>{t.clear_filter}</Button>
                </div>
              )}
            </div>
        </div>

         {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                       <Skeleton className="h-6 w-20 ml-auto" />
                       <Skeleton className="h-3 w-28 ml-auto" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredRates.length > 0 ? (
            <Accordion type="single" collapsible className="w-full space-y-2" defaultValue={Object.keys(ratesByMarket)[0] || undefined}>
                {Object.entries(ratesByMarket).map(([market, rates]) => (
                    <AccordionItem value={market} key={market} className="bg-card border rounded-lg">
                        <AccordionTrigger className="px-4 py-3 font-headline hover:no-underline">
                            {market} ({rates.length} {rates.length > 1 ? 'commodities' : 'commodity'})
                        </AccordionTrigger>
                        <AccordionContent className="p-0">
                           <div className="space-y-2 p-4">
                            {rates.map((rate, index) => (
                                <button key={`${rate.commodity}-${rate.variety}-${index}`} 
                                    className="w-full text-left"
                                    onClick={() => {
                                        setCommodityFilter(rate.commodity);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                >
                                    <div className="flex items-center justify-between p-3 rounded-md bg-muted/50 hover:bg-muted transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="text-primary text-2xl">{getCommodityIcon(rate.commodity)}</div>
                                            <div>
                                                <div className="font-bold text-base">{rate.commodity}</div>
                                                <div className="text-sm text-muted-foreground">{rate.variety}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-lg text-primary">Rs {rate.modalPrice}</div>
                                            <div className="text-xs text-muted-foreground">
                                                Min: Rs {rate.minPrice} | Max: Rs {rate.maxPrice}
                                            </div>
                                             <div className="text-xs text-muted-foreground">per Quintal</div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                           </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
          ) : (
            <Card className="h-40 flex items-center justify-center">
                 <p className="text-center text-muted-foreground">{t.no_data_for_criteria}</p>
            </Card>
          )}
      </div>
    </div>
  );
}

    