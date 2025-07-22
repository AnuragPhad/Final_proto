import { subDays, format } from 'date-fns';
import { MandiRate } from './mandi-rates';

// Function to generate fluctuating dummy data
const generateDummyData = (commodity: string, basePrice: number, fluctuation: number): MandiRate[] => {
  const data: MandiRate[] = [];
  const today = new Date();
  let currentPrice = basePrice;

  for (let i = 29; i >= 0; i--) {
    const date = subDays(today, i);
    // Add some randomness to simulate real market data
    const priceFluctuation = (Math.random() - 0.45) * fluctuation;
    currentPrice += priceFluctuation;
    currentPrice = Math.max(currentPrice, basePrice - fluctuation * 5); // Prevent prices from going too low

    const modalPrice = Math.round(currentPrice / 10) * 10;
    const minPrice = modalPrice - (50 + Math.round(Math.random() * 50));
    const maxPrice = modalPrice + (50 + Math.round(Math.random() * 50));
    
    data.push({
      state: 'Maharashtra',
      district: 'Pune',
      market: 'Pune',
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

const onionData = generateDummyData('Onion', 2200, 150);
const potatoData = generateDummyData('Potato', 1800, 100);
const tomatoData = generateDummyData('Tomato', 1500, 200);

export const puneMandiRates: MandiRate[] = [
  ...onionData,
  ...potatoData,
  ...tomatoData,
];
