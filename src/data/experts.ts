export interface Expert {
  id: number;
  name: string;
  specialization: string;
  image: string;
  tags: string[];
  contact: {
    phone: string;
    email: string;
  };
}

export const expertsData: Expert[] = [
  {
    id: 1,
    name: 'Dr. Ramesh Kumar',
    specialization: 'Soil Health & Nutrition Specialist',
    image: 'https://ui-avatars.com/api/?name=Ramesh+Kumar&background=random&size=128',
    tags: ['Soil Testing', 'Fertilizers', 'Organic Farming'],
    contact: {
      phone: '+919876543210',
      email: 'ramesh.kumar@agriexperts.com',
    },
  },
  {
    id: 2,
    name: 'Sunita Sharma',
    specialization: 'Pest & Disease Management',
    image: 'https://ui-avatars.com/api/?name=Sunita+Sharma&background=random&size=128',
    tags: ['Pesticides', 'Integrated Pest Management', 'Fungicides'],
    contact: {
      phone: '+919876543211',
      email: 'sunita.sharma@agriexperts.com',
    },
  },
  {
    id: 3,
    name: 'Anil Verma',
    specialization: 'Horticulture & Fruit Crops',
    image: 'https://ui-avatars.com/api/?name=Anil+Verma&background=random&size=128',
    tags: ['Orchards', 'Grafting', 'Fruit Farming'],
    contact: {
      phone: '+919876543212',
      email: 'anil.verma@agriexperts.com',
    },
  },
    {
    id: 4,
    name: 'Dr. Priya Singh',
    specialization: 'Agronomy & Field Crops',
    image: 'https://ui-avatars.com/api/?name=Priya+Singh&background=random&size=128',
    tags: ['Wheat', 'Rice', 'Crop Rotation'],
    contact: {
      phone: '+919876543213',
      email: 'priya.singh@agriexperts.com',
    },
  },
  {
    id: 5,
    name: 'Vikram Patel',
    specialization: 'Irrigation & Water Management',
    image: 'https://ui-avatars.com/api/?name=Vikram+Patel&background=random&size=128',
    tags: ['Drip Irrigation', 'Water Conservation', 'Pumps'],
    contact: {
      phone: '+919876543214',
      email: 'vikram.patel@agriexperts.com',
    },
  },
  {
    id: 6,
    name: 'Meena Devi',
    specialization: 'Agribusiness & Market Linkage',
    image: 'https://ui-avatars.com/api/?name=Meena+Devi&background=random&size=128',
    tags: ['Market Prices', 'Export', 'FPO'],
    contact: {
      phone: '+919876543215',
      email: 'meena.devi@agriexperts.com',
    },
  },
];
