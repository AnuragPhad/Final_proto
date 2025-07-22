export interface Scheme {
  id: number;
  title: string;
  description: string;
  category: 'Agriculture & Rural Development' | 'Health & Wellness' | 'Education' | 'Social Welfare';
  ministry: string;
  state: 'Central' | 'Maharashtra' | 'Uttar Pradesh'; // Example states
  age: [number, number]; // min and max age
  link: string;
}

export const schemesData: Scheme[] = [
  {
    id: 1,
    title: 'PM-KISAN Scheme',
    description: 'A government scheme with the objective to augment the income of the Small and Marginal Farmers (SMFs) by providing income support.',
    category: 'Agriculture & Rural Development',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    state: 'Central',
    age: [18, 100],
    link: 'https://pmkisan.gov.in/',
  },
  {
    id: 2,
    title: 'Soil Health Card Scheme',
    description: 'A scheme to provide every farmer with a Soil Health Card, which contains crop-wise recommendations of nutrients and fertilizers.',
    category: 'Agriculture & Rural Development',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    state: 'Central',
    age: [18, 100],
    link: 'https://soilhealth.dac.gov.in/',
  },
  {
    id: 3,
    title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    description: 'An actuarial premium-based scheme where farmers have to pay a maximum premium of 2 percent for Kharif, 1.5 percent for Rabi food and oilseed crops.',
    category: 'Agriculture & Rural Development',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    state: 'Central',
    age: [18, 100],
    link: 'https://pmfby.gov.in/',
  },
  {
    id: 4,
    title: 'Kisan Credit Card (KCC) Scheme',
    description: 'The KCC scheme was introduced to ensure that the credit requirements for farmers in the agriculture, fisheries, and animal husbandry sectors are being met.',
    category: 'Agriculture & Rural Development',
    ministry: 'Ministry of Finance',
    state: 'Central',
    age: [18, 70],
    link: 'https://www.sbi.co.in/web/agri-rural/agriculture-banking/crop-finance/kisan-credit-card',
  },
  {
    id: 5,
    title: 'Pradhan Mantri Kisan Maandhan Yojana',
    description: 'A pension scheme for all Small and Marginal Farmers (SMF) in the country with an entry age group of 18 to 40 years.',
    category: 'Social Welfare',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    state: 'Central',
    age: [18, 40],
    link: 'https://maandhan.in/',
  },
  {
    id: 6,
    title: 'National Food Security Mission (NFSM)',
    description: 'Aims to increase production of rice, wheat, pulses, coarse cereals and commercial crops through area expansion and productivity enhancement.',
    category: 'Agriculture & Rural Development',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    state: 'Central',
    age: [18, 100],
    link: 'https://www.nfsm.gov.in/',
  },
  {
    id: 7,
    title: 'Mahatma Phule Shetkari Karja Mukti Yojana',
    description: 'A debt waiver scheme for farmers in Maharashtra to relieve them of their agricultural loans.',
    category: 'Agriculture & Rural Development',
    ministry: 'Government of Maharashtra',
    state: 'Maharashtra',
    age: [18, 100],
    link: 'https://mjpsky.maharashtra.gov.in/',
  },
  {
    id: 8,
    title: 'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (PM-JAY)',
    description: 'Provides health insurance coverage of up to Rs. 5 lakh per family per year for secondary and tertiary care hospitalization.',
    category: 'Health & Wellness',
    ministry: 'Ministry of Health and Family Welfare',
    state: 'Central',
    age: [0, 100],
    link: 'https://pmjay.gov.in/',
  },
  {
    id: 9,
    title: 'UP Agriculture Technical Support Scheme',
    description: 'A scheme by the Uttar Pradesh government to provide technical assistance and modern farming equipment to farmers.',
    category: 'Agriculture & Rural Development',
    ministry: 'Government of Uttar Pradesh',
    state: 'Uttar Pradesh',
    age: [18, 100],
    link: '#', // Placeholder link
  },
];
