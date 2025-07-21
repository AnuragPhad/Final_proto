export interface MandiRate {
  commodity: string;
  variety: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
}

export const getMockMandiRates = (district: string, date: string): MandiRate[] => {
  // In a real app, this would be an API call.
  // Here, we return mock data, slightly randomized.
  const baseRates = [
    { commodity: 'Onion', variety: 'Red', basePrice: 2500 },
    { commodity: 'Potato', variety: 'Agra', basePrice: 1800 },
    { commodity: 'Tomato', variety: 'Hybrid', basePrice: 2200 },
    { commodity: 'Wheat', variety: 'Lokwan', basePrice: 2800 },
    { commodity: 'Soybean', variety: 'Yellow', basePrice: 4500 },
    { commodity: 'Cotton', variety: 'Long Staple', basePrice: 7000 },
  ];

  const seed = district.length + new Date(date).getDate();
  
  return baseRates.map(rate => {
    const randomFactor = ((seed * rate.basePrice) % 100) / 500; // between 0 and 0.2
    const modalPrice = Math.floor(rate.basePrice * (1 + randomFactor - 0.1));
    const minPrice = Math.floor(modalPrice * 0.9);
    const maxPrice = Math.floor(modalPrice * 1.1);
    
    return {
      ...rate,
      minPrice,
      maxPrice,
      modalPrice,
    };
  });
};
