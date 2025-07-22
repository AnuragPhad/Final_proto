
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HandPlatter, Wheat, Apple, Carrot, LeafyGreen, Citrus, LineChart, TrendingUp, BrainCircuit, Grape } from 'lucide-react';
import { puneMandiRates } from '@/data/pune-mandi-rates';
import { nashikMandiRates } from '@/data/nashik-mandi-rates';
import { solapurMandiRates } from '@/data/solapur-mandi-rates';
import type { MandiRate } from '@/data/mandi-rates';
import { subDays, format } from 'date-fns';
import { priceTrendFlow, PriceTrendOutput } from '@/ai/flows/price-trend-flow';
import { commodityAnalysisFlow, CommodityAnalysisOutput } from '@/ai/flows/commodity-analysis-flow';
import { Skeleton } from '@/components/ui/skeleton';
import { AreaChart, Area, CartesianGrid, Tooltip, XAxis, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { states, districts } from '@/data/locations';
import { useLanguage } from '@/hooks/use-language';
import { translateCommodity } from '@/lib/commodity-translations';

const commodities = [
    { name: 'Onion', icon: <HandPlatter className="h-10 w-10" /> },
    { name: 'Potato', icon: <Carrot className="h-10 w-10" /> },
    { name: 'Tomato', icon: <Apple className="h-10 w-10" /> },
    { name: 'Wheat', icon: <Wheat className="h-10 w-10" /> },
    { name: 'Cabbage', icon: <LeafyGreen className="h-10 w-10" /> },
    { name: 'Lemon', icon: <Citrus className="h-10 w-10" /> },
    { name: 'Grapes', icon: <Grape className="h-10 w-10" /> },
];

const mockMarketData = [
    { market: 'Pune', price: 2250 },
    { market: 'Nashik', price: 2400 },
    { market: 'Solapur', price: 2100 },
    { market: 'Mumbai', price: 2550 },
    { market: 'Nagpur', price: 2300 },
];

const allSimulatedRates: { [key: string]: MandiRate[] } = {
    'Pune': puneMandiRates,
    'Nashik': nashikMandiRates,
    'Solapur': solapurMandiRates,
};

export default function MarketIntelligenceClient() {
    const [selectedCommodity, setSelectedCommodity] = useState<string | null>(null);
    const [selectedState, setSelectedState] = useState<string>('Maharashtra');
    const [selectedDistrict, setSelectedDistrict] = useState<string>('Pune');
    const [trendData, setTrendData] = useState<any[]>([]);
    const [trendAdvice, setTrendAdvice] = useState<PriceTrendOutput | null>(null);
    const [marketAnalysis, setMarketAnalysis] = useState<CommodityAnalysisOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { language, t } = useLanguage();

    useEffect(() => {
        if (selectedCommodity && selectedDistrict) {
            setIsLoading(true);
            setTrendData([]);
            setTrendAdvice(null);
            setMarketAnalysis(null);

            const today = new Date();
            const thirtyDaysAgo = subDays(today, 30);
            
            const districtRates = allSimulatedRates[selectedDistrict] || [];

            // Fetch historical data for trend
            const historicalData = districtRates
                .filter(rate => rate.commodity.toLowerCase() === selectedCommodity.toLowerCase())
                .map(rate => {
                    const [day, month, year] = rate.arrival_date.split('/');
                    return { ...rate, date: new Date(Number(year), Number(month) - 1, Number(day)) };
                })
                .filter(rate => rate.date >= thirtyDaysAgo && rate.date <= today)
                .sort((a, b) => a.date.getTime() - b.date.getTime());

            // Generate trend chart data
            if (historicalData.length > 1) {
                const formattedTrendData = historicalData.map(d => ({
                    date: format(d.date, 'dd MMM'),
                    price: d.modalPrice,
                }));
                setTrendData(formattedTrendData);

                // Generate AI trend advice
                const generateTrendAdvice = async () => {
                    try {
                        const advice = await priceTrendFlow({
                            commodity: selectedCommodity,
                            prices: formattedTrendData.map(d => d.price)
                        });
                        setTrendAdvice(advice);
                    } catch (e) {
                        console.error("Trend advice error", e);
                        setTrendAdvice(null);
                    }
                };
                generateTrendAdvice();
            } else {
                setTrendData([]);
                setTrendAdvice(null);
            }

            // Generate AI market analysis
            const generateMarketAnalysis = async () => {
                try {
                    // Adjust mock data to have prices relative to the selected commodity's latest price
                    const latestPrice = historicalData.length > 0 ? historicalData[historicalData.length - 1].modalPrice : 2300;
                    const dynamicMarketData = mockMarketData.map((market, index) => ({
                        ...market,
                        price: Math.round((latestPrice * (1 + (index - 2) * 0.05)) / 10) * 10 // Adjust prices around the latest price
                    }));

                    const analysis = await commodityAnalysisFlow({
                        commodity: selectedCommodity,
                        prices: dynamicMarketData
                    });
                    setMarketAnalysis(analysis);
                } catch (e) {
                    console.error("Market analysis error", e);
                    setMarketAnalysis(null);
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
                        {t.analysis_for} {translatedSelectedCommodity} {t.in} {selectedDistrict}
                    </h2>

                    {/* Price Trend Analysis */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2"><LineChart /> {t.price_trend}</CardTitle>
                            <CardDescription>{t.last_30_days_modal_prices} {selectedDistrict}.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 h-80">
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
                            <div className="lg:col-span-1 flex items-center">
                                {isLoading ? <Skeleton className="h-24 w-full" /> : 
                                trendAdvice ? (
                                    <Alert className="h-full bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                                        <TrendingUp className="h-4 w-4 text-green-600" />
                                        <AlertTitle className="font-headline text-green-800 dark:text-green-300">{t.ai_selling_advice}</AlertTitle>
                                        <AlertDescription className="text-green-700 dark:text-green-400">
                                            <p className="font-bold">{trendAdvice.trend}</p>
                                            <p>{trendAdvice.suggestion}</p>
                                        </AlertDescription>
                                    </Alert>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-muted-foreground">{t.no_trend_advice_available}</div>
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
                        <CardContent className="space-y-2">
                           {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
                            ) : marketAnalysis ? (
                                <>
                                    <div className="mb-4">
                                        <Alert>
                                            <BrainCircuit className="h-4 w-4" />
                                            <AlertTitle>{t.ai_market_insight}</AlertTitle>
                                            <AlertDescription>
                                                {marketAnalysis.summary}
                                            </AlertDescription>
                                        </Alert>
                                    </div>
                                    {mockMarketData.map(market => (
                                        <div key={market.market} className="flex justify-between items-center p-3 rounded-md bg-muted/50">
                                            <p className="font-semibold">{market.market}</p>
                                            <Badge variant={market.market === marketAnalysis?.highestPriceMarket ? "default" : market.market === marketAnalysis?.lowestPriceMarket ? "destructive" : "secondary"}>
                                                Rs {market.price} / Quintal
                                            </Badge>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                 <div className="flex items-center justify-center h-20 text-muted-foreground">{t.no_market_analysis_available}</div>
                            )}
                        </CardContent>
                    </Card>

                </div>
            )}
        </div>
    );
}
