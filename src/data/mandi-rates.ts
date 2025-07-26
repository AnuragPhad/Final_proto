import { puneMandiRates } from "./pune-mandi-rates";
import { nashikMandiRates } from "./nashik-mandi-rates";
import { solapurMandiRates } from "./solapur-mandi-rates";
import { bengaluruUrbanMandiRates } from "./bengaluru-urban-mandi-rates";

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
  'Bengaluru Urban': bengaluruUrbanMandiRates,
};

export const getMandiRates = async (state: string, district: string): Promise<MandiRate[]> => {
  const apiKey = process.env.NEXT_PUBLIC_DATA_GOV_API_KEY;
  
  if (!apiKey) {
    console.warn("API key is missing. Falling back to mock data.");
    // Fallback to mock data if API key is not available
    const rates = mockData[district];
    if (rates) {
      return Promise.resolve(rates);
    }
    return Promise.resolve([]);
  }

  const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&offset=0&limit=1000&filters[state]=${encodeURIComponent(state)}&filters[district]=${encodeURIComponent(district)}`;
  
  try {
    const response = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour
    if (!response.ok) {
      console.error('Failed to fetch from data.gov.in API:', response.status, response.statusText);
      throw new Error('Failed to fetch mandi rates from API.');
    }
    const data = await response.json();
    
    if (!data.records) {
      console.warn("No records found for the given state and district.");
      return [];
    }

    // Transform API data into our MandiRate format
    return data.records.map((record: ApiRecord) => ({
      state: record.state,
      district: record.district,
      market: record.market,
      commodity: record.commodity,
      variety: record.variety,
      arrival_date: record.arrival_date,
      minPrice: parseFloat(record.min_price),
      maxPrice: parseFloat(record.max_price),
      modalPrice: parseFloat(record.modal_price),
    }));
  } catch (error) {
    console.error('Error fetching or processing mandi rates:', error);
    // On error, you might want to return empty or handle it differently
    return [];
  }
};
