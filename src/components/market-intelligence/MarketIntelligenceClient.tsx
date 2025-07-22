
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HandPlatter, Wheat, Apple, Carrot, LeafyGreen, Citrus, LineChart, BrainCircuit, Grape } from 'lucide-react';
import { puneMandiRates } from '@/data/pune-mandi-rates';
import { nashikMandiRates } from '@/data/nashik-mandi-rates';
import { solapurMandiRates } from '@/data/solapur-mandi-rates';
import type { MandiRate } from '@/data/mandi-rates';
import { subDays, format, parse } from 'date-fns';
import { commodityAnalysisFlow, CommodityAnalysisOutput } from '@/ai/flows/commodity-analysis-flow';
import { Skeleton } from '@/components/ui/skeleton';
import { AreaChart, Area, CartesianGrid, Tooltip, XAxis, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { states, districts } from '@/data/locations';
import { useLanguage } from '@/hooks/use-language';
import { translateCommodity } from '@/lib/commodity-translations';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';


const commodities = [
    { name: 'Onion', icon: <HandPlatter className="h-10 w-10" /> },
    { name: 'Potato', icon: <Carrot className="h-10 w-10" /> },
    { name: 'Tomato', icon: <Apple className="h-10 w-10" /> },
    { name: 'Wheat', icon: <Wheat className="h-10 w-10" /> },
    { name: 'Cabbage', icon: <LeafyGreen className="h-10 w-10" /> },
    { name: 'Lemon', icon: <Citrus className="h-10 w-10" /> },
    { name: 'Grapes', icon: <Grape className="h-10 w-10" /> },
];

const allSimulatedRates: { [key: string]: MandiRate[] } = {
    'Pune': puneMandiRates,
    'Nashik': nashikMandiRates,
    'Solapur': solapurMandiRates,
};

interface MarketComparisonData {
    market: string;
    price: number;
    date: string;
}

export default function MarketIntelligenceClient() {
    const [selectedCommodity, setSelectedCommodity] = useState<string | null>('Onion');
    const [selectedState, setSelectedState] = useState<string>('Maharashtra');
    const [selectedDistrict, setSelectedDistrict] = useState<string>('Pune');
    const [trendData, setTrendData] = useState<any[]>([]);
    const [marketAnalysis, setMarketAnalysis] = useState<CommodityAnalysisOutput | null>(null);
    const [marketComparisonData, setMarketComparisonData] = useState<MarketComparisonData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { language, t } = useLanguage();

    useEffect(() => {
        if (selectedCommodity) {
            setIsLoading(true);
            setTrendData([]);
            setMarketAnalysis(null);
            setMarketComparisonData([]);

            const today = new Date();
            const thirtyDaysAgo = subDays(today, 30);
            
            // For Trend Chart (using selectedDistrict)
            const districtRates = allSimulatedRates[selectedDistrict] || [];
            const historicalData = districtRates
                .filter(rate => rate.commodity.toLowerCase() === selectedCommodity.toLowerCase())
                .map(rate => {
                    const date = parse(rate.arrival_date, 'dd/MM/yyyy', new Date());
                    return { ...rate, date };
                })
                .filter(rate => rate.date >= thirtyDaysAgo && rate.date <= today)
                .sort((a, b) => a.date.getTime() - b.date.getTime());

            if (historicalData.length > 1) {
                const formattedTrendData = historicalData.map(d => ({
                    date: format(d.date, 'dd MMM'),
                    price: d.modalPrice,
                }));
                setTrendData(formattedTrendData);
            } else {
                setTrendData([]);
            }

            // For Cross-Market Comparison Table (using all available markets)
            const comparisonData: MarketComparisonData[] = [];
            for (const market in allSimulatedRates) {
                const latestRate = allSimulatedRates[market]
                    .filter(rate => rate.commodity.toLowerCase() === selectedCommodity.toLowerCase())
                    .sort((a, b) => parse(b.arrival_date, 'dd/MM/yyyy', new Date()).getTime() - parse(a.arrival_date, 'dd/MM/yyyy', new Date()).getTime())
                    [0];
                
                if (latestRate) {
                    comparisonData.push({
                        market: latestRate.district,
                        price: latestRate.modalPrice,
                        date: latestRate.arrival_date,
                    });
                }
            }
            setMarketComparisonData(comparisonData);

            // Generate AI market analysis
            const generateMarketAnalysis = async () => {
                if(comparisonData.length > 0) {
                    try {
                        const analysis = await commodityAnalysisFlow({
                            commodity: selectedCommodity,
                            prices: comparisonData.map(d => ({ market: d.market, price: d.price }))
                        });
                        setMarketAnalysis(analysis);
                    } catch (e) {
                        console.error("Market analysis error", e);
                        setMarketAnalysis(null);
                    }
                }
            };

            generateMarketAnalysis();
            setIsLoading(false);
        }
    }, [selectedCommodity, selectedDistrict, selectedState]);
    
    const chartConfig = {
      price: {
        label: "Price",
        color: "hsl(var(--primary))",
      },
    };

    const translatedSelectedCommodity = useMemo(() => {
        return selectedCommodity ? translateCommodity(selectedCommodity, language) : null;
    }, [selectedCommodity, language]);

    const { highestPriceMarket, lowestPriceMarket } = useMemo(() => {
        if (marketComparisonData.length === 0) return { highestPriceMarket: null, lowestPriceMarket: null };
        let highest = marketComparisonData[0];
        let lowest = marketComparisonData[0];
        marketComparisonData.forEach(item => {
            if (item.price > highest.price) highest = item;
            if (item.price < lowest.price) lowest = item;
        });
        return { highestPriceMarket: highest.market, lowestPriceMarket: lowest.market };
    }, [marketComparisonData]);


    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="text-center mb-8">
                <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tighter">{t.market_intel_page_title}</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-2">
                    {t.market_intel_page_subtitle}
                </p>
            </div>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>{t.select_commodity_loc}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select value={selectedState} onValueChange={(value) => {
                          setSelectedState(value);
                          const firstDistrict = Object.keys(allSimulatedRates).find(d => districts[value]?.includes(d));
                          setSelectedDistrict(firstDistrict || districts[value]?.[0] || '');
                        }}>
                          <SelectTrigger><SelectValue placeholder={t.select_state} /></SelectTrigger>
                          <SelectContent>
                            {['Maharashtra'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Select value={selectedDistrict} onValueChange={setSelectedDistrict} disabled={!selectedState}>
                          <SelectTrigger><SelectValue placeholder={t.select_district} /></SelectTrigger>
                          <SelectContent>
                            {Object.keys(allSimulatedRates).map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                          </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        {commodities.map((commodity) => (
                            <Button
                                key={commodity.name}
                                variant={selectedCommodity === commodity.name ? 'default' : 'outline'}
                                className="flex-col h-24 w-24 p-4 gap-2"
                                onClick={() => setSelectedCommodity(commodity.name)}
                            >
                                {commodity.icon}
                                <span className="font-semibold">{translateCommodity(commodity.name, language)}</span>
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {selectedCommodity && (
                <div className="space-y-8">
                    <h2 className="font-headline text-2xl font-bold text-center">
                        {t.analysis_for} {translatedSelectedCommodity}
                    </h2>

                    {/* Price Trend Analysis */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2"><LineChart /> {t.price_trend} {t.in} {selectedDistrict}</CardTitle>
                            <CardDescription>{t.last_30_days_modal_prices}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-80">
                                {isLoading ? <Skeleton className="h-full w-full" /> : 
                                trendData.length > 0 ? (
                                    <ChartContainer config={chartConfig} className="h-full w-full">
                                      <AreaChart data={trendData} margin={{ left: 12, right: 12 }}>
                                          <CartesianGrid vertical={false} />
                                          <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                                          <Tooltip content={<ChartTooltipContent indicator="dot" formatter={(value) => `Rs ${value}`} />} />
                                          <defs>
                                            <linearGradient id="fillPrice" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--color-price)" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="var(--color-price)" stopOpacity={0.1}/>
                                            </linearGradient>
                                          </defs>
                                          <Area dataKey="price" type="natural" fill="url(#fillPrice)" stroke="var(--color-price)" stackId="a" />
                                      </AreaChart>
                                    </ChartContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-muted-foreground">{t.no_data_for_trend_analysis}</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Cross-Market Analysis */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2"><BrainCircuit /> {t.cross_market_analysis}</CardTitle>
                            <CardDescription>{t.cross_market_desc}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           {isLoading ? <Skeleton className="h-40 w-full" /> : 
                           marketAnalysis ? (
                               <Alert>
                                   <BrainCircuit className="h-4 w-4" />
                                   <AlertTitle>{t.ai_market_insight}</AlertTitle>
                                   <AlertDescription>
                                       {marketAnalysis.summary}
                                   </AlertDescription>
                               </Alert>
                           ) : (
                               <div className="flex items-center justify-center h-10 text-muted-foreground">{t.no_market_analysis_available}</div>
                           )}

                            {marketComparisonData.length > 0 ? (
                                <div className="border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow>
                                            <TableHead className="w-[150px]">Market (District)</TableHead>
                                            <TableHead>Latest Date</TableHead>
                                            <TableHead className="text-right">Price (per Quintal)</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {marketComparisonData
                                            .sort((a,b) => b.price - a.price)
                                            .map(market => (
                                                <TableRow key={market.market}>
                                                    <TableCell className="font-medium">{market.market}</TableCell>
                                                    <TableCell className="text-muted-foreground">{market.date}</TableCell>
                                                    <TableCell className={cn(
                                                        "text-right font-semibold",
                                                        market.market === highestPriceMarket && 'text-green-600',
                                                        market.market === lowestPriceMarket && 'text-red-600'
                                                    )}>Rs {market.price}</TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                                </div>
                            ) : !isLoading && (
                                <div className="flex items-center justify-center h-20 text-muted-foreground">{t.no_data_for_trend_analysis}</div>
                            )}
                        </CardContent>
                    </Card>

                </div>
            )}
        </div>
    );
}
