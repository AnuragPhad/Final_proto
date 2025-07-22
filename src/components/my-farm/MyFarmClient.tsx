'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CalendarIcon, PlusCircle, Wheat, Apple, Carrot, LeafyGreen, Citrus, HandPlatter, Tractor, Droplets, Camera } from 'lucide-react';
import { format, differenceInDays, addDays } from 'date-fns';
import { useLanguage } from '@/hooks/use-language';
import Link from 'next/link';

const supportedCrops = [
    { name: 'Onion', icon: <HandPlatter className="h-10 w-10" />, duration: 120 },
    { name: 'Potato', icon: <Carrot className="h-10 w-10" />, duration: 100 },
    { name: 'Tomato', icon: <Apple className="h-10 w-10" />, duration: 90 },
    { name: 'Wheat', icon: <Wheat className="h-10 w-10" />, duration: 150 },
    { name: 'Cabbage', icon: <LeafyGreen className="h-10 w-10" />, duration: 80 },
    { name: 'Lemon', icon: <Citrus className="h-10 w-10" />, duration: 180 }, // Example duration
];

interface CropCycle {
    id: string;
    cropName: string;
    sowingDate: Date;
    duration: number; // in days
}

const getCropIcon = (cropName: string) => {
    const crop = supportedCrops.find(c => c.name === cropName);
    return crop ? crop.icon : <Tractor className="h-10 w-10" />;
}

export default function MyFarmClient() {
    const { t } = useLanguage();
    const [cropCycles, setCropCycles] = useState<CropCycle[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    
    // Form state
    const [selectedCrop, setSelectedCrop] = useState<string>('');
    const [sowingDate, setSowingDate] = useState<Date | undefined>(new Date());

    const handleAddCropCycle = () => {
        if (selectedCrop && sowingDate) {
            const cropDetails = supportedCrops.find(c => c.name === selectedCrop);
            if (!cropDetails) return;

            const newCycle: CropCycle = {
                id: new Date().toISOString(),
                cropName: selectedCrop,
                sowingDate: sowingDate,
                duration: cropDetails.duration,
            };
            setCropCycles(prev => [...prev, newCycle]);
            
            // Reset form and close dialog
            setSelectedCrop('');
            setSowingDate(new Date());
            setIsDialogOpen(false);
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tighter">{t.my_farm_title}</h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mt-2">
                        {t.my_farm_subtitle}
                    </p>
                </div>
                 <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" /> {t.start_new_cycle}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{t.add_new_crop_cycle}</DialogTitle>
                            <DialogDescription>
                                {t.add_new_crop_cycle_desc}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="crop" className="text-right">
                                    {t.crop_label}
                                </Label>
                                <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder={t.select_a_crop} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {supportedCrops.map(crop => (
                                            <SelectItem key={crop.name} value={crop.name}>{crop.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="sowing-date" className="text-right">
                                    {t.sowing_date_label}
                                </Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="col-span-3 justify-start text-left font-normal">
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {sowingDate ? format(sowingDate, 'PPP') : <span>{t.pick_a_date}</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar mode="single" selected={sowingDate} onSelect={setSowingDate} initialFocus />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleAddCropCycle} disabled={!selectedCrop || !sowingDate}>{t.add_cycle_button}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {cropCycles.length === 0 ? (
                 <Card className="h-64 flex flex-col items-center justify-center text-center p-6 border-dashed">
                    <Tractor className="h-16 w-16 text-muted-foreground/50 mb-4" />
                    <h2 className="text-xl font-headline font-semibold">{t.no_active_cycles_title}</h2>
                    <p className="text-muted-foreground mb-4">{t.no_active_cycles_desc}</p>
                    <Button onClick={() => setIsDialogOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" /> {t.start_your_first_cycle}
                    </Button>
                 </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {cropCycles.map(cycle => {
                        const daysSinceSowing = differenceInDays(new Date(), cycle.sowingDate);
                        const progress = Math.min(Math.round((daysSinceSowing / cycle.duration) * 100), 100);
                        const estimatedHarvestDate = addDays(cycle.sowingDate, cycle.duration);

                        return (
                            <Card key={cycle.id} className="flex flex-col">
                                <CardHeader className="flex flex-row items-start gap-4">
                                    <div className="text-primary">{getCropIcon(cycle.cropName)}</div>
                                    <div>
                                        <CardTitle className="font-headline text-2xl">{cycle.cropName}</CardTitle>
                                        <CardDescription>{t.sown_on} {format(cycle.sowingDate, 'do MMMM yyyy')}</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-grow space-y-4">
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="text-sm font-medium">{t.day} {daysSinceSowing} / {cycle.duration}</p>
                                            <p className="text-sm text-muted-foreground">{t.estimated_harvest}: {format(estimatedHarvestDate, 'dd MMM')}</p>
                                        </div>
                                        <Progress value={progress} />
                                    </div>
                                    <div className="relative pl-6 before:absolute before:left-2 before:top-2 before:h-[calc(100%-1rem)] before:w-0.5 before:bg-border">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="z-10 flex h-5 w-5 items-center justify-center rounded-full bg-secondary">
                                                <Droplets className="h-3 w-3 text-secondary-foreground" />
                                            </div>
                                            <p className="text-sm">{t.next_watering_due_in} 3 {t.days}.</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="z-10 flex h-5 w-5 items-center justify-center rounded-full bg-secondary">
                                                <Camera className="h-3 w-3 text-secondary-foreground" />
                                            </div>
                                            <p className="text-sm">{t.weekly_photo_check_due}.</p>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button asChild variant="outline" className="w-full">
                                        <Link href="/crop-doctor">
                                            <Camera className="mr-2 h-4 w-4" /> {t.upload_health_photo}
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    );
}
