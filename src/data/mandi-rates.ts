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

export const getMandiRates = async (state: string, district: string): Promise<MandiRate[]> => {
  const apiKey = process.env.NEXT_PUBLIC_DATA_GOV_API_KEY;
  if (!apiKey) {
    throw new Error('API key for data.gov.in is not configured.');
  }

  const baseUrl = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
  const params = new URLSearchParams({
    'api-key': apiKey,
    format: 'json',
    'filters[state.keyword]': state,
    'filters[district]': district,
  });

  const url = `${baseUrl}?${params.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    const data = await response.json();

    if (!data.records) {
      return [];
    }

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
  } catch (error) {
    console.error('Error fetching mandi rates:', error);
    throw error;
  }
};
