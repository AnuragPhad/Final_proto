import { puneMandiRates } from "./pune-mandi-rates";
import { nashikMandiRates } from "./nashik-mandi-rates";
import { solapurMandiRates } from "./solapur-mandi-rates";

export interface MandiRate {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  arrival_date: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
}

interface ApiRecord {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  arrival_date: string;
  min_price: string;
  max_price: string;
  modal_price: string;
}

const mockData: { [key: string]: MandiRate[] } = {
  'Pune': puneMandiRates,
  'Nashik': nashikMandiRates,
  'Solapur': solapurMandiRates,
};


export const getMandiRates = async (state: string, district: string): Promise<MandiRate[]> => {
  console.log(`Fetching mock mandi rates for: ${district}, ${state}`);
  
  // Use mock data based on district. If not found, it will be undefined.
  const rates = mockData[district];
  
  if (rates) {
    return Promise.resolve(rates);
  }

  // Fallback to an empty array if no mock data is found for the district
  return Promise.resolve([]);
};
