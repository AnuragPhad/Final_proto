import { subDays, format } from 'date-fns';
import { MandiRate } from './mandi-rates';

// Function to generate fluctuating dummy data for Nashik
const generateDummyData = (commodity: string, basePrice: number, fluctuation: number): MandiRate[] => {
  const data: MandiRate[] = [];
  const today = new Date();
  let currentPrice = basePrice;

  for (let i = 29; i >= 0; i--) {
    const date = subDays(today, i);
    const priceFluctuation = (Math.random() - 0.4) * fluctuation; // Slightly different fluctuation pattern
    currentPrice += priceFluctuation;
    currentPrice = Math.max(currentPrice, basePrice - fluctuation * 5);

    const modalPrice = Math.round(currentPrice / 10) * 10;
    const minPrice = modalPrice - (60 + Math.round(Math.random() * 40));
    const maxPrice = modalPrice + (40 + Math.round(Math.random() * 60));
    
    data.push({
      state: 'Maharashtra',
      district: 'Nashik',
      market: 'Nashik',
      commodity: commodity,
      variety: 'Other',
      arrival_date: format(date, 'dd/MM/yyyy'),
      minPrice: minPrice,
      maxPrice: maxPrice,
      modalPrice: modalPrice
    });
  }
  return data;
};

// Nashik is famous for Onions and Grapes
const onionData = generateDummyData('Onion', 2400, 180); // Higher base price for onions
const potatoData = generateDummyData('Potato', 1750, 110);
const tomatoData = generateDummyData('Tomato', 1400, 220);
const wheatData = generateDummyData('Wheat', 2050, 110);
const cabbageData = generateDummyData('Cabbage', 750, 80);
const lemonData = generateDummyData('Lemon', 2900, 310);
const grapesData = generateDummyData('Grapes', 5000, 500); // Higher base price for grapes
const appleData = generateDummyData('Apple', 7800, 650);

export const nashikMandiRates: MandiRate[] = [
  ...onionData,
  ...potatoData,
  ...tomatoData,
  ...wheatData,
  ...cabbageData,
  ...lemonData,
  ...grapesData,
  ...appleData,
];
