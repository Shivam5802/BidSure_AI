export interface LanguageConfig {
  code: string;
  shortCode: string;
  nativeName: string;
  englishName: string;
  description: string;
  direction: 'ltr' | 'rtl';
  isIndian: boolean;
}

export const INDIAN_LANGUAGES: LanguageConfig[] = [
  { code: 'hi', shortCode: 'HI', nativeName: 'हिन्दी', englishName: 'Hindi', description: 'North & Central India • Devanagari', direction: 'ltr', isIndian: true },
  { code: 'bn', shortCode: 'BN', nativeName: 'বাংলা', englishName: 'Bengali', description: 'West Bengal, Tripura • Bengali', direction: 'ltr', isIndian: true },
  { code: 'te', shortCode: 'TE', nativeName: 'తెలుగు', englishName: 'Telugu', description: 'Andhra Pradesh, Telangana • Telugu', direction: 'ltr', isIndian: true },
  { code: 'mr', shortCode: 'MR', nativeName: 'मराठी', englishName: 'Marathi', description: 'Maharashtra • Devanagari', direction: 'ltr', isIndian: true },
  { code: 'ta', shortCode: 'TA', nativeName: 'தமிழ்', englishName: 'Tamil', description: 'Tamil Nadu, Puducherry • Tamil', direction: 'ltr', isIndian: true },
  { code: 'ur', shortCode: 'UR', nativeName: 'اردو', englishName: 'Urdu', description: 'Jammu & Kashmir, Telangana • Nastaliq', direction: 'rtl', isIndian: true },
  { code: 'gu', shortCode: 'GU', nativeName: 'ગુજરાતી', englishName: 'Gujarati', description: 'Gujarat • Gujarati', direction: 'ltr', isIndian: true },
  { code: 'kn', shortCode: 'KN', nativeName: 'ಕನ್ನಡ', englishName: 'Kannada', description: 'Karnataka • Kannada', direction: 'ltr', isIndian: true },
  { code: 'or', shortCode: 'OR', nativeName: 'ଓଡ଼ିଆ', englishName: 'Odia', description: 'Odisha • Odia', direction: 'ltr', isIndian: true },
  { code: 'ml', shortCode: 'ML', nativeName: 'മലയാളം', englishName: 'Malayalam', description: 'Kerala, Lakshadweep • Malayalam', direction: 'ltr', isIndian: true },
  { code: 'pa', shortCode: 'PA', nativeName: 'ਪੰਜਾਬੀ', englishName: 'Punjabi', description: 'Punjab • Gurmukhi', direction: 'ltr', isIndian: true },
  { code: 'as', shortCode: 'AS', nativeName: 'অসমীয়া', englishName: 'Assamese', description: 'Assam • Assamese', direction: 'ltr', isIndian: true },
  { code: 'mai', shortCode: 'MAI', nativeName: 'मैथिली', englishName: 'Maithili', description: 'Bihar, Jharkhand • Devanagari', direction: 'ltr', isIndian: true },
  { code: 'sa', shortCode: 'SA', nativeName: 'संस्कृतम्', englishName: 'Sanskrit', description: 'Classical / Pan-India • Devanagari', direction: 'ltr', isIndian: true },
  { code: 'ne', shortCode: 'NE', nativeName: 'नेपाली', englishName: 'Nepali', description: 'Sikkim, West Bengal • Devanagari', direction: 'ltr', isIndian: true },
  { code: 'kok', shortCode: 'KOK', nativeName: 'कोंकणी', englishName: 'Konkani', description: 'Goa, Coastal Karnataka • Devanagari', direction: 'ltr', isIndian: true },
  { code: 'sd', shortCode: 'SD', nativeName: 'سنڌي', englishName: 'Sindhi', description: 'Sindh Communities • Arabic', direction: 'rtl', isIndian: true },
  { code: 'ks', shortCode: 'KS', nativeName: 'کٲشُر', englishName: 'Kashmiri', description: 'Jammu & Kashmir • Nastaliq', direction: 'rtl', isIndian: true },
  { code: 'doi', shortCode: 'DOI', nativeName: 'डोगरी', englishName: 'Dogri', description: 'Jammu • Devanagari', direction: 'ltr', isIndian: true },
  { code: 'bho', shortCode: 'BHO', nativeName: 'भोजपुरी', englishName: 'Bhojpuri', description: 'Bihar, Eastern UP • Devanagari', direction: 'ltr', isIndian: true },
  { code: 'mni', shortCode: 'MNI', nativeName: 'মৈতৈলোন্', englishName: 'Manipuri', description: 'Manipur • Meitei', direction: 'ltr', isIndian: true },
  { code: 'sat', shortCode: 'SAT', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', englishName: 'Santali', description: 'Jharkhand, West Bengal, Odisha • Ol Chiki', direction: 'ltr', isIndian: true },
  { code: 'brx', shortCode: 'BRX', nativeName: 'बर\'', englishName: 'Bodo', description: 'Assam • Devanagari', direction: 'ltr', isIndian: true },
];

export const INTERNATIONAL_LANGUAGES: LanguageConfig[] = [
  { code: 'en', shortCode: 'ENG', nativeName: 'English', englishName: 'English', description: 'International / Pan-India • Latin', direction: 'ltr', isIndian: false },
  { code: 'es', shortCode: 'ES', nativeName: 'Español', englishName: 'Spanish', description: 'Spain & Latin America • Latin', direction: 'ltr', isIndian: false },
  { code: 'fr', shortCode: 'FR', nativeName: 'Français', englishName: 'French', description: 'France, Global • Latin', direction: 'ltr', isIndian: false },
  { code: 'de', shortCode: 'DE', nativeName: 'Deutsch', englishName: 'German', description: 'Germany, Central Europe • Latin', direction: 'ltr', isIndian: false },
  { code: 'ru', shortCode: 'RU', nativeName: 'Русский', englishName: 'Russian', description: 'Eurasia & CIS • Cyrillic', direction: 'ltr', isIndian: false },
  { code: 'ar', shortCode: 'AR', nativeName: 'العربية', englishName: 'Arabic', description: 'Middle East & North Africa • Arabic', direction: 'rtl', isIndian: false },
  { code: 'zh-CN', shortCode: 'ZH', nativeName: '简体中文', englishName: 'Chinese', description: 'East Asia • Simplified Chinese', direction: 'ltr', isIndian: false },
  { code: 'ja', shortCode: 'JA', nativeName: '日本語', englishName: 'Japanese', description: 'Japan • Kanji / Kana', direction: 'ltr', isIndian: false },
];

export const ALL_LANGUAGES: LanguageConfig[] = [
  // English is strictly the first and default language
  INTERNATIONAL_LANGUAGES[0],
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
