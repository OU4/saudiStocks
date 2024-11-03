export const API_KEY = process.env.NEXT_PUBLIC_TWELVE_DATA_API_KEY || 'demo';
export const API_URL = 'https://api.twelvedata.com';

export interface CompanyLogo {
  meta: {
    symbol: string;
    name: string;
    currency: string;
    exchange: string;
    mic_code: string;
    exchange_timezone: string;
  };
  url: string;
}

export const SAUDI_MARKET = {
  exchange: 'Tadawul',
  mic_code: 'XSAU',
  currency: 'SAR',
  timezone: 'Asia/Riyadh',
  trading_hours: 'Su-Th, 10:00am - 3:00pm',
  data_delay: '15min'
} as const;

export const SAUDI_SYMBOLS = [
  // Banks & Financial Services
  { symbol: '1180', name: 'Al Rajhi Bank' },
  { symbol: '1010', name: 'Riyad Bank' },
  { symbol: '1150', name: 'Alinma Bank' },
  { symbol: '1180', name: 'Saudi National Bank' },
  { symbol: '1050', name: 'Saudi British Bank' },
  { symbol: '1140', name: 'Bank Albilad' },
  { symbol: '1020', name: 'Bank Aljazira' },
  { symbol: '1060', name: 'Saudi Investment Bank' },
  { symbol: '1080', name: 'Arab National Bank' },
  { symbol: '1120', name: 'Al Jazira Takaful' },

  // Energy & Utilities
  { symbol: '2222', name: 'Saudi Aramco' },
  { symbol: '5110', name: 'Saudi Electricity' },
  { symbol: '2380', name: 'Petro Rabigh' },
  { symbol: '2382', name: 'SABIC Agri-Nutrients' },
  { symbol: '2030', name: 'Saudi Chemical' },

  // Telecommunications
  { symbol: '2350', name: 'Saudi Telecom' },
  { symbol: '7020', name: 'Mobily' },
  { symbol: '7030', name: 'Zain KSA' },
  { symbol: '7040', name: 'Integrated Telecom' },

  // Materials
  { symbol: '1211', name: "Ma'aden" },
  { symbol: '2010', name: 'SABIC' },
  { symbol: '2290', name: 'Yanbu National Petro' },
  { symbol: '2350', name: 'Saudi Kayan' },
  { symbol: '2310', name: 'Sipchem' },
  { symbol: '2060', name: 'National Gas & Industrialization' },

  // Consumer Services & Retail
  { symbol: '4261', name: 'Theeb Rent A Car' },
  { symbol: '4003', name: 'Extra' },
  { symbol: '4190', name: 'Jarir' },
  { symbol: '4240', name: 'Fawaz Alhokair Group' },
  { symbol: '4002', name: 'Mouwasat Medical Services' },

  // Real Estate
  { symbol: '4300', name: 'Dar Al Arkan' },
  { symbol: '4250', name: 'Jabal Omar' },
  { symbol: '4220', name: 'Emaar The Economic City' },
  { symbol: '4230', name: 'Red Sea International' },

  // Transportation
  { symbol: '4031', name: 'Saudi Airlines Catering' },
  { symbol: '4110', name: 'Dr. Sulaiman Al Habib' },
  { symbol: '4260', name: 'Budget Saudi' },
  { symbol: '4261', name: 'Theeb Rent A Car' },

  // Insurance
  { symbol: '8010', name: 'Tawuniya' },
  { symbol: '8020', name: 'Malath Insurance' },
  { symbol: '8050', name: 'Salama Insurance' },
  { symbol: '8060', name: 'Walaa Insurance' },

  // Food & Agriculture
  { symbol: '2280', name: 'Almarai' },
  { symbol: '6001', name: 'Halwani Bros' },
  { symbol: '2270', name: 'Saudia Dairy & Foodstuff' },
  { symbol: '6002', name: 'Herfy Foods' },

  // Healthcare
  { symbol: '4004', name: 'Dallah Healthcare' },
  { symbol: '4005', name: 'Care' },
  { symbol: '4007', name: 'Al Hammadi' },
  { symbol: '4009', name: 'Middle East Healthcare' }
];