export interface LanguageConfig {
  code: string;
  shortCode: string;
  nativeName: string;
  englishName: string;
  description: string;
  direction: 'ltr' | 'rtl';
  isIndian: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// INDIAN LANGUAGES (23 – All official 8th Schedule + Major regional languages)
// ─────────────────────────────────────────────────────────────────────────────
export const INDIAN_LANGUAGES: LanguageConfig[] = [
  { code: 'hi',  shortCode: 'HI',  nativeName: 'हिन्दी',        englishName: 'Hindi',      description: 'North & Central India • Devanagari',          direction: 'ltr', isIndian: true },
  { code: 'bn',  shortCode: 'BN',  nativeName: 'বাংলা',          englishName: 'Bengali',    description: 'West Bengal, Tripura • Bengali',               direction: 'ltr', isIndian: true },
  { code: 'te',  shortCode: 'TE',  nativeName: 'తెలుగు',         englishName: 'Telugu',     description: 'Andhra Pradesh, Telangana • Telugu',           direction: 'ltr', isIndian: true },
  { code: 'mr',  shortCode: 'MR',  nativeName: 'मराठी',          englishName: 'Marathi',    description: 'Maharashtra • Devanagari',                     direction: 'ltr', isIndian: true },
  { code: 'ta',  shortCode: 'TA',  nativeName: 'தமிழ்',          englishName: 'Tamil',      description: 'Tamil Nadu, Puducherry • Tamil',               direction: 'ltr', isIndian: true },
  { code: 'ur',  shortCode: 'UR',  nativeName: 'اردو',            englishName: 'Urdu',       description: 'Jammu & Kashmir, Telangana • Nastaliq',        direction: 'rtl', isIndian: true },
  { code: 'gu',  shortCode: 'GU',  nativeName: 'ગુજરાતી',        englishName: 'Gujarati',   description: 'Gujarat • Gujarati',                           direction: 'ltr', isIndian: true },
  { code: 'kn',  shortCode: 'KN',  nativeName: 'ಕನ್ನಡ',          englishName: 'Kannada',    description: 'Karnataka • Kannada',                          direction: 'ltr', isIndian: true },
  { code: 'or',  shortCode: 'OR',  nativeName: 'ଓଡ଼ିଆ',          englishName: 'Odia',       description: 'Odisha • Odia',                                direction: 'ltr', isIndian: true },
  { code: 'ml',  shortCode: 'ML',  nativeName: 'മലയാളം',         englishName: 'Malayalam',  description: 'Kerala, Lakshadweep • Malayalam',              direction: 'ltr', isIndian: true },
  { code: 'pa',  shortCode: 'PA',  nativeName: 'ਪੰਜਾਬੀ',         englishName: 'Punjabi',    description: 'Punjab • Gurmukhi',                            direction: 'ltr', isIndian: true },
  { code: 'as',  shortCode: 'AS',  nativeName: 'অসমীয়া',         englishName: 'Assamese',   description: 'Assam • Assamese',                             direction: 'ltr', isIndian: true },
  { code: 'mai', shortCode: 'MAI', nativeName: 'मैथिली',          englishName: 'Maithili',   description: 'Bihar, Jharkhand • Devanagari',                direction: 'ltr', isIndian: true },
  { code: 'sa',  shortCode: 'SA',  nativeName: 'संस्कृतम्',       englishName: 'Sanskrit',   description: 'Classical / Pan-India • Devanagari',           direction: 'ltr', isIndian: true },
  { code: 'ne',  shortCode: 'NE',  nativeName: 'नेपाली',          englishName: 'Nepali',     description: 'Sikkim, West Bengal • Devanagari',             direction: 'ltr', isIndian: true },
  { code: 'kok', shortCode: 'KOK', nativeName: 'कोंकणी',          englishName: 'Konkani',    description: 'Goa, Coastal Karnataka • Devanagari',          direction: 'ltr', isIndian: true },
  { code: 'sd',  shortCode: 'SD',  nativeName: 'سنڌي',            englishName: 'Sindhi',     description: 'Sindh Communities • Arabic',                   direction: 'rtl', isIndian: true },
  { code: 'ks',  shortCode: 'KS',  nativeName: 'کٲشُر',           englishName: 'Kashmiri',   description: 'Jammu & Kashmir • Nastaliq',                   direction: 'rtl', isIndian: true },
  { code: 'doi', shortCode: 'DOI', nativeName: 'डोगरी',           englishName: 'Dogri',      description: 'Jammu • Devanagari',                           direction: 'ltr', isIndian: true },
  { code: 'bho', shortCode: 'BHO', nativeName: 'भोजपुरी',         englishName: 'Bhojpuri',   description: 'Bihar, Eastern UP • Devanagari',               direction: 'ltr', isIndian: true },
  { code: 'mni', shortCode: 'MNI', nativeName: 'মৈতৈলোন্',        englishName: 'Manipuri',   description: 'Manipur • Meitei',                             direction: 'ltr', isIndian: true },
  { code: 'sat', shortCode: 'SAT', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ',        englishName: 'Santali',    description: 'Jharkhand, West Bengal, Odisha • Ol Chiki',    direction: 'ltr', isIndian: true },
  { code: 'brx', shortCode: 'BRX', nativeName: "बर'",              englishName: 'Bodo',       description: 'Assam • Devanagari',                           direction: 'ltr', isIndian: true },
];

// ─────────────────────────────────────────────────────────────────────────────
// INTERNATIONAL & WORLD LANGUAGES (All Google Translate Supported Languages)
// ─────────────────────────────────────────────────────────────────────────────
export const INTERNATIONAL_LANGUAGES: LanguageConfig[] = [
  // ── English (Primary Default) ─────────────────────────────────────────────
  { code: 'en',    shortCode: 'EN',  nativeName: 'English',              englishName: 'English',              description: 'International / Global • Latin',    direction: 'ltr', isIndian: false },

  // ── A ─────────────────────────────────────────────────────────────────────
  { code: 'af',    shortCode: 'AF',  nativeName: 'Afrikaans',            englishName: 'Afrikaans',            description: 'South Africa, Namibia • Latin',     direction: 'ltr', isIndian: false },
  { code: 'ak',    shortCode: 'AK',  nativeName: 'Akan / Twi',           englishName: 'Akan (Twi)',           description: 'Ghana • Latin',                     direction: 'ltr', isIndian: false },
  { code: 'sq',    shortCode: 'SQ',  nativeName: 'Shqip',                englishName: 'Albanian',             description: 'Albania, Kosovo • Latin',           direction: 'ltr', isIndian: false },
  { code: 'am',    shortCode: 'AM',  nativeName: 'አማርኛ',                 englishName: 'Amharic',              description: 'Ethiopia • Geʽez',                  direction: 'ltr', isIndian: false },
  { code: 'ar',    shortCode: 'AR',  nativeName: 'العربية',              englishName: 'Arabic',               description: 'Middle East & North Africa • Arabic', direction: 'rtl', isIndian: false },
  { code: 'hy',    shortCode: 'HY',  nativeName: 'Հայերեն',              englishName: 'Armenian',             description: 'Armenia • Armenian',                direction: 'ltr', isIndian: false },
  { code: 'ay',    shortCode: 'AY',  nativeName: 'Aymar aru',            englishName: 'Aymara',               description: 'Bolivia, Peru • Latin',             direction: 'ltr', isIndian: false },
  { code: 'az',    shortCode: 'AZ',  nativeName: 'Azərbaycanca',         englishName: 'Azerbaijani',          description: 'Azerbaijan • Latin',                direction: 'ltr', isIndian: false },

  // ── B ─────────────────────────────────────────────────────────────────────
  { code: 'bm',    shortCode: 'BM',  nativeName: 'Bamanankan',           englishName: 'Bambara',              description: 'Mali • Latin',                      direction: 'ltr', isIndian: false },
  { code: 'eu',    shortCode: 'EU',  nativeName: 'Euskara',              englishName: 'Basque',               description: 'Basque Country • Latin',            direction: 'ltr', isIndian: false },
  { code: 'be',    shortCode: 'BE',  nativeName: 'Беларуская',           englishName: 'Belarusian',           description: 'Belarus • Cyrillic',                direction: 'ltr', isIndian: false },
  { code: 'bs',    shortCode: 'BS',  nativeName: 'Bosanski',             englishName: 'Bosnian',              description: 'Bosnia & Herzegovina • Latin',      direction: 'ltr', isIndian: false },
  { code: 'bg',    shortCode: 'BG',  nativeName: 'Български',            englishName: 'Bulgarian',            description: 'Bulgaria • Cyrillic',               direction: 'ltr', isIndian: false },

  // ── C ─────────────────────────────────────────────────────────────────────
  { code: 'ca',    shortCode: 'CA',  nativeName: 'Català',               englishName: 'Catalan',              description: 'Catalonia, Andorra • Latin',        direction: 'ltr', isIndian: false },
  { code: 'ceb',   shortCode: 'CEB', nativeName: 'Cebuano',              englishName: 'Cebuano',              description: 'Philippines (Visayas) • Latin',     direction: 'ltr', isIndian: false },
  { code: 'ny',    shortCode: 'NY',  nativeName: 'ChiCheŵa',             englishName: 'Chichewa',             description: 'Malawi, Zambia • Latin',            direction: 'ltr', isIndian: false },
  { code: 'zh-CN', shortCode: 'ZHS', nativeName: '简体中文',               englishName: 'Chinese (Simplified)', description: 'Mainland China, Singapore • Han',   direction: 'ltr', isIndian: false },
  { code: 'zh-TW', shortCode: 'ZHT', nativeName: '繁體中文',               englishName: 'Chinese (Traditional)',description: 'Taiwan, Hong Kong • Han',           direction: 'ltr', isIndian: false },
  { code: 'co',    shortCode: 'CO',  nativeName: 'Corsu',                englishName: 'Corsican',             description: 'Corsica • Latin',                   direction: 'ltr', isIndian: false },
  { code: 'hr',    shortCode: 'HR',  nativeName: 'Hrvatski',             englishName: 'Croatian',             description: 'Croatia • Latin',                   direction: 'ltr', isIndian: false },
  { code: 'cs',    shortCode: 'CS',  nativeName: 'Čeština',              englishName: 'Czech',                description: 'Czech Republic • Latin',            direction: 'ltr', isIndian: false },

  // ── D ─────────────────────────────────────────────────────────────────────
  { code: 'da',    shortCode: 'DA',  nativeName: 'Dansk',                englishName: 'Danish',               description: 'Denmark • Latin',                   direction: 'ltr', isIndian: false },
  { code: 'dv',    shortCode: 'DV',  nativeName: 'ދިވެހި',                englishName: 'Dhivehi (Maldivian)',  description: 'Maldives • Thaana',                 direction: 'rtl', isIndian: false },
  { code: 'nl',    shortCode: 'NL',  nativeName: 'Nederlands',           englishName: 'Dutch',                description: 'Netherlands, Belgium • Latin',      direction: 'ltr', isIndian: false },
  { code: 'dz',    shortCode: 'DZ',  nativeName: 'རྫོང་ཁ',               englishName: 'Dzongkha',             description: 'Bhutan • Tibetan script',           direction: 'ltr', isIndian: false },

  // ── E ─────────────────────────────────────────────────────────────────────
  { code: 'eo',    shortCode: 'EO',  nativeName: 'Esperanto',            englishName: 'Esperanto',            description: 'International Auxiliary • Latin',   direction: 'ltr', isIndian: false },
  { code: 'et',    shortCode: 'ET',  nativeName: 'Eesti',                englishName: 'Estonian',             description: 'Estonia • Latin',                   direction: 'ltr', isIndian: false },
  { code: 'ee',    shortCode: 'EE',  nativeName: 'Eʋegbe',               englishName: 'Ewe',                  description: 'Ghana, Togo • Latin',               direction: 'ltr', isIndian: false },

  // ── F ─────────────────────────────────────────────────────────────────────
  { code: 'tl',    shortCode: 'FIL', nativeName: 'Filipino (Tagalog)',   englishName: 'Filipino',             description: 'Philippines • Latin',               direction: 'ltr', isIndian: false },
  { code: 'fi',    shortCode: 'FI',  nativeName: 'Suomi',                englishName: 'Finnish',              description: 'Finland • Latin',                   direction: 'ltr', isIndian: false },
  { code: 'fr',    shortCode: 'FR',  nativeName: 'Français',             englishName: 'French',               description: 'France, West Africa • Latin',       direction: 'ltr', isIndian: false },
  { code: 'fy',    shortCode: 'FY',  nativeName: 'Frysk',                englishName: 'Frisian',              description: 'Netherlands, Germany • Latin',      direction: 'ltr', isIndian: false },

  // ── G ─────────────────────────────────────────────────────────────────────
  { code: 'gl',    shortCode: 'GL',  nativeName: 'Galego',               englishName: 'Galician',             description: 'Galicia (Spain) • Latin',           direction: 'ltr', isIndian: false },
  { code: 'ka',    shortCode: 'KA',  nativeName: 'ქართული',              englishName: 'Georgian',             description: 'Georgia • Mkhedruli',               direction: 'ltr', isIndian: false },
  { code: 'de',    shortCode: 'DE',  nativeName: 'Deutsch',              englishName: 'German',               description: 'Germany, Austria, Swiss • Latin',   direction: 'ltr', isIndian: false },
  { code: 'el',    shortCode: 'EL',  nativeName: 'Ελληνικά',             englishName: 'Greek',                description: 'Greece, Cyprus • Greek',            direction: 'ltr', isIndian: false },
  { code: 'gn',    shortCode: 'GN',  nativeName: "Avañe'ẽ",              englishName: 'Guarani',              description: 'Paraguay, Bolivia • Latin',         direction: 'ltr', isIndian: false },

  // ── H ─────────────────────────────────────────────────────────────────────
  { code: 'ht',    shortCode: 'HT',  nativeName: 'Kreyòl ayisyen',       englishName: 'Haitian Creole',       description: 'Haiti, Caribbean • Latin',          direction: 'ltr', isIndian: false },
  { code: 'ha',    shortCode: 'HA',  nativeName: 'Hausa',                englishName: 'Hausa',                description: 'Nigeria, Niger • Latin',            direction: 'ltr', isIndian: false },
  { code: 'haw',   shortCode: 'HAW', nativeName: 'ʻŌlelo Hawaiʻi',       englishName: 'Hawaiian',             description: 'Hawaii, USA • Latin',               direction: 'ltr', isIndian: false },
  { code: 'iw',    shortCode: 'HE',  nativeName: 'עברית',                englishName: 'Hebrew',               description: 'Israel • Hebrew script',            direction: 'rtl', isIndian: false },
  { code: 'hmn',   shortCode: 'HMN', nativeName: 'Hmoob',                englishName: 'Hmong',                description: 'Laos, Vietnam, China • Latin',      direction: 'ltr', isIndian: false },
  { code: 'hu',    shortCode: 'HU',  nativeName: 'Magyar',               englishName: 'Hungarian',            description: 'Hungary • Latin',                   direction: 'ltr', isIndian: false },

  // ── I ─────────────────────────────────────────────────────────────────────
  { code: 'is',    shortCode: 'IS',  nativeName: 'Íslenska',             englishName: 'Icelandic',            description: 'Iceland • Latin',                   direction: 'ltr', isIndian: false },
  { code: 'ig',    shortCode: 'IG',  nativeName: 'Asụsụ Igbo',           englishName: 'Igbo',                 description: 'Nigeria • Latin',                   direction: 'ltr', isIndian: false },
  { code: 'ilo',   shortCode: 'ILO', nativeName: 'Ilokano',              englishName: 'Ilocano',              description: 'Northern Philippines • Latin',      direction: 'ltr', isIndian: false },
  { code: 'id',    shortCode: 'ID',  nativeName: 'Bahasa Indonesia',     englishName: 'Indonesian',           description: 'Indonesia • Latin',                 direction: 'ltr', isIndian: false },
  { code: 'ga',    shortCode: 'GA',  nativeName: 'Gaeilge',              englishName: 'Irish',                description: 'Ireland • Latin',                   direction: 'ltr', isIndian: false },
  { code: 'it',    shortCode: 'IT',  nativeName: 'Italiano',             englishName: 'Italian',              description: 'Italy, Switzerland • Latin',         direction: 'ltr', isIndian: false },

  // ── J ─────────────────────────────────────────────────────────────────────
  { code: 'ja',    shortCode: 'JA',  nativeName: '日本語',                englishName: 'Japanese',             description: 'Japan • Kanji / Kana',              direction: 'ltr', isIndian: false },
  { code: 'jw',    shortCode: 'JW',  nativeName: 'Basa Jawa',            englishName: 'Javanese',             description: 'Java, Indonesia • Latin',           direction: 'ltr', isIndian: false },

  // ── K ─────────────────────────────────────────────────────────────────────
  { code: 'kk',    shortCode: 'KK',  nativeName: 'Қазақша',              englishName: 'Kazakh',               description: 'Kazakhstan • Cyrillic',             direction: 'ltr', isIndian: false },
  { code: 'km',    shortCode: 'KM',  nativeName: 'ភាសាខ្មែរ',            englishName: 'Khmer',                description: 'Cambodia • Khmer script',           direction: 'ltr', isIndian: false },
  { code: 'rw',    shortCode: 'RW',  nativeName: 'Ikinyarwanda',         englishName: 'Kinyarwanda',          description: 'Rwanda, Burundi • Latin',           direction: 'ltr', isIndian: false },
  { code: 'ko',    shortCode: 'KO',  nativeName: '한국어',                 englishName: 'Korean',               description: 'South & North Korea • Hangul',      direction: 'ltr', isIndian: false },
  { code: 'kri',   shortCode: 'KRI', nativeName: 'Krio',                 englishName: 'Krio',                 description: 'Sierra Leone • Latin',              direction: 'ltr', isIndian: false },
  { code: 'ku',    shortCode: 'KU',  nativeName: 'Kurdî (Kurmancî)',      englishName: 'Kurdish (Kurmanji)',   description: 'Kurdistan, Turkey, Syria • Latin',  direction: 'ltr', isIndian: false },
  { code: 'ckb',   shortCode: 'CKB', nativeName: 'کوردی سۆرانی',         englishName: 'Kurdish (Sorani)',     description: 'Iraqi Kurdistan, Iran • Arabic',    direction: 'rtl', isIndian: false },
  { code: 'ky',    shortCode: 'KY',  nativeName: 'Кыргызча',             englishName: 'Kyrgyz',               description: 'Kyrgyzstan • Cyrillic',             direction: 'ltr', isIndian: false },

  // ── L ─────────────────────────────────────────────────────────────────────
  { code: 'lo',    shortCode: 'LO',  nativeName: 'ພາສາລາວ',              englishName: 'Lao',                  description: 'Laos • Lao script',                 direction: 'ltr', isIndian: false },
  { code: 'la',    shortCode: 'LA',  nativeName: 'Latina',               englishName: 'Latin',                description: 'Classical Vatican / Heritage • Latin', direction: 'ltr', isIndian: false },
  { code: 'lv',    shortCode: 'LV',  nativeName: 'Latviešu',             englishName: 'Latvian',              description: 'Latvia • Latin',                    direction: 'ltr', isIndian: false },
  { code: 'ln',    shortCode: 'LN',  nativeName: 'Lingála',              englishName: 'Lingala',              description: 'DR Congo, Congo • Latin',           direction: 'ltr', isIndian: false },
  { code: 'lt',    shortCode: 'LT',  nativeName: 'Lietuvių',             englishName: 'Lithuanian',           description: 'Lithuania • Latin',                 direction: 'ltr', isIndian: false },
  { code: 'lg',    shortCode: 'LG',  nativeName: 'Luganda',              englishName: 'Luganda',              description: 'Uganda • Latin',                    direction: 'ltr', isIndian: false },
  { code: 'lb',    shortCode: 'LB',  nativeName: 'Lëtzebuergesch',       englishName: 'Luxembourgish',        description: 'Luxembourg • Latin',                direction: 'ltr', isIndian: false },

  // ── M ─────────────────────────────────────────────────────────────────────
  { code: 'mk',    shortCode: 'MK',  nativeName: 'Македонски',           englishName: 'Macedonian',           description: 'North Macedonia • Cyrillic',        direction: 'ltr', isIndian: false },
  { code: 'mg',    shortCode: 'MG',  nativeName: 'Malagasy',             englishName: 'Malagasy',             description: 'Madagascar • Latin',                direction: 'ltr', isIndian: false },
  { code: 'ms',    shortCode: 'MS',  nativeName: 'Bahasa Melayu',        englishName: 'Malay',                description: 'Malaysia, Brunei, Singapore • Latin', direction: 'ltr', isIndian: false },
  { code: 'mt',    shortCode: 'MT',  nativeName: 'Malti',                englishName: 'Maltese',              description: 'Malta • Latin',                     direction: 'ltr', isIndian: false },
  { code: 'mi',    shortCode: 'MI',  nativeName: 'Te Reo Māori',         englishName: 'Maori',                description: 'New Zealand • Latin',               direction: 'ltr', isIndian: false },
  { code: 'lus',   shortCode: 'LUS', nativeName: 'Mizo ṭawng',           englishName: 'Mizo',                 description: 'Mizoram, Northeast India • Latin',  direction: 'ltr', isIndian: false },
  { code: 'mn',    shortCode: 'MN',  nativeName: 'Монгол хэл',           englishName: 'Mongolian',            description: 'Mongolia • Cyrillic',               direction: 'ltr', isIndian: false },
  { code: 'my',    shortCode: 'MY',  nativeName: 'မြန်မာစာ',              englishName: 'Myanmar (Burmese)',    description: 'Myanmar • Myanmar script',          direction: 'ltr', isIndian: false },

  // ── N ─────────────────────────────────────────────────────────────────────
  { code: 'no',    shortCode: 'NO',  nativeName: 'Norsk',                englishName: 'Norwegian',            description: 'Norway • Latin',                    direction: 'ltr', isIndian: false },
  { code: 'nso',   shortCode: 'NSO', nativeName: 'Sesotho sa Leboa',     englishName: 'Northern Sotho (Sepedi)', description: 'South Africa • Latin',          direction: 'ltr', isIndian: false },

  // ── O ─────────────────────────────────────────────────────────────────────
  { code: 'om',    shortCode: 'OM',  nativeName: 'Afaan Oromoo',         englishName: 'Oromo',                description: 'Ethiopia, Kenya • Latin',           direction: 'ltr', isIndian: false },

  // ── P ─────────────────────────────────────────────────────────────────────
  { code: 'ps',    shortCode: 'PS',  nativeName: 'پښتو',                 englishName: 'Pashto',               description: 'Afghanistan, Pakistan • Arabic',    direction: 'rtl', isIndian: false },
  { code: 'fa',    shortCode: 'FA',  nativeName: 'فارسی',                englishName: 'Persian (Farsi)',      description: 'Iran, Afghanistan, Tajikistan • Arabic', direction: 'rtl', isIndian: false },
  { code: 'pl',    shortCode: 'PL',  nativeName: 'Polski',               englishName: 'Polish',               description: 'Poland • Latin',                    direction: 'ltr', isIndian: false },
  { code: 'pt',    shortCode: 'PT',  nativeName: 'Português',            englishName: 'Portuguese',           description: 'Brazil, Portugal, Angola • Latin',  direction: 'ltr', isIndian: false },

  // ── Q ─────────────────────────────────────────────────────────────────────
  { code: 'qu',    shortCode: 'QU',  nativeName: 'Runa Simi',            englishName: 'Quechua',              description: 'Andean Region, Peru, Bolivia • Latin', direction: 'ltr', isIndian: false },

  // ── R ─────────────────────────────────────────────────────────────────────
  { code: 'ro',    shortCode: 'RO',  nativeName: 'Română',               englishName: 'Romanian',             description: 'Romania, Moldova • Latin',          direction: 'ltr', isIndian: false },
  { code: 'ru',    shortCode: 'RU',  nativeName: 'Русский',              englishName: 'Russian',              description: 'Eurasia & Eastern Europe • Cyrillic', direction: 'ltr', isIndian: false },

  // ── S ─────────────────────────────────────────────────────────────────────
  { code: 'sm',    shortCode: 'SM',  nativeName: "Gagana Sāmoa",         englishName: 'Samoan',               description: 'Samoa, American Samoa • Latin',     direction: 'ltr', isIndian: false },
  { code: 'gd',    shortCode: 'GD',  nativeName: 'Gàidhlig',             englishName: 'Scots Gaelic',         description: 'Scotland • Latin',                  direction: 'ltr', isIndian: false },
  { code: 'sr',    shortCode: 'SR',  nativeName: 'Српски',               englishName: 'Serbian',              description: 'Serbia, Balkans • Cyrillic',        direction: 'ltr', isIndian: false },
  { code: 'st',    shortCode: 'ST',  nativeName: 'Sesotho',              englishName: 'Sesotho',              description: 'Lesotho, South Africa • Latin',     direction: 'ltr', isIndian: false },
  { code: 'sn',    shortCode: 'SN',  nativeName: 'chiShona',             englishName: 'Shona',                description: 'Zimbabwe, Mozambique • Latin',      direction: 'ltr', isIndian: false },
  { code: 'si',    shortCode: 'SI',  nativeName: 'සිංහල',                englishName: 'Sinhala',              description: 'Sri Lanka • Sinhala script',        direction: 'ltr', isIndian: false },
  { code: 'sk',    shortCode: 'SK',  nativeName: 'Slovenčina',           englishName: 'Slovak',               description: 'Slovakia • Latin',                  direction: 'ltr', isIndian: false },
  { code: 'sl',    shortCode: 'SL',  nativeName: 'Slovenščina',          englishName: 'Slovenian',            description: 'Slovenia • Latin',                  direction: 'ltr', isIndian: false },
  { code: 'so',    shortCode: 'SO',  nativeName: 'Soomaaliga',           englishName: 'Somali',               description: 'Somalia, Horn of Africa • Latin',   direction: 'ltr', isIndian: false },
  { code: 'es',    shortCode: 'ES',  nativeName: 'Español',              englishName: 'Spanish',              description: 'Spain & Latin America • Latin',     direction: 'ltr', isIndian: false },
  { code: 'su',    shortCode: 'SU',  nativeName: 'Basa Sunda',           englishName: 'Sundanese',            description: 'Java, Indonesia • Latin',           direction: 'ltr', isIndian: false },
  { code: 'sw',    shortCode: 'SW',  nativeName: 'Kiswahili',            englishName: 'Swahili',              description: 'East Africa, AU official • Latin',   direction: 'ltr', isIndian: false },
  { code: 'sv',    shortCode: 'SV',  nativeName: 'Svenska',              englishName: 'Swedish',              description: 'Sweden, Finland • Latin',           direction: 'ltr', isIndian: false },

  // ── T ─────────────────────────────────────────────────────────────────────
  { code: 'tg',    shortCode: 'TG',  nativeName: 'Тоҷикӣ',               englishName: 'Tajik',                description: 'Tajikistan • Cyrillic',             direction: 'ltr', isIndian: false },
  { code: 'tt',    shortCode: 'TT',  nativeName: 'Татарча',              englishName: 'Tatar',                description: 'Tatarstan, Russia • Cyrillic',      direction: 'ltr', isIndian: false },
  { code: 'th',    shortCode: 'TH',  nativeName: 'ไทย',                  englishName: 'Thai',                 description: 'Thailand • Thai script',            direction: 'ltr', isIndian: false },
  { code: 'ti',    shortCode: 'TI',  nativeName: 'ትግርኛ',                 englishName: 'Tigrinya',             description: 'Eritrea, Ethiopia • Geʽez',         direction: 'ltr', isIndian: false },
  { code: 'ts',    shortCode: 'TS',  nativeName: 'Xitsonga',             englishName: 'Tsonga',               description: 'South Africa, Mozambique • Latin',  direction: 'ltr', isIndian: false },
  { code: 'tr',    shortCode: 'TR',  nativeName: 'Türkçe',               englishName: 'Turkish',              description: 'Turkey, Cyprus • Latin',            direction: 'ltr', isIndian: false },
  { code: 'tk',    shortCode: 'TK',  nativeName: 'Türkmençe',            englishName: 'Turkmen',              description: 'Turkmenistan • Latin',              direction: 'ltr', isIndian: false },

  // ── U ─────────────────────────────────────────────────────────────────────
  { code: 'uk',    shortCode: 'UK',  nativeName: 'Українська',           englishName: 'Ukrainian',            description: 'Ukraine • Cyrillic',                direction: 'ltr', isIndian: false },
  { code: 'ug',    shortCode: 'UG',  nativeName: 'ئۇيغۇرچە',             englishName: 'Uyghur',               description: 'Xinjiang • Arabic',                 direction: 'rtl', isIndian: false },
  { code: 'uz',    shortCode: 'UZ',  nativeName: 'Oʻzbekcha',            englishName: 'Uzbek',                description: 'Uzbekistan • Latin',                direction: 'ltr', isIndian: false },

  // ── V ─────────────────────────────────────────────────────────────────────
  { code: 'vi',    shortCode: 'VI',  nativeName: 'Tiếng Việt',           englishName: 'Vietnamese',           description: 'Vietnam • Latin',                   direction: 'ltr', isIndian: false },

  // ── W ─────────────────────────────────────────────────────────────────────
  { code: 'cy',    shortCode: 'CY',  nativeName: 'Cymraeg',              englishName: 'Welsh',                description: 'Wales, UK • Latin',                 direction: 'ltr', isIndian: false },

  // ── X ─────────────────────────────────────────────────────────────────────
  { code: 'xh',    shortCode: 'XH',  nativeName: 'isiXhosa',             englishName: 'Xhosa',                description: 'South Africa • Latin',              direction: 'ltr', isIndian: false },

  // ── Y ─────────────────────────────────────────────────────────────────────
  { code: 'yi',    shortCode: 'YI',  nativeName: 'ייִדיש',               englishName: 'Yiddish',              description: 'Jewish diaspora • Hebrew script',   direction: 'rtl', isIndian: false },
  { code: 'yo',    shortCode: 'YO',  nativeName: 'Èdè Yorùbá',           englishName: 'Yoruba',               description: 'Nigeria, Benin • Latin',            direction: 'ltr', isIndian: false },

  // ── Z ─────────────────────────────────────────────────────────────────────
  { code: 'zu',    shortCode: 'ZU',  nativeName: 'isiZulu',              englishName: 'Zulu',                 description: 'South Africa • Latin',              direction: 'ltr', isIndian: false },
];

// ─────────────────────────────────────────────────────────────────────────────
// COMBINED LIST — English first, then Indian languages, then International
// ─────────────────────────────────────────────────────────────────────────────
export const ALL_LANGUAGES: LanguageConfig[] = [
  INTERNATIONAL_LANGUAGES[0], // English (always default #1)
  ...INDIAN_LANGUAGES,
  ...INTERNATIONAL_LANGUAGES.slice(1),
];

export const DEFAULT_LANGUAGE: LanguageConfig = INTERNATIONAL_LANGUAGES[0]; // English

export const LANGUAGE_MAP: Record<string, LanguageConfig> = ALL_LANGUAGES.reduce(
  (acc, lang) => {
    acc[lang.code] = lang;
    return acc;
  },
  {} as Record<string, LanguageConfig>
);

