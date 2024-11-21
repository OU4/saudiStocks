// /app/config/market.ts

export const API_KEY = process.env.NEXT_PUBLIC_TWELVE_DATA_API_KEY || 'b82e4abed0b347e7bd07c5d33cc753e3';
export const API_URL = 'https://api.twelvedata.com';
export const WS_URL = 'wss://ws.twelvedata.com/v1/quotes/price';

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


// Helper function to format symbol for API calls
export function formatSymbol(tickerSymbol: string) {
    return `${tickerSymbol}:TADAWUL`;
  }




export const SAUDI_MARKET = {
  exchange: 'Tadawul',
  mic_code: 'XSAU',
  currency: 'SAR',
  timezone: 'Asia/Riyadh',
  trading_hours: 'Su-Th, 10:00am - 3:00pm',
  data_delay: '15min'
} as const;

// Updated with correct symbols and standardized format
export const SAUDI_SYMBOLS = [
  // Banks & Financial Services
  
      {
          symbol: '2222:TADAWUL',
          tickerSymbol: '2222',
          name: 'Saudi Aramco',
          name_ar: 'أرامكو السعودية',
          sector: 'Energy',
          website: 'www.saudiaramco.com'
      },
      {
          symbol: '2381:TADAWUL',
          tickerSymbol: '2381',
          name: 'Arabian Drilling',
          name_ar: 'شركة الحفر العربية',
          sector: 'Energy',
          website: 'www.arabdrill.com'
      },
      {
          symbol: '2382:TADAWUL',
          tickerSymbol: '2382',
          name: 'ADES',
          name_ar: 'أديس',
          sector: 'Energy',
          website: 'www.adesgroup.com'
      },
      {
          symbol: '2380:TADAWUL',
          tickerSymbol: '2380',
          name: 'Petro Rabigh',
          name_ar: 'بترورابغ',
          sector: 'Energy',
          website: 'www.petrorabigh.com'
      },
      {
          symbol: '4030:TADAWUL',
          tickerSymbol: '4030',
          name: 'Bahri',
          name_ar: 'البحري',
          sector: 'Transportation',
          website: 'www.bahri.sa'
      },
      {
          symbol: '4200:TADAWUL',
          tickerSymbol: '4200',
          name: 'Aldrees',
          name_ar: 'الدريس',
          sector: 'Energy',
          website: 'www.aldrees.com'
      },
      {
          symbol: '2030:TADAWUL',
          tickerSymbol: '2030',
          name: 'SARCO',
          name_ar: 'ساركو',
          sector: 'Materials',
          website: 'www.sarco.com.sa'
      },
      {
          symbol: '1202:TADAWUL',
          tickerSymbol: '1202',
          name: 'MEPCO',
          name_ar: 'مبكو',
          sector: 'Materials',
          website: 'www.mepco.biz'
      },
      {
          symbol: '3007:TADAWUL',
          tickerSymbol: '3007',
          name: 'Oasis',
          name_ar: 'واحة',
          sector: 'Materials',
          website: 'www.oasis.com.sa'
      },
      {
          symbol: '1201:TADAWUL',
          tickerSymbol: '1201',
          name: 'Takween',
          name_ar: 'تكوين',
          sector: 'Materials',
          website: 'www.takween.com.sa'
      },
      {
          symbol: '1322:TADAWUL',
          tickerSymbol: '1322',
          name: 'AMAK',
          name_ar: 'أمك',
          sector: 'Materials',
          website: 'www.amak.com.sa'
      },
      {
          symbol: '3008:TADAWUL',
          tickerSymbol: '3008',
          name: 'Alkathiri',
          name_ar: 'الكثيري',
          sector: 'Materials',
          website: 'www.alkathiri.com'
      },
      {
          symbol: '2001:TADAWUL',
          tickerSymbol: '2001',
          name: 'Chemanol',
          name_ar: 'كيمانول',
          sector: 'Materials',
          website: 'www.chemanol.com'
      },
      {
          symbol: '2010:TADAWUL',
          tickerSymbol: '2010',
          name: 'SABIC',
          name_ar: 'سابك',
          sector: 'Materials',
          website: 'www.sabic.com'
      },
      {
          symbol: '2020:TADAWUL',
          tickerSymbol: '2020',
          name: 'SABIC Agri-Nutrients',
          name_ar: 'سابك للمغذيات الزراعية',
          sector: 'Materials',
          website: 'www.sabic-agri.com'
      },
      {
          symbol: '2060:TADAWUL',
          tickerSymbol: '2060',
          name: 'Tasnee',
          name_ar: 'تصنيع',
          sector: 'Materials',
          website: 'www.tasnee.com'
      },
      {
          symbol: '2170:TADAWUL',
          tickerSymbol: '2170',
          name: 'Alujain',
          name_ar: 'اللجين',
          sector: 'Materials',
          website: 'www.alujain.com'
      },
      {
          symbol: '2210:TADAWUL',
          tickerSymbol: '2210',
          name: 'Nama Chemicals',
          name_ar: 'نماء للكيماويات',
          sector: 'Materials',
          website: 'www.nama.com.sa'
      },
      {
          symbol: '2250:TADAWUL',
          tickerSymbol: '2250',
          name: 'SIIG',
          name_ar: 'المجموعة السعودية',
          sector: 'Materials',
          website: 'www.siig.com.sa'
      },
      {
          symbol: '2290:TADAWUL',
          tickerSymbol: '2290',
          name: 'Yansab',
          name_ar: 'ينساب',
          sector: 'Materials',
          website: 'www.yansab.com.sa'
      },
      {
          symbol: '2310:TADAWUL',
          tickerSymbol: '2310',
          name: 'Sipchem',
          name_ar: 'سبكيم',
          sector: 'Materials',
          website: 'www.sipchem.com'
      },
      {
          symbol: '2330:TADAWUL',
          tickerSymbol: '2330',
          name: 'Advanced',
          name_ar: 'المتقدمة',
          sector: 'Materials',
          website: 'www.advancedpetrochem.com'
      },
      {
          symbol: '2350:TADAWUL',
          tickerSymbol: '2350',
          name: 'Saudi Kayan',
          name_ar: 'كيان السعودية',
          sector: 'Materials',
          website: 'www.saudikayan.com'
      },
      {
          symbol: '2223:TADAWUL',
          tickerSymbol: '2223',
          name: 'Luberef',
          name_ar: 'لوبريف',
          sector: 'Energy',
          website: 'www.luberef.com'
      },
      {
          symbol: '1301:TADAWUL',
          tickerSymbol: '1301',
          name: 'Aslak',
          name_ar: 'أسلاك',
          sector: 'Materials',
          website: 'www.aslak.com.sa'
      },
      {
          symbol: '1320:TADAWUL',
          tickerSymbol: '1320',
          name: 'SSP',
          name_ar: 'سبكيم',
          sector: 'Materials',
          website: 'www.ssp.com.sa'
      },
      {
          symbol: '2090:TADAWUL',
          tickerSymbol: '2090',
          name: 'NGC',
          name_ar: 'غاز',
          sector: 'Materials',
          website: 'www.ngc.com.sa'
      },
      {
          symbol: '2200:TADAWUL',
          tickerSymbol: '2200',
          name: 'APC',
          name_ar: 'الأسمدة العربية',
          sector: 'Materials',
          website: 'www.apc.com.sa'
      },
      {
          symbol: '2240:TADAWUL',
          tickerSymbol: '2240',
          name: 'Zamil Industrial',
          name_ar: 'الزامل للصناعة',
          sector: 'Materials',
          website: 'www.zamilindustrial.com'
      },
      {
          symbol: '2360:TADAWUL',
          tickerSymbol: '2360',
          name: 'SVCP',
          name_ar: 'الفخارية',
          sector: 'Materials',
          website: 'www.svcp.com.sa'
      },
      {
          symbol: '1304:TADAWUL',
          tickerSymbol: '1304',
          name: 'Alyamamah Steel',
          name_ar: 'اليمامة للحديد',
          sector: 'Materials',
          website: 'www.alyamamahsteel.com'
      },
      {
          symbol: '1321:TADAWUL',
          tickerSymbol: '1321',
          name: 'East Pipes',
          name_ar: 'أنابيب الشرق',
          sector: 'Materials',
          website: 'www.eastpipes.com'
      },
      {
          symbol: '1210:TADAWUL',
          tickerSymbol: '1210',
          name: 'BCI',
          name_ar: 'الكيميائية الأساسية',
          sector: 'Materials',
          website: 'www.bci.com.sa'
      },
      {
          symbol: '1211:TADAWUL',
          tickerSymbol: '1211',
          name: 'Maaden',
          name_ar: 'معادن',
          sector: 'Materials',
          website: 'www.maaden.com.sa'
      },
      {
          symbol: '2150:TADAWUL',
          tickerSymbol: '2150',
          name: 'Zoujaj',
          name_ar: 'الزجاج',
          sector: 'Materials',
          website: 'www.zoujaj.com'
      },
      {
          symbol: '2180:TADAWUL',
          tickerSymbol: '2180',
          name: 'FIPCO',
          name_ar: 'فيبكو',
          sector: 'Materials',
          website: 'www.fipco.com.sa'
      },
      {
          symbol: '2220:TADAWUL',
          tickerSymbol: '2220',
          name: 'Maadaniyah',
          name_ar: 'معادن',
          sector: 'Materials',
          website: 'www.maadaniyah.com'
      },
      {
          symbol: '2300:TADAWUL',
          tickerSymbol: '2300',
          name: 'SPM',
          name_ar: 'السبك',
          sector: 'Materials',
          website: 'www.spm.com.sa'
      },
      {
          symbol: '3002:TADAWUL',
          tickerSymbol: '3002',
          name: 'Najran Cement',
          name_ar: 'أسمنت نجران',
          sector: 'Materials',
          website: 'www.najrancement.com'
      },
      {
          symbol: '3003:TADAWUL',
          tickerSymbol: '3003',
          name: 'City Cement',
          name_ar: 'أسمنت المدينة',
          sector: 'Materials',
          website: 'www.citycement.com.sa'
      },
      {
          symbol: '3004:TADAWUL',
          tickerSymbol: '3004',
          name: 'Northern Cement',
          name_ar: 'أسمنت الشمالية',
          sector: 'Materials',
          website: 'www.northerncement.com'
      },
      {
          symbol: '3010:TADAWUL',
          tickerSymbol: '3010',
          name: 'ACC',
          name_ar: 'أسمنت العربية',
          sector: 'Materials',
          website: 'www.arabiacement.com.sa'
      },
      {
          symbol: '3020:TADAWUL',
          tickerSymbol: '3020',
          name: 'YC',
          name_ar: 'أسمنت ينبع',
          sector: 'Materials',
          website: 'www.yanbu-cement.com'
      },
      {
          symbol: '3030:TADAWUL',
          tickerSymbol: '3030',
          name: 'Saudi Cement',
          name_ar: 'أسمنت السعودية',
          sector: 'Materials',
          website: 'www.saudicement.com.sa'
      },
      {
          symbol: '3040:TADAWUL',
          tickerSymbol: '3040',
          name: 'QACCO',
          name_ar: 'أسمنت القصيم',
          sector: 'Materials',
          website: 'www.qcc.com.sa'
      },
      {
          symbol: '3050:TADAWUL',
          tickerSymbol: '3050',
          name: 'SPCC',
          name_ar: 'أسمنت الجنوب',
          sector: 'Materials',
          website: 'www.spcc.com.sa'
      },
      {
          symbol: '3060:TADAWUL',
          tickerSymbol: '3060',
          name: 'YCC',
          name_ar: 'أسمنت ينبع',
          sector: 'Materials',
          website: 'www.yanbu-cement.com'
      },
      {
          symbol: '3080:TADAWUL',
          tickerSymbol: '3080',
          name: 'EPCCO',
          name_ar: 'أسمنت الشرقية',
          sector: 'Materials',
          website: 'www.epcco.com.sa'
      },
      {
          symbol: '3090:TADAWUL',
          tickerSymbol: '3090',
          name: 'TCC',
          name_ar: 'أسمنت تبوك',
          sector: 'Materials',
          website: 'www.tcc.sa'
      },
      {
          symbol: '3091:TADAWUL',
          tickerSymbol: '3091',
          name: 'Jouf Cement',
          name_ar: 'أسمنت الجوف',
          sector: 'Materials',
          website: 'www.joufcement.com'
      },
      {
          symbol: '3005:TADAWUL',
          tickerSymbol: '3005',
          name: 'UACC',
          name_ar: 'أسمنت المتحدة',
          sector: 'Materials',
          website: 'www.uacc.com.sa'
      },
      {
          symbol: '3092:TADAWUL',
          tickerSymbol: '3092',
          name: 'Riyadh Cement',
          name_ar: 'أسمنت الرياض',
          sector: 'Materials',
          website: 'www.riyadhcement.com.sa'
      },
      {
          symbol: '4142:TADAWUL',
          tickerSymbol: '4142',
          name: 'Riyadh Cables',
          name_ar: 'الكابلات السعودية',
          sector: 'Capital Goods',
          website: 'www.riyadh-cables.com'
      },
      {
          symbol: '2160:TADAWUL',
          tickerSymbol: '2160',
          name: 'Amiantit',
          name_ar: 'أميانتيت',
          sector: 'Capital Goods',
          website: 'www.amiantit.com'
      },
      {
          symbol: '4140:TADAWUL',
          tickerSymbol: '4140',
          name: 'SIECO',
          name_ar: 'سيسكو',
          sector: 'Capital Goods',
          website: 'www.sieco.com.sa'
      },
      {
          symbol: '1212:TADAWUL',
          tickerSymbol: '1212',
          name: 'Astra Industrial',
          name_ar: 'مجموعة أسترا الصناعية',
          sector: 'Capital Goods',
          website: 'www.astraindustrial.com'
      },
      {
          symbol: '1302:TADAWUL',
          tickerSymbol: '1302',
          name: 'Bawan',
          name_ar: 'بوان',
          sector: 'Capital Goods',
          website: 'www.bawan.com.sa'
      },
      {
          symbol: '2370:TADAWUL',
          tickerSymbol: '2370',
          name: 'MESC',
          name_ar: 'مسك',
          sector: 'Capital Goods',
          website: 'www.mesc.com.sa'
      },
      {
          symbol: '1303:TADAWUL',
          tickerSymbol: '1303',
          name: 'EIC',
          name_ar: 'إيك',
          sector: 'Capital Goods',
          website: 'www.eic.com.sa'
      },
      {
          symbol: '1214:TADAWUL',
          tickerSymbol: '1214',
          name: 'Shaker',
          name_ar: 'شاكر',
          sector: 'Capital Goods',
          website: 'www.shaker.com.sa'
      },
      {
          symbol: '2320:TADAWUL',
          tickerSymbol: '2320',
          name: 'Albabtain',
          name_ar: 'البابطين',
          sector: 'Capital Goods',
          website: 'www.albabtain.com.sa'
      },
      {
          symbol: '2110:TADAWUL',
          tickerSymbol: '2110',
          name: 'Saudi Cable',
          name_ar: 'الكابلات السعودية',
          sector: 'Capital Goods',
          website: 'www.saudicable.com'
      },
      {
          symbol: '2040:TADAWUL',
          tickerSymbol: '2040',
          name: 'Saudi Ceramics',
          name_ar: 'الخزف السعودي',
          sector: 'Capital Goods',
          website: 'www.saudiceramics.com'
      },
      {
          symbol: '4110:TADAWUL',
          tickerSymbol: '4110',
          name: 'BATIC',
          name_ar: 'باتك',
          sector: 'Capital Goods',
          website: 'www.batic.com.sa'
      },
      {
          symbol: '4141:TADAWUL',
          tickerSymbol: '4141',
          name: 'Alomran',
          name_ar: 'العمران',
          sector: 'Capital Goods',
          website: 'www.alomran.com.sa'
      },
      {
          symbol: '4143:TADAWUL',
          tickerSymbol: '4143',
          name: 'TALCO',
          name_ar: 'تالكو',
          sector: 'Capital Goods',
          website: 'www.talco.com.sa'
      },
      {
          symbol: '4270:TADAWUL',
          tickerSymbol: '4270',
          name: 'SPPC',
          name_ar: 'المطبعة',
          sector: 'Commercial & Professional Services',
          website: 'www.sppc.com.sa'
      },
      {
          symbol: '1831:TADAWUL',
          tickerSymbol: '1831',
          name: 'Maharah',
          name_ar: 'مهارة',
          sector: 'Commercial & Professional Services',
          website: 'www.maharah.com.sa'
      },
      {
          symbol: '6004:TADAWUL',
          tickerSymbol: '6004',
          name: 'Catrion',
          name_ar: 'كاتريون',
          sector: 'Commercial & Professional Services',
          website: 'www.catrion.com.sa'
      },
      {
          symbol: '1833:TADAWUL',
          tickerSymbol: '1833',
          name: 'Almawarid',
          name_ar: 'الموارد',
          sector: 'Commercial & Professional Services',
          website: 'www.almawarid.com.sa'
      },
      {
          symbol: '1832:TADAWUL',
          tickerSymbol: '1832',
          name: 'Sadr',
          name_ar: 'صدر',
          sector: 'Commercial & Professional Services',
          website: 'www.sadr.com.sa'
      },
      {
          symbol: '1834:TADAWUL',
          tickerSymbol: '1834',
          name: 'Smasco',
          name_ar: 'سماسكو',
          sector: 'Commercial & Professional Services',
          website: 'www.smasco.com.sa'
      },
      {
          symbol: '4040:TADAWUL',
          tickerSymbol: '4040',
          name: 'SAPTCO',
          name_ar: 'سابتكو',
          sector: 'Transportation',
          website: 'www.saptco.com.sa'
      },
      {
          symbol: '4260:TADAWUL',
          tickerSymbol: '4260',
          name: 'Budget Saudi',
          name_ar: 'بدجت السعودية',
          sector: 'Transportation',
          website: 'www.budgetsaudi.com'
      },
      {
          symbol: '4031:TADAWUL',
          tickerSymbol: '4031',
          name: 'SGS',
          name_ar: 'الخدمات الأرضية',
          sector: 'Transportation',
          website: 'www.sgs.com.sa'
      },
      {
          symbol: '4261:TADAWUL',
          tickerSymbol: '4261',
          name: 'Theeb',
          name_ar: 'ذيب',
          sector: 'Transportation',
          website: 'www.theeb.com.sa'
      },
      {
          symbol: '4262:TADAWUL',
          tickerSymbol: '4262',
          name: 'Lumi',
          name_ar: 'لومي',
          sector: 'Transportation',
          website: 'www.lumi.com.sa'
      },
      {
          symbol: '4263:TADAWUL',
          tickerSymbol: '4263',
          name: 'SAL',
          name_ar: 'سال',
          sector: 'Transportation',
          website: 'www.sal.com.sa'
      },
      {
          symbol: '2190:TADAWUL',
          tickerSymbol: '2190',
          name: 'SISCO Holding',
          name_ar: 'سيسكو',
          sector: 'Transportation',
          website: 'www.sisco.com.sa'
      },
      {
          symbol: '4180:TADAWUL',
          tickerSymbol: '4180',
          name: 'Fitaihi Group',
          name_ar: 'مجموعة فتيحي',
          sector: 'Consumer Durables & Apparel',
          website: 'www.fitaihi.com.sa'
      },
      {
          symbol: '4012:TADAWUL',
          tickerSymbol: '4012',
          name: 'Alaseel',
          name_ar: 'الأصيل',
          sector: 'Consumer Durables & Apparel',
          website: 'www.alaseel.com.sa'
      },
      {
          symbol: '4011:TADAWUL',
          tickerSymbol: '4011',
          name: 'Lazurde',
          name_ar: 'لازوردي',
          sector: 'Consumer Durables & Apparel',
          website: 'www.lazurde.com'
      },
      {
          symbol: '2130:TADAWUL',
          tickerSymbol: '2130',
          name: 'SIDC',
          name_ar: 'سيدك',
          sector: 'Consumer Durables & Apparel',
          website: 'www.sidc.com.sa'
      },
      {
          symbol: '1213:TADAWUL',
          tickerSymbol: '1213',
          name: 'Naseej',
          name_ar: 'نسيج',
          sector: 'Consumer Durables & Apparel',
          website: 'www.naseej.com.sa'
      },
      {
          symbol: '2340:TADAWUL',
          tickerSymbol: '2340',
          name: 'Artex',
          name_ar: 'أرتكس',
          sector: 'Consumer Durables & Apparel',
          website: 'www.artex.com.sa'
      },
      {
          symbol: '1810:TADAWUL',
          tickerSymbol: '1810',
          name: 'Seera',
          name_ar: 'سيرا',
          sector: 'Consumer Services',
          website: 'www.seera.sa'
      },
      {
          symbol: '4170:TADAWUL',
          tickerSymbol: '4170',
          name: 'TECO',
          name_ar: 'تيكو',
          sector: 'Consumer Services',
          website: 'www.teco.com.sa'
      },
      {
          symbol: '1820:TADAWUL',
          tickerSymbol: '1820',
          name: 'Alhokair Group',
          name_ar: 'مجموعة الحكير',
          sector: 'Consumer Services',
          website: 'www.alhokair.com.sa'
      },
      {
          symbol: '6002:TADAWUL',
          tickerSymbol: '6002',
          name: 'Herfy Foods',
          name_ar: 'هرفي للأغذية',
          sector: 'Consumer Services',
          website: 'www.herfy.com'
      },
      {
          symbol: '6016:TADAWUL',
          tickerSymbol: '6016',
          name: 'Burgerizzr',
          name_ar: 'برغرايززر',
          sector: 'Consumer Services',
          website: 'www.burgerizzr.com'
      },
      {
          symbol: '6013:TADAWUL',
          tickerSymbol: '6013',
          name: 'DWF',
          name_ar: 'دوف',
          sector: 'Consumer Services',
          website: 'www.dwf.com.sa'
      },
      {
          symbol: '6015:TADAWUL',
          tickerSymbol: '6015',
          name: 'Americana',
          name_ar: 'أمريكانا',
          sector: 'Consumer Services',
          website: 'www.americana.com.sa'
      },
      {
          symbol: '1830:TADAWUL',
          tickerSymbol: '1830',
          name: 'Leejam Sports',
          name_ar: 'لجام للرياضة',
          sector: 'Consumer Services',
          website: 'www.leejam.com.sa'
      },
      {
          symbol: '4291:TADAWUL',
          tickerSymbol: '4291',
          name: 'NCLE',
          name_ar: 'نكلي',
          sector: 'Consumer Services',
          website: 'www.ncle.com.sa'
      },
      {
          symbol: '4292:TADAWUL',
          tickerSymbol: '4292',
          name: 'ATAA',
          name_ar: 'عطاء',
          sector: 'Consumer Services',
          website: 'www.ataa.com.sa'
      },
      {
          symbol: '6012:TADAWUL',
          tickerSymbol: '6012',
          name: 'Raydan',
          name_ar: 'رايدان',
          sector: 'Consumer Services',
          website: 'www.raydan.com.sa'
      },
      {
          symbol: '6014:TADAWUL',
          tickerSymbol: '6014',
          name: 'Alamar',
          name_ar: 'المر',
          sector: 'Consumer Services',
          website: 'www.alamar.com.sa'
      },
      {
          symbol: '4290:TADAWUL',
          tickerSymbol: '4290',
          name: 'Alkhaleej Trng',
          name_ar: 'الخليج للتدريب',
          sector: 'Consumer Services',
          website: 'www.alkhaleej.com.sa'
      },
      {
          symbol: '4070:TADAWUL',
          tickerSymbol: '4070',
          name: 'TAPRCO',
          name_ar: 'طابكو',
          sector: 'Media and Entertainment',
          website: 'www.taprco.com.sa'
      },
      {
          symbol: '4210:TADAWUL',
          tickerSymbol: '4210',
          name: 'SRMG',
          name_ar: 'المجموعة السعودية',
          sector: 'Media and Entertainment',
          website: 'www.srmg.com'
      },
      {
          symbol: '4071:TADAWUL',
          tickerSymbol: '4071',
          name: 'Alarabiya',
          name_ar: 'العربية',
          sector: 'Media and Entertainment',
          website: 'www.alarabiya.com.sa'
      },
      {
          symbol: '4072:TADAWUL',
          tickerSymbol: '4072',
          name: 'MBC Group',
          name_ar: 'مجموعة إم بي سي',
          sector: 'Media and Entertainment',
          website: 'www.mbc.net'
      },
      {
          symbol: '4240:TADAWUL',
          tickerSymbol: '4240',
          name: 'Cenomi Retail',
          name_ar: 'سينومي للبيع بالتجزئة',
          sector: 'Consumer Discretionary Distribution & Retail',
          website: 'www.cenomi.com'
      },
      {
          symbol: '4190:TADAWUL',
          tickerSymbol: '4190',
          name: 'Jarir',
          name_ar: 'جرير',
          sector: 'Consumer Discretionary Distribution & Retail',
          website: 'www.jarir.com'
      },
      {
          symbol: '4003:TADAWUL',
          tickerSymbol: '4003',
          name: 'Extra',
          name_ar: 'إكسترا',
          sector: 'Consumer Discretionary Distribution & Retail',
          website: 'www.extra.com.sa'
      },
      {
          symbol: '4050:TADAWUL',
          tickerSymbol: '4050',
          name: 'SASCO',
          name_ar: 'ساسكو',
          sector: 'Consumer Discretionary Distribution & Retail',
          website: 'www.sasco.com.sa'
      },
      {
          symbol: '4192:TADAWUL',
          tickerSymbol: '4192',
          name: 'Alsaif Gallery',
          name_ar: 'معرض السيف',
          sector: 'Consumer Discretionary Distribution & Retail',
          website: 'www.alsaifgallery.com'
      },
      {
          symbol: '4051:TADAWUL',
          tickerSymbol: '4051',
          name: 'Baazeem',
          name_ar: 'بازيم',
          sector: 'Consumer Discretionary Distribution & Retail',
          website: 'www.baazeem.com.sa'
      },
      {
          symbol: '4191:TADAWUL',
          tickerSymbol: '4191',
          name: 'Abo Moati',
          name_ar: 'أبو معطي',
          sector: 'Consumer Discretionary Distribution & Retail',
          website: 'www.abomoati.com.sa'
      },
      {
          symbol: '4008:TADAWUL',
          tickerSymbol: '4008',
          name: 'SACO',
          name_ar: 'ساكو',
          sector: 'Consumer Discretionary Distribution & Retail',
          website: 'www.saco.com.sa'
      },
      {
          symbol: '4001:TADAWUL',
          tickerSymbol: '4001',
          name: 'A.Othaim Market',
          name_ar: 'أسواق العثيم',
          sector: 'Consumer Staples Distribution & Retail',
          website: 'www.othaimmarkets.com'
      },
      {
          symbol: '4161:TADAWUL',
          tickerSymbol: '4161',
          name: 'Bindawood',
          name_ar: 'بندة',
          sector: 'Consumer Staples Distribution & Retail',
          website: 'www.bindawood.com'
      },
      {
          symbol: '4162:TADAWUL',
          tickerSymbol: '4162',
          name: 'Almunajem',
          name_ar: 'المنجم',
          sector: 'Consumer Staples Distribution & Retail',
          website: 'www.almunajem.com'
      },
      {
          symbol: '4164:TADAWUL',
          tickerSymbol: '4164',
          name: 'Nahdi',
          name_ar: 'النهدي',
          sector: 'Consumer Staples Distribution & Retail',
          website: 'www.nahdi.sa'
      },
      {
          symbol: '4163:TADAWUL',
          tickerSymbol: '4163',
          name: 'Aldawaa',
          name_ar: 'الدواء',
          sector: 'Consumer Staples Distribution & Retail',
          website: 'www.aldawaa.com.sa'
      },
      {
          symbol: '4160:TADAWUL',
          tickerSymbol: '4160',
          name: 'Thimar',
          name_ar: 'ثمار',
          sector: 'Consumer Staples Distribution & Retail',
          website: 'www.thimar.com.sa'
      },
      {
          symbol: '4006:TADAWUL',
          tickerSymbol: '4006',
          name: 'Farm Superstores',
          name_ar: 'أسواق المزرعة',
          sector: 'Consumer Staples Distribution & Retail',
          website: 'www.farm.com.sa'
      },
      {
          symbol: '4061:TADAWUL',
          tickerSymbol: '4061',
          name: 'Anaam Holding',
          name_ar: 'أنعام',
          sector: 'Consumer Staples Distribution & Retail',
          website: 'www.anaam.com.sa'
      },
      {
          symbol: '6001:TADAWUL',
          tickerSymbol: '6001',
          name: 'HB',
          name_ar: 'هب',
          sector: 'Food & Beverages',
          website: 'www.hb.com.sa'
      },
      {
          symbol: '2282:TADAWUL',
          tickerSymbol: '2282',
          name: 'Naqi',
          name_ar: 'نقي',
          sector: 'Food & Beverages',
          website: 'www.naqi.com.sa'
      },
      {
          symbol: '2283:TADAWUL',
          tickerSymbol: '2283',
          name: 'First Mills',
          name_ar: 'المطاحن الأولى',
          sector: 'Food & Beverages',
          website: 'www.firstmills.com.sa'
      },
      {
          symbol: '2284:TADAWUL',
          tickerSymbol: '2284',
          name: 'Modern Mills',
          name_ar: 'المطاحن الحديثة',
          sector: 'Food & Beverages',
          website: 'www.modernmills.com.sa'
      },
      {
          symbol: '2285:TADAWUL',
          tickerSymbol: '2285',
          name: 'Arabian Mills',
          name_ar: 'المطاحن العربية',
          sector: 'Food & Beverages',
          website: 'www.arabianmills.com.sa'
      },
      {
          symbol: '2286:TADAWUL',
          tickerSymbol: '2286',
          name: 'Fourth Milling',
          name_ar: 'المطاحن الرابعة',
          sector: 'Food & Beverages',
          website: 'www.fourthmilling.com.sa'
      },
      {
          symbol: '6010:TADAWUL',
          tickerSymbol: '6010',
          name: 'NADEC',
          name_ar: 'نادك',
          sector: 'Food & Beverages',
          website: 'www.nadec.com.sa'
      },
      {
          symbol: '6020:TADAWUL',
          tickerSymbol: '6020',
          name: 'GACO',
          name_ar: 'جكو',
          sector: 'Food & Beverages',
          website: 'www.gaco.com.sa'
      },
      {
          symbol: '6040:TADAWUL',
          tickerSymbol: '6040',
          name: 'TADCO',
          name_ar: 'تادكو',
          sector: 'Food & Beverages',
          website: 'www.tadco.com.sa'
      },
      {
          symbol: '6050:TADAWUL',
          tickerSymbol: '6050',
          name: 'SFICO',
          name_ar: 'صفكو',
          sector: 'Food & Beverages',
          website: 'www.sfico.com.sa'
      },
      {
          symbol: '6060:TADAWUL',
          tickerSymbol: '6060',
          name: 'Sharqiyah Dev',
          name_ar: 'التنمية الشرقية',
          sector: 'Food & Beverages',
          website: 'www.sharqiyahdev.com.sa'
      },
      {
          symbol: '6070:TADAWUL',
          tickerSymbol: '6070',
          name: 'Aljouf',
          name_ar: 'الجوف',
          sector: 'Food & Beverages',
          website: 'www.aljouf.com.sa'
      },
      {
          symbol: '6090:TADAWUL',
          tickerSymbol: '6090',
          name: 'Jazadco',
          name_ar: 'جازادكو',
          sector: 'Food & Beverages',
          website: 'www.jazadco.com'
      },
      {
          symbol: '2281:TADAWUL',
          tickerSymbol: '2281',
          name: 'Tanmiah',
          name_ar: 'تنمية',
          sector: 'Food & Beverages',
          website: 'www.tanmiah.com'
      },
      {
          symbol: '2050:TADAWUL',
          tickerSymbol: '2050',
          name: 'Savola Group',
          name_ar: 'مجموعة صافولا',
          sector: 'Food & Beverages',
          website: 'www.savola.com'
      },
      {
          symbol: '2100:TADAWUL',
          tickerSymbol: '2100',
          name: 'Wafrah',
          name_ar: 'وفرة',
          sector: 'Food & Beverages',
          website: 'www.wafrah.com.sa'
      },
      {
          symbol: '2270:TADAWUL',
          tickerSymbol: '2270',
          name: 'SADAFCO',
          name_ar: 'سدافكو',
          sector: 'Food & Beverages',
          website: 'www.sadafco.com'
      },
      {
          symbol: '2280:TADAWUL',
          tickerSymbol: '2280',
          name: 'Almarai',
          name_ar: 'المراعي',
          sector: 'Food & Beverages',
          website: 'www.almarai.com'
      },
      {
          symbol: '4080:TADAWUL',
          tickerSymbol: '4080',
          name: 'Sinad Holding',
          name_ar: 'سناد القابضة',
          sector: 'Food & Beverages',
          website: 'www.sinad.com.sa'
      },
      {
          symbol: '4014:TADAWUL',
          tickerSymbol: '4014',
          name: 'Equipment House',
          name_ar: 'بيت المعدات',
          sector: 'Health Care Equipment & Services',
          website: 'www.equipmenthouse.com.sa'
      },
      {
          symbol: '4017:TADAWUL',
          tickerSymbol: '4017',
          name: 'Fakeeh Care',
          name_ar: 'فقيه كير',
          sector: 'Health Care Equipment & Services',
          website: 'www.fakeeh.care'
      },
      {
          symbol: '2140:TADAWUL',
          tickerSymbol: '2140',
          name: 'Ayyan',
          name_ar: 'عيان',
          sector: 'Health Care Equipment & Services',
          website: 'www.ayyan.com.sa'
      },
      {
          symbol: '4013:TADAWUL',
          tickerSymbol: '4013',
          name: 'Sulaiman Alhabib',
          name_ar: 'سليمان الحبيب',
          sector: 'Health Care Equipment & Services',
          website: 'www.hmg.com.sa'
      },
      {
          symbol: '4005:TADAWUL',
          tickerSymbol: '4005',
          name: 'Care',
          name_ar: 'رعاية',
          sector: 'Health Care Equipment & Services',
          website: 'www.care.com.sa'
      },
      {
          symbol: '4002:TADAWUL',
          tickerSymbol: '4002',
          name: 'Mouwasat',
          name_ar: 'المواساة',
          sector: 'Health Care Equipment & Services',
          website: 'www.mouwasat.com'
      },
      {
          symbol: '4004:TADAWUL',
          tickerSymbol: '4004',
          name: 'Dallah Health',
          name_ar: 'دله الصحية',
          sector: 'Health Care Equipment & Services',
          website: 'www.dallah.com.sa'
      },
      {
          symbol: '4007:TADAWUL',
          tickerSymbol: '4007',
          name: 'Alhammadi',
          name_ar: 'الحمدي',
          sector: 'Health Care Equipment & Services',
          website: 'www.alhammadi.com.sa'
      },
      {
          symbol: '4009:TADAWUL',
          tickerSymbol: '4009',
          name: 'Saudi German Health',
          name_ar: 'السعودي الألماني الصحية',
          sector: 'Health Care Equipment & Services',
          website: 'www.sgh.com.sa'
      },
      {
          symbol: '2230:TADAWUL',
          tickerSymbol: '2230',
          name: 'Chemical',
          name_ar: 'الكيميائية',
          sector: 'Health Care Equipment & Services',
          website: 'www.chemical.com.sa'
      },
      {
          symbol: '2070:TADAWUL',
          tickerSymbol: '2070',
          name: 'SPIMACO',
          name_ar: 'سبيماكو',
          sector: 'Pharma, Biotech & Life Sciences',
          website: 'www.spimaco.com.sa'
      },
      {
          symbol: '4015:TADAWUL',
          tickerSymbol: '4015',
          name: 'Jamjoom Pharma',
          name_ar: 'جمجوم فارما',
          sector: 'Pharma, Biotech & Life Sciences',
          website: 'www.jamjoompharma.com'
      },
      {
          symbol: '4016:TADAWUL',
          tickerSymbol: '4016',
          name: 'Avalon Pharma',
          name_ar: 'أفالون فارما',
          sector: 'Pharma, Biotech & Life Sciences',
          website: 'www.avalonpharma.com'
      },
      {
          symbol: '1010:TADAWUL',
          tickerSymbol: '1010',
          name: 'Riyad Bank',
          name_ar: 'بنك الرياض',
          sector: 'Banks',
          website: 'www.riyadbank.com'
      },
      {
          symbol: '1020:TADAWUL',
          tickerSymbol: '1020',
          name: 'BJAZ',
          name_ar: 'بنك الجزيرة',
          sector: 'Banks',
          website: 'www.bjaz.com.sa'
      },
      {
          symbol: '1030:TADAWUL',
          tickerSymbol: '1030',
          name: 'SAIB',
          name_ar: 'البنك السعودي للاستثمار',
          sector: 'Banks',
          website: 'www.saib.com.sa'
      },
      {
          symbol: '1050:TADAWUL',
          tickerSymbol: '1050',
          name: 'BSF',
          name_ar: 'البنك السعودي الفرنسي',
          sector: 'Banks',
          website: 'www.bsf.com.sa'
      },
      {
          symbol: '1060:TADAWUL',
          tickerSymbol: '1060',
          name: 'SAB',
          name_ar: 'البنك السعودي البريطاني',
          sector: 'Banks',
          website: 'www.sabb.com'
      },
      {
          symbol: '1080:TADAWUL',
          tickerSymbol: '1080',
          name: 'ANB',
          name_ar: 'البنك العربي الوطني',
          sector: 'Banks',
          website: 'www.anb.com.sa'
      },
      {
          symbol: '1120:TADAWUL',
          tickerSymbol: '1120',
          name: 'Alrajhi',
          name_ar: 'مصرف الراجحي',
          sector: 'Banks',
          website: 'www.alrajhibank.com.sa'
      },
      {
          symbol: '1140:TADAWUL',
          tickerSymbol: '1140',
          name: 'Albilad',
          name_ar: 'بنك البلاد',
          sector: 'Banks',
          website: 'www.bankalbilad.com'
      },
      {
          symbol: '1150:TADAWUL',
          tickerSymbol: '1150',
          name: 'Alinma',
          name_ar: 'بنك الإنماء',
          sector: 'Banks',
          website: 'www.alinma.com'
      },
      {
          symbol: '1180:TADAWUL',
          tickerSymbol: '1180',
          name: 'SNB',
          name_ar: 'البنك الأهلي السعودي',
          sector: 'Banks',
          website: 'www.alahli.com'
      },
      {
          symbol: '1183:TADAWUL',
          tickerSymbol: '1183',
          name: 'SHL',
          name_ar: 'شله',
          sector: 'Financial Services',
          website: 'www.shl.com.sa'
      },
      {
          symbol: '1182:TADAWUL',
          tickerSymbol: '1182',
          name: 'Amlak',
          name_ar: 'أملاك',
          sector: 'Financial Services',
          website: 'www.amlak.com.sa'
      },
      {
          symbol: '4081:TADAWUL',
          tickerSymbol: '4081',
          name: 'Nayifat',
          name_ar: 'نايفات',
          sector: 'Financial Services',
          website: 'www.nayifat.com.sa'
      },
      {
          symbol: '1111:TADAWUL',
          tickerSymbol: '1111',
          name: 'Tadawul Group',
          name_ar: 'مجموعة تداول',
          sector: 'Financial Services',
          website: 'www.tadawul.com.sa'
      },
      {
          symbol: '4082:TADAWUL',
          tickerSymbol: '4082',
          name: 'MRNA',
          name_ar: 'مرنة',
          sector: 'Financial Services',
          website: 'www.mrna.com.sa'
      },
      {
          symbol: '4130:TADAWUL',
          tickerSymbol: '4130',
          name: 'Albaha',
          name_ar: 'الباحة',
          sector: 'Financial Services',
          website: 'www.albaha.com.sa'
      },
      {
          symbol: '2120:TADAWUL',
          tickerSymbol: '2120',
          name: 'SAIC',
          name_ar: 'سيسكو',
          sector: 'Financial Services',
          website: 'www.saic.com.sa'
      },
      {
          symbol: '4280:TADAWUL',
          tickerSymbol: '4280',
          name: 'Kingdom',
          name_ar: 'المملكة',
          sector: 'Financial Services',
          website: 'www.kingdom.com.sa'
      },
      {
          symbol: '8313:TADAWUL',
          tickerSymbol: '8313',
          name: 'Rasan',
          name_ar: 'رسان',
          sector: 'Insurance',
          website: 'www.rasan.com.sa'
      },
      {
          symbol: '8010:TADAWUL',
          tickerSymbol: '8010',
          name: 'Tawuniya',
          name_ar: 'التعاونية',
          sector: 'Insurance',
          website: 'www.tawuniya.com.sa'
      },
      {
          symbol: '8020:TADAWUL',
          tickerSymbol: '8020',
          name: 'Malath Insurance',
          name_ar: 'ملاذ للتأمين',
          sector: 'Insurance',
          website: 'www.malath.com.sa'
      },
      {
          symbol: '8030:TADAWUL',
          tickerSymbol: '8030',
          name: 'Medgulf',
          name_ar: 'ميدغلف',
          sector: 'Insurance',
          website: 'www.medgulf.com.sa'
      },
      {
          symbol: '8060:TADAWUL',
          tickerSymbol: '8060',
          name: 'Walaa',
          name_ar: 'ولاء',
          sector: 'Insurance',
          website: 'www.walaa.com.sa'
      },
      {
          symbol: '8040:TADAWUL',
          tickerSymbol: '8040',
          name: 'Allianz SF',
          name_ar: 'أليانز إس إف',
          sector: 'Insurance',
          website: 'www.allianz.com.sa'
      },
      {
          symbol: '8070:TADAWUL',
          tickerSymbol: '8070',
          name: 'Arabian Shield',
          name_ar: 'الدرع العربي',
          sector: 'Insurance',
          website: 'www.arabianshield.com.sa'
      },
      {
          symbol: '8050:TADAWUL',
          tickerSymbol: '8050',
          name: 'Salama',
          name_ar: 'سلامة',
          sector: 'Insurance',
          website: 'www.salama.com.sa'
      },
      {
          symbol: '8100:TADAWUL',
          tickerSymbol: '8100',
          name: 'SAICO',
          name_ar: 'سايكو',
          sector: 'Insurance',
          website: 'www.saico.com.sa'
      },
      {
          symbol: '8012:TADAWUL',
          tickerSymbol: '8012',
          name: 'Jazira Takaful',
          name_ar: 'الجزيرة تكافل',
          sector: 'Insurance',
          website: 'www.jaziratakaful.com.sa'
      },
      {
          symbol: '8120:TADAWUL',
          tickerSymbol: '8120',
          name: 'Gulf Union Alahlia',
          name_ar: 'الخليج الأهلية',
          sector: 'Insurance',
          website: 'www.gulfunion.com.sa'
      },
      {
          symbol: '8150:TADAWUL',
          tickerSymbol: '8150',
          name: 'ACIG',
          name_ar: 'المجموعة المتحدة',
          sector: 'Insurance',
          website: 'www.acig.com.sa'
      },
      {
          symbol: '8160:TADAWUL',
          tickerSymbol: '8160',
          name: 'AICC',
          name_ar: 'أكسا',
          sector: 'Insurance',
          website: 'www.aicc.com.sa'
      },
      {
          symbol: '8170:TADAWUL',
          tickerSymbol: '8170',
          name: 'Aletihad',
          name_ar: 'الاتحاد',
          sector: 'Insurance',
          website: 'www.aletihad.com.sa'
      },
      {
          symbol: '8180:TADAWUL',
          tickerSymbol: '8180',
          name: 'Alsagr Insurance',
          name_ar: 'الصقر للتأمين',
          sector: 'Insurance',
          website: 'www.alsagr.com.sa'
      },
      {
          symbol: '8190:TADAWUL',
          tickerSymbol: '8190',
          name: 'UCA',
          name_ar: 'المتحدة للتأمين',
          sector: 'Insurance',
          website: 'www.uca.com.sa'
      },
      {
          symbol: '8200:TADAWUL',
          tickerSymbol: '8200',
          name: 'Saudi Re',
          name_ar: 'إعادة السعودية',
          sector: 'Insurance',
          website: 'www.saudire.com'
      },
      {
          symbol: '8210:TADAWUL',
          tickerSymbol: '8210',
          name: 'Bupa Arabia',
          name_ar: 'بوبا العربية',
          sector: 'Insurance',
          website: 'www.bupa.com.sa'
      },
      {
          symbol: '8230:TADAWUL',
          tickerSymbol: '8230',
          name: 'Alrajhi Takaful',
          name_ar: 'تكافل الراجحي',
          sector: 'Insurance',
          website: 'www.alrajhitakaful.com'
      },
      {
          symbol: '8240:TADAWUL',
          tickerSymbol: '8240',
          name: 'Chubb',
          name_ar: 'تشب',
          sector: 'Insurance',
          website: 'www.chubb.com.sa'
      },
      {
          symbol: '8250:TADAWUL',
          tickerSymbol: '8250',
          name: 'GIG',
          name_ar: 'جي آي جي',
          sector: 'Insurance',
          website: 'www.gig.com.sa'
      },
      {
          symbol: '8260:TADAWUL',
          tickerSymbol: '8260',
          name: 'Gulf General',
          name_ar: 'الخليجية العامة',
          sector: 'Insurance',
          website: 'www.gulfgeneral.com.sa'
      },
      {
          symbol: '8270:TADAWUL',
          tickerSymbol: '8270',
          name: 'Buruj',
          name_ar: 'بروج',
          sector: 'Insurance',
          website: 'www.buruj.com.sa'
      },
      {
          symbol: '8280:TADAWUL',
          tickerSymbol: '8280',
          name: 'Liva',
          name_ar: 'ليفا',
          sector: 'Insurance',
          website: 'www.liva.com.sa'
      },
      {
          symbol: '8300:TADAWUL',
          tickerSymbol: '8300',
          name: 'Wataniya',
          name_ar: 'الوطنية',
          sector: 'Insurance',
          website: 'www.wataniya.com.sa'
      },
      {
          symbol: '8310:TADAWUL',
          tickerSymbol: '8310',
          name: 'Amana Insurance',
          name_ar: 'أمانة للتأمين',
          sector: 'Insurance',
          website: 'www.amana.com.sa'
      },
      {
          symbol: '8311:TADAWUL',
          tickerSymbol: '8311',
          name: 'Enaya',
          name_ar: 'عناية',
          sector: 'Insurance',
          website: 'www.enaya.com.sa'
      },
      {
          symbol: '7010:TADAWUL',
          tickerSymbol: '7010',
          name: 'STC',
          name_ar: 'إس تي سي',
          sector: 'Telecommunication Services',
          website: 'www.stc.com.sa'
      },
      {
          symbol: '7020:TADAWUL',
          tickerSymbol: '7020',
          name: 'Etihad Etisalat',
          name_ar: 'اتحاد اتصالات',
          sector: 'Telecommunication Services',
          website: 'www.mobily.com.sa'
      },
      {
          symbol: '7030:TADAWUL',
          tickerSymbol: '7030',
          name: 'Zain KSA',
          name_ar: 'زين السعودية',
          sector: 'Telecommunication Services',
          website: 'www.sa.zain.com'
      },
      {
          symbol: '7040:TADAWUL',
          tickerSymbol: '7040',
          name: 'Atheeb Telecom',
          name_ar: 'اتصالات عذيب',
          sector: 'Telecommunication Services',
          website: 'www.atheeb.com.sa'
      },
      {
          symbol: '2080:TADAWUL',
          tickerSymbol: '2080',
          name: 'GASCO',
          name_ar: 'غازكو',
          sector: 'Utilities',
          website: 'www.gasco.com.sa'
      },
      {
          symbol: '5110:TADAWUL',
          tickerSymbol: '5110',
          name: 'Saudi Electricity',
          name_ar: 'السعودية للكهرباء',
          sector: 'Utilities',
          website: 'www.se.com.sa'
      },
      {
          symbol: '2084:TADAWUL',
          tickerSymbol: '2084',
          name: 'Miahona',
          name_ar: 'مياهنا',
          sector: 'Utilities',
          website: 'www.miahona.com.sa'
      },
      {
          symbol: '2081:TADAWUL',
          tickerSymbol: '2081',
          name: 'AWPT',
          name_ar: 'أي دبليو بي تي',
          sector: 'Utilities',
          website: 'www.awpt.com.sa'
      },
      {
          symbol: '2082:TADAWUL',
          tickerSymbol: '2082',
          name: 'ACWA Power',
          name_ar: 'أكوا باور',
          sector: 'Utilities',
          website: 'www.acwapower.com'
      },
      {
          symbol: '2083:TADAWUL',
          tickerSymbol: '2083',
          name: 'Marafiq',
          name_ar: 'مرافق',
          sector: 'Utilities',
          website: 'www.marafiq.com.sa'
      },
      {
          symbol: '4330:TADAWUL',
          tickerSymbol: '4330',
          name: 'Riyad REIT',
          name_ar: 'الرياض ريت',
          sector: 'REITs',
          website: 'www.riyadreit.com'
      },
      {
          symbol: '4331:TADAWUL',
          tickerSymbol: '4331',
          name: 'Aljazira REIT',
          name_ar: 'الجزيرة ريت',
          sector: 'REITs',
          website: 'www.aljazirareit.com'
      },
      {
          symbol: '4332:TADAWUL',
          tickerSymbol: '4332',
          name: 'Jadwa REIT Alharamain',
          name_ar: 'جدوى ريت الحرمين',
          sector: 'REITs',
          website: 'www.jadwareit.com'
      },
      {
          symbol: '4333:TADAWUL',
          tickerSymbol: '4333',
          name: 'Taleem REIT',
          name_ar: 'تعليم ريت',
          sector: 'REITs',
          website: 'www.taleemreit.com'
      },
      {
          symbol: '4334:TADAWUL',
          tickerSymbol: '4334',
          name: 'Al Maather REIT',
          name_ar: 'المعذر ريت',
          sector: 'REITs',
          website: 'www.almaatherreit.com'
      },
      {
          symbol: '4335:TADAWUL',
          tickerSymbol: '4335',
          name: 'Musharaka REIT',
          name_ar: 'مشاركة ريت',
          sector: 'REITs',
          website: 'www.musharakareit.com'
      },
      {
          symbol: '4336:TADAWUL',
          tickerSymbol: '4336',
          name: 'Mulkia REIT',
          name_ar: 'ملكية ريت',
          sector: 'REITs',
          website: 'www.mulkiareit.com'
      },
      {
          symbol: '4337:TADAWUL',
          tickerSymbol: '4337',
          name: 'SICO Saudi REIT',
          name_ar: 'سيكو السعودية ريت',
          sector: 'REITs',
          website: 'www.sicoreit.com'
      },
      {
          symbol: '4338:TADAWUL',
          tickerSymbol: '4338',
          name: 'Alahli REIT 1',
          name_ar: 'الأهلي ريت 1',
          sector: 'REITs',
          website: 'www.alahlireit.com'
      },
      {
          symbol: '4344:TADAWUL',
          tickerSymbol: '4344',
          name: 'Sedco Capital REIT',
          name_ar: 'سدكو كابيتال ريت',
          sector: 'REITs',
          website: 'www.sedcoreit.com'
      },
      {
          symbol: '4339:TADAWUL',
          tickerSymbol: '4339',
          name: 'Derayah REIT',
          name_ar: 'دراية ريت',
          sector: 'REITs',
          website: 'www.derayahreit.com'
      },
      {
          symbol: '4340:TADAWUL',
          tickerSymbol: '4340',
          name: 'Al Rajhi REIT',
          name_ar: 'الراجحي ريت',
          sector: 'REITs',
          website: 'www.alrajhireit.com'
      },
      {
          symbol: '4345:TADAWUL',
          tickerSymbol: '4345',
          name: 'Alinma Retail REIT',
          name_ar: 'الإنماء ريت للتجزئة',
          sector: 'REITs',
          website: 'www.alinmareit.com'
      },
      {
          symbol: '4342:TADAWUL',
          tickerSymbol: '4342',
          name: 'Jadwa REIT Saudi',
          name_ar: 'جدوى ريت السعودية',
          sector: 'REITs',
          website: 'www.jadwareit.com'
      },
      {
          symbol: '4346:TADAWUL',
          tickerSymbol: '4346',
          name: 'MEFIC REIT',
          name_ar: 'ميفك ريت',
          sector: 'REITs',
          website: 'www.meficreit.com'
      },
      {
          symbol: '4347:TADAWUL',
          tickerSymbol: '4347',
          name: 'Bonyan REIT',
          name_ar: 'بنيان ريت',
          sector: 'REITs',
          website: 'www.bonyanreit.com'
      },
      {
          symbol: '4348:TADAWUL',
          tickerSymbol: '4348',
          name: 'Alkhabeer REIT',
          name_ar: 'الخبير ريت',
          sector: 'REITs',
          website: 'www.alkhabeerreit.com'
      },
      {
          symbol: '4349:TADAWUL',
          tickerSymbol: '4349',
          name: 'Alinma Hospitality REIT',
          name_ar: 'الإنماء ريت للضيافة',
          sector: 'REITs',
          website: 'www.alinmareit.com'
      },
      {
          symbol: '4350:TADAWUL',
          tickerSymbol: '4350',
          name: 'Alistithmar REIT',
          name_ar: 'الاستثمار ريت',
          sector: 'REITs',
          website: 'www.alistithmarreit.com'
      },
      {
          symbol: '4020:TADAWUL',
          tickerSymbol: '4020',
          name: 'Alakaria',
          name_ar: 'العقارية',
          sector: 'Real Estate Mgmt & Dev\'t',
          website: 'www.alakaria.com.sa'
      },
      {
          symbol: '4090:TADAWUL',
          tickerSymbol: '4090',
          name: 'Taiba',
          name_ar: 'طيبة',
          sector: 'Real Estate Mgmt & Dev\'t',
          website: 'www.taiba.com.sa'
      },
      {
          symbol: '4100:TADAWUL',
          tickerSymbol: '4100',
          name: 'MCDC',
          name_ar: 'مكة',
          sector: 'Real Estate Mgmt & Dev\'t',
          website: 'www.mcdc.com.sa'
      },
      {
          symbol: '4150:TADAWUL',
          tickerSymbol: '4150',
          name: 'ARDCO',
          name_ar: 'الأرض',
          sector: 'Real Estate Mgmt & Dev\'t',
          website: 'www.ardco.com.sa'
      },
      {
          symbol: '4220:TADAWUL',
          tickerSymbol: '4220',
          name: 'Emaar EC',
          name_ar: 'إعمار المدينة الاقتصادية',
          sector: 'Real Estate Mgmt & Dev\'t',
          website: 'www.emaar.com.sa'
      },
      {
          symbol: '4250:TADAWUL',
          tickerSymbol: '4250',
          name: 'Jabal Omar',
          name_ar: 'جبل عمر',
          sector: 'Real Estate Mgmt & Dev\'t',
          website: 'www.jabalomar.com.sa'
      },
      {
          symbol: '4300:TADAWUL',
          tickerSymbol: '4300',
          name: 'Dar Alarkan',
          name_ar: 'دار الأركان',
          sector: 'Real Estate Mgmt & Dev\'t',
          website: 'www.daralarkan.com'
      },
      {
          symbol: '4310:TADAWUL',
          tickerSymbol: '4310',
          name: 'KEC',
          name_ar: 'كيك',
          sector: 'Real Estate Mgmt & Dev\'t',
          website: 'www.kec.com.sa'
      },
      {
          symbol: '4320:TADAWUL',
          tickerSymbol: '4320',
          name: 'Alandalus',
          name_ar: 'الأندلس',
          sector: 'Real Estate Mgmt & Dev\'t',
          website: 'www.alandalus.com.sa'
      },
      {
          symbol: '4321:TADAWUL',
          tickerSymbol: '4321',
          name: 'Cenomi Centers',
          name_ar: 'سينومي سنترز',
          sector: 'Real Estate Mgmt & Dev\'t',
          website: 'www.cenomicenters.com'
      },
      {
          symbol: '4322:TADAWUL',
          tickerSymbol: '4322',
          name: 'Retal',
          name_ar: 'رتال',
          sector: 'Real Estate Mgmt & Dev\'t',
          website: 'www.retal.com.sa'
      },
      {
          symbol: '4323:TADAWUL',
          tickerSymbol: '4323',
          name: 'Sumou',
          name_ar: 'سمو',
          sector: 'Real Estate Mgmt & Dev\'t',
          website: 'www.sumou.com.sa'
      },
      {
          symbol: '4230:TADAWUL',
          tickerSymbol: '4230',
          name: 'Red Sea',
          name_ar: 'البحر الأحمر',
          sector: 'Real Estate Mgmt & Dev\'t',
          website: 'www.redsea.com.sa'
      },
      {
          symbol: '7200:TADAWUL',
          tickerSymbol: '7200',
          name: 'MIS',
          name_ar: 'إم آي إس',
          sector: 'Software & Services',
          website: 'www.mis.com.sa'
      },
      {
          symbol: '7201:TADAWUL',
          tickerSymbol: '7201',
          name: 'Arab Sea',
          name_ar: 'البحر العربي',
          sector: 'Software & Services',
          website: 'www.arabsea.com.sa'
      },
      {
          symbol: '7202:TADAWUL',
          tickerSymbol: '7202',
          name: 'Solutions',
          name_ar: 'حلول',
          sector: 'Software & Services',
          website: 'www.solutions.com.sa'
      },
      {
          symbol: '7203:TADAWUL',
          tickerSymbol: '7203',
          name: 'ELM',
          name_ar: 'علم',
          sector: 'Software & Services',
          website: 'www.elm.com.sa'
      },
      {
          symbol: '7204:TADAWUL',
          tickerSymbol: '7204',
          name: '2P',
          name_ar: 'تو بي',
          sector: 'Software & Services',
          website: 'www.2p.com.sa'
      },
      {
          symbol: '4165:TADAWUL',
          tickerSymbol: '4165',
          name: 'Almajed Oud',
          name_ar: 'المجد للعود',
          sector: 'Household & Personal Products',
          website: 'www.almajedoud.com.sa'
      },
      {
          symbol: '9406:TADAWUL',
          tickerSymbol: '9406',
          name: 'Albilad MSCI',
          name_ar: 'البلاد إم إس سي آي',
          sector: 'Index Funds',
          website: 'www.albiladmsci.com'
      },
      {
          symbol: '9402:TADAWUL',
          tickerSymbol: '9402',
          name: 'Alawwal MT30',
          name_ar: 'الأول إم تي 30',
          sector: 'Index Funds',
          website: 'www.alawwalmt30.com'
      },
      {
          symbol: '9403:TADAWUL',
          tickerSymbol: '9403',
          name: 'Albilad Sukuk',
          name_ar: 'البلاد صكوك',
          sector: 'Index Funds',
          website: 'www.albiladsukuk.com'
      },
      {
          symbol: '4701:TADAWUL',
          tickerSymbol: '4701',
          name: 'ADITF',
          name_ar: 'أديتف',
          sector: 'Index Funds',
          website: 'www.aditf.com.sa'
      },
      {
          symbol: '9400:TADAWUL',
          tickerSymbol: '9400',
          name: 'Yaqeen 30',
          name_ar: 'يقين 30',
          sector: 'Index Funds',
          website: 'www.yaqeen30.com'
      },
      {
          symbol: '9401:TADAWUL',
          tickerSymbol: '9401',
          name: 'Yaqeen Petrochemical',
          name_ar: 'يقين للبتروكيماويات',
          sector: 'Index Funds',
          website: 'www.yaqeenpetrochemical.com'
      },
      {
          symbol: '9404:TADAWUL',
          tickerSymbol: '9404',
          name: 'Alinma Sukuk',
          name_ar: 'الإنماء صكوك',
          sector: 'Index Funds',
          website: 'www.alinmasukuk.com'
      },
      {
          symbol: '9405:TADAWUL',
          tickerSymbol: '9405',
          name: 'Albilad Gold',
          name_ar: 'البلاد ذهب',
          sector: 'Index Funds',
          website: 'www.albiladgold.com'
      },
      {
          symbol: '4700:TADAWUL',
          tickerSymbol: '4700',
          name: 'Alkhabeer Income',
          name_ar: 'الخبير دخل',
          sector: 'Index Funds',
          website: 'www.alkhabeerincome.com'
      },
      {
          symbol: '9407:TADAWUL',
          tickerSymbol: '9407',
          name: 'Albilad US Tech',
          name_ar: 'البلاد التكنولوجيا الأمريكية',
          sector: 'Index Funds',
          website: 'www.albiladustech.com'
      },
      {
          symbol: '9408:TADAWUL',
          tickerSymbol: '9408',
          name: 'Albilad Saudi Growth',
          name_ar: 'البلاد النمو السعودي',
          sector: 'Index Funds',
          website: 'www.albiladsaudigrowth.com'
      },
      {
          symbol: '4702:TADAWUL',
          tickerSymbol: '4702',
          name: 'Alkhabeer Income 2030',
          name_ar: 'الخبير دخل 2030',
          sector: 'Index Funds',
          website: 'www.alkhabeerincome2030.com'
      },
      {
          symbol: '4703:TADAWUL',
          tickerSymbol: '4703',
          name: 'Sedco Multi Asset',
          name_ar: 'سدكو متعدد الأصول',
          sector: 'Index Funds',
          website: 'www.sedcomultiasset.com'
      },
      {
          symbol: '9410:TADAWUL',
          tickerSymbol: '9410',
          name: 'Albilad Hong Kong China',
          name_ar: 'البلاد هونغ كونغ الصين',
          sector: 'Index Funds',
          website: 'www.albiladhongkongchina.com'
      },
      {
          symbol: '9411:TADAWUL',
          tickerSymbol: '9411',
          name: 'SAB HK',
          name_ar: 'ساب هونغ كونغ',
          sector: 'Index Funds',
          website: 'www.sabhk.com'
      }
  ]
  // Helper functions
export function findSaudiSymbol(query: string) {
  const normalizedQuery = query.toLowerCase();
  
  return SAUDI_SYMBOLS.find(stock => 
    stock.symbol.toLowerCase().includes(normalizedQuery) ||
    stock.tickerSymbol.toLowerCase().includes(normalizedQuery) ||
    stock.name.toLowerCase().includes(normalizedQuery) ||
    stock.name_ar.includes(query)
  );
}

export function getSectorCompanies(sector: string) {
  return SAUDI_SYMBOLS.filter(stock => 
    stock.sector.toLowerCase() === sector.toLowerCase()
  );
}

export function formatSaudiSymbol(symbol: string | number) {
  const stock = SAUDI_SYMBOLS.find(s => 
    s.tickerSymbol === symbol.toString() || 
    s.symbol === symbol.toString()
  );
  
  if (!stock) return `${symbol}:TADAWUL`;
  return stock.symbol;
}

export function searchStocks(query: string) {
  const normalizedQuery = query.toLowerCase();
  return SAUDI_SYMBOLS.filter(stock => 
    stock.symbol.toLowerCase().includes(normalizedQuery) ||
    stock.tickerSymbol.toLowerCase().includes(normalizedQuery) ||
    stock.name.toLowerCase().includes(normalizedQuery) ||
    stock.name_ar.includes(query) ||
    stock.sector.toLowerCase().includes(normalizedQuery) ||
    stock.website.toLowerCase().includes(normalizedQuery)
  );
}


export function getAllSymbols() {
  return SAUDI_SYMBOLS.map(stock => stock.symbol);
}