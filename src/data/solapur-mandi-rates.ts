import { subDays, format } from 'date-fns';
import { MandiRate } from './mandi-rates';

// Function to generate fluctuating dummy data for Solapur
const generateDummyData = (commodity: string, basePrice: number, fluctuation: number): MandiRate[] => {
  const data: MandiRate[] = [];
  const today = new Date();
  let currentPrice = basePrice;

  for (let i = 29; i >= 0; i--) {
    const date = subDays(today, i);
    const priceFluctuation = (Math.random() - 0.5) * fluctuation; // Different pattern again
    currentPrice += priceFluctuation;
    currentPrice = Math.max(currentPrice, basePrice - fluctuation * 6);

    const modalPrice = Math.round(currentPrice / 10) * 10;
    const minPrice = modalPrice - (40 + Math.round(Math.random() * 60));
    const maxPrice = modalPrice + (60 + Math.round(Math.random() * 40));
    
    data.push({
      state: 'Maharashtra',
      district: 'Solapur',
      market: 'Solapur',
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

// Solapur has different price points
const onionData = generateDummyData('Onion', 2100, 160); // Generally lower prices
const potatoData = generateDummyData('Potato', 1700, 90);
const tomatoData = generateDummyData('Tomato', 1600, 180);
const wheatData = generateDummyData('Wheat', 1950, 130);
const cabbageData = generateDummyData('Cabbage', 850, 100);
const lemonData = generateDummyData('Lemon', 2800, 280);
const grapesData = generateDummyData('Grapes', 4200, 450);
const appleData = generateDummyData('Apple', 7500, 750);


export const solapurMandiRates: MandiRate[] = [
  ...onionData,
  ...potatoData,
  ...tomatoData,
  ...wheatData,
  ...cabbageData,
  ...lemonData,
  ...grapesData,
  ...appleData,
];
