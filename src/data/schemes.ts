export interface Scheme {
  title: string;
  description: string;
  category: 'Insurance' | 'Credit' | 'Pension' | 'General';
  link: string;
}

export const schemesData: Scheme[] = [
  {
    title: 'PM-KISAN Scheme',
    description: 'A government scheme with the objective to augment the income of the Small and Marginal Farmers (SMFs).',
    category: 'General',
    link: 'https://pmkisan.gov.in/',
  },
  {
    title: 'Soil Health Card Scheme',
    description: 'A scheme to provide every farmer with a Soil Health Card, which contains crop-wise recommendations of nutrients and fertilizers.',
    category: 'General',
    link: 'https://soilhealth.dac.gov.in/',
  },
  {
    title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    description: 'An actuarial premium-based scheme where farmers have to pay a maximum premium of 2 percent for Kharif, 1.5 percent for Rabi food and oilseed crops.',
    category: 'Insurance',
    link: 'https://pmfby.gov.in/',
  },
  {
    title: 'Kisan Credit Card (KCC) Scheme',
    description: 'The KCC scheme was introduced to ensure that the credit requirements for farmers in the agriculture, fisheries, and animal husbandry sectors are being met.',
    category: 'Credit',
    link: 'https://www.sbi.co.in/web/agri-rural/agriculture-banking/crop-finance/kisan-credit-card',
  },
  {
    title: 'Pradhan Mantri Kisan Maandhan Yojana',
    description: 'A pension scheme for all Small and Marginal Farmers (SMF) in the country with an entry age group of 18 to 40 years.',
    category: 'Pension',
    link: 'https://maandhan.in/',
  },
];
