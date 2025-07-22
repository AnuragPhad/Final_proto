'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HandPlatter, Wheat, Apple, Carrot, LeafyGreen, Citrus, LineChart, TrendingUp, BrainCircuit } from 'lucide-react';
import { puneMandiRates } from '@/data/pune-mandi-rates';
import type { MandiRate } from '@/data/mandi-rates';
import { subDays, format } from 'date-fns';
import { priceTrendFlow, PriceTrendOutput } from '@/ai/flows/price-trend-flow';
import { commodityAnalysisFlow, CommodityAnalysisOutput } from '@/ai/flows/commodity-analysis-flow';
import { Skeleton } from '@/components/ui/skeleton';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

const commodities = [
    { name: 'Onion', icon: <HandPlatter className="h-10 w-10" /> },
    { name: 'Potato', icon: <Carrot className="h-10 w-10" /> },
    { name: 'Tomato', icon: <Apple className="h-10 w-10" /> },
    { name: 'Wheat', icon: <Wheat className="h-10 w-10" /> },
    { name: 'Cabbage', icon: <LeafyGreen className="h-10 w-10" /> },
    { name: 'Lemon', icon: <Citrus className="h-10 w-10" /> },
];

const mockMarketData = [
    { market: 'Pune', price: 2250 },
    { market: 'Nashik', price: 2400 },
    { market: 'Solapur', price: 2100 },
    { market: 'Mumbai', price: 2550 },
    { market: 'Nagpur', price: 2300 },
];

export default function CommodityIntelligenceClient() {
    const [selectedCommodity, setSelectedCommodity] = useState<string | null>(null);
    const [trendData, setTrendData] = useState<any[]>([]);
    const [trendAdvice, setTrendAdvice] = useState<PriceTrendOutput | null>(null);
    const [marketAnalysis, setMarketAnalysis] = useState<CommodityAnalysisOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (selectedCommodity) {
            setIsLoading(true);
            setTrendData([]);
            setTrendAdvice(null);
            setMarketAnalysis(null);

            const today = new Date();
            const thirtyDaysAgo = subDays(today, 30);

            // Fetch historical data for trend
            const historicalData = puneMandiRates
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
            }

            // Generate AI market analysis
            const generateMarketAnalysis = async () => {
                try {
                    const analysis = await commodityAnalysisFlow({
                        commodity: selectedCommodity,
                        prices: mockMarketData.map(d => ({ market: d.market, price: d.price }))
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
    }, [selectedCommodity]);
    
    const chartConfig = {
      price: {
        label: "Price",
        color: "hsl(var(--primary))",
      },
    };

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="text-center mb-8">
                <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tighter">Commodity Intelligence</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-2">
                    Select a commodity to analyze price trends and compare markets.
                </p>
            </div>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Select a Commodity</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4">
                    {commodities.map((commodity) => (
                        <Button
                            key={commodity.name}
                            variant={selectedCommodity === commodity.name ? 'default' : 'outline'}
                            className="flex-col h-24 w-24 p-4 gap-2"
                            onClick={() => setSelectedCommodity(commodity.name)}
                        >
                            {commodity.icon}
                            <span className="font-semibold">{commodity.name}</span>
                        </Button>
                    ))}
                </CardContent>
            </Card>

            {selectedCommodity && (
                <div className="space-y-8">
                    <h2 className="font-headline text-2xl font-bold text-center">
                        Analysis for {selectedCommodity}
                    </h2>

                    {/* Price Trend Analysis */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2"><LineChart /> Price Trend</CardTitle>
                            <CardDescription>Last 30 days of modal prices in Pune market.</CardDescription>
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
                                          <Area dataKey="price" type="natural" fill="var(--color-price)" fillOpacity={0.4} stroke="var(--color-price)" />
                                      </AreaChart>
                                    </ChartContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-muted-foreground">Not enough data for trend analysis.</div>
                                )}
                            </div>
                            <div className="lg:col-span-1">
                                {isLoading ? <Skeleton className="h-24 w-full" /> : 
                                trendAdvice ? (
                                    <Alert className="h-full bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                                        <TrendingUp className="h-4 w-4 text-green-600" />
                                        <AlertTitle className="font-headline text-green-800 dark:text-green-300">AI Selling Advice</AlertTitle>
                                        <AlertDescription className="text-green-700 dark:text-green-400">
                                            <p className="font-bold">{trendAdvice.trend}</p>
                                            <p>{trendAdvice.suggestion}</p>
                                        </AlertDescription>
                                    </Alert>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-muted-foreground">No trend advice available.</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Cross-Market Analysis */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2"><BrainCircuit /> Cross-Market Analysis</CardTitle>
                            <CardDescription>Comparison of current prices across different districts.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {isLoading ? Array.from({length: 5}).map((_, i) => <Skeleton key={i} className="h-10 w-full" />) :
                                mockMarketData.map(market => (
                                <div key={market.market} className="flex justify-between items-center p-3 rounded-md bg-muted/50">
                                    <p className="font-semibold">{market.market}</p>
                                    <Badge variant={market.market === marketAnalysis?.highestPriceMarket ? "default" : market.market === marketAnalysis?.lowestPriceMarket ? "destructive" : "secondary"}>
                                        Rs {market.price} / Quintal
                                    </Badge>
                                </div>
                                ))}
                        </CardContent>
                    </Card>

                </div>
            )}
        </div>
    );
}
