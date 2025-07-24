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
  console.log(`Fetching mandi rates for: ${district}, ${state}`);

  // If the selected district is one of the special simulated ones, use mock data.
  if (mockData[district]) {
    console.log(`Using mock data for ${district}`);
    return Promise.resolve(mockData[district]);
  }

  // Otherwise, fetch from the live API.
  const apiKey = process.env.NEXT_PUBLIC_DATA_GOV_API_KEY;

  if (!apiKey) {
    console.error('API key for data.gov.in is not configured. Falling back to empty array.');
    return Promise.resolve([]);
  }

  console.log(`Fetching live data from data.gov.in for ${district}`);
  const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&offset=0&limit=1000&filters[state]=${encodeURIComponent(state)}&filters[district]=${encodeURIComponent(district)}`;
  
  try {
    const response = await fetch(url, { cache: 'no-store' }); // Use no-store to get latest data
    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }
    const data = await response.json();
    
    if (data.records) {
      return data.records.map((record: ApiRecord) => ({
        state: record.state,
        district: record.district,
        market: record.market,
        commodity: record.commodity,
        variety: record.variety,
        arrival_date: record.arrival_date,
        minPrice: parseInt(record.min_price, 10),
        maxPrice: parseInt(record.max_price, 10),
        modalPrice: parseInt(record.modal_price, 10),
      }));
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch or process live mandi data:', error);
    // In case of an API error, return an empty array instead of crashing.
    return [];
  }
};
