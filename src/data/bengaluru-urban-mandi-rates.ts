
import { subDays, format } from 'date-fns';
import { MandiRate } from './mandi-rates';

// Function to generate fluctuating dummy data for Bengaluru Urban
const generateDummyData = (commodity: string, basePrice: number, fluctuation: number): MandiRate[] => {
  const data: MandiRate[] = [];
  const today = new Date();
  let currentPrice = basePrice;

  for (let i = 29; i >= 0; i--) {
    const date = subDays(today, i);
    const priceFluctuation = (Math.random() - 0.48) * fluctuation; // Unique fluctuation pattern
    currentPrice += priceFluctuation;
    currentPrice = Math.max(currentPrice, basePrice - fluctuation * 5.5);

    const modalPrice = Math.round(currentPrice / 10) * 10;
    const minPrice = modalPrice - (55 + Math.round(Math.random() * 45));
    const maxPrice = modalPrice + (45 + Math.round(Math.random() * 55));
    
    data.push({
      state: 'Karnataka',
      district: 'Bengaluru Urban',
      market: 'Bengaluru',
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

// Data relevant for Bengaluru Urban market
const ragiData = generateDummyData('Ragi (Finger Millet)', 2500, 150);
const riceData = generateDummyData('Rice', 3800, 200);
const tomatoData = generateDummyData('Tomato', 1300, 250);
const onionData = generateDummyData('Onion', 2300, 180);
const potatoData = generateDummyData('Potato', 1900, 120);
const coconutData = generateDummyData('Coconut', 3000, 200); // Priced per 1000 nuts, assuming quintal conversion for consistency
const carrotData = generateDummyData('Carrot', 2200, 150);
const beansData = generateDummyData('Beans', 3500, 300);


export const bengaluruUrbanMandiRates: MandiRate[] = [
  ...ragiData,
  ...riceData,
  ...tomatoData,
  ...onionData,
  ...potatoData,
  ...coconutData,
  ...carrotData,
  ...beansData,
];
