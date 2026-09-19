export interface LanguageConfig {
  code: string;
  nativeName: string;
  englishName: string;
  direction: 'ltr' | 'rtl';
  category: 'indian' | 'international';
}

export const INDIAN_LANGUAGES: LanguageConfig[] = [
  { code: 'hi', nativeName: 'हिन्दी', englishName: 'Hindi', direction: 'ltr', category: 'indian' },
  { code: 'bn', nativeName: 'বাংলা', englishName: 'Bengali', direction: 'ltr', category: 'indian' },
  { code: 'te', nativeName: 'తెలుగు', englishName: 'Telugu', direction: 'ltr', category: 'indian' },
  { code: 'mr', nativeName: 'मराठी', englishName: 'Marathi', direction: 'ltr', category: 'indian' },
  { code: 'ta', nativeName: 'தமிழ்', englishName: 'Tamil', direction: 'ltr', category: 'indian' },
  { code: 'gu', nativeName: 'ગુજરાતી', englishName: 'Gujarati', direction: 'ltr', category: 'indian' },
  { code: 'ur', nativeName: 'اردو', englishName: 'Urdu', direction: 'rtl', category: 'indian' },
  { code: 'kn', nativeName: 'ಕನ್ನಡ', englishName: 'Kannada', direction: 'ltr', category: 'indian' },
  { code: 'ml', nativeName: 'മലയാളം', englishName: 'Malayalam', direction: 'ltr', category: 'indian' },
  { code: 'or', nativeName: 'ଓଡ଼ିଆ', englishName: 'Odia', direction: 'ltr', category: 'indian' },
  { code: 'pa', nativeName: 'ਪੰਜਾਬੀ', englishName: 'Punjabi', direction: 'ltr', category: 'indian' },
  { code: 'as', nativeName: 'অসমীয়া', englishName: 'Assamese', direction: 'ltr', category: 'indian' },
  { code: 'ne', nativeName: 'नेपाली', englishName: 'Nepali', direction: 'ltr', category: 'indian' },
  { code: 'sa', nativeName: 'संस्कृतम्', englishName: 'Sanskrit', direction: 'ltr', category: 'indian' },
];

export const INTERNATIONAL_LANGUAGES: LanguageConfig[] = [
  { code: 'en', nativeName: 'English', englishName: 'English', direction: 'ltr', category: 'international' },
  { code: 'es', nativeName: 'Español', englishName: 'Spanish', direction: 'ltr', category: 'international' },
  { code: 'fr', nativeName: 'Français', englishName: 'French', direction: 'ltr', category: 'international' },
  { code: 'de', nativeName: 'Deutsch', englishName: 'German', direction: 'ltr', category: 'international' },
  { code: 'pt', nativeName: 'Português', englishName: 'Portuguese', direction: 'ltr', category: 'international' },
  { code: 'ar', nativeName: 'العربية', englishName: 'Arabic', direction: 'rtl', category: 'international' },
  { code: 'zh-CN', nativeName: '简体中文', englishName: 'Chinese (Simplified)', direction: 'ltr', category: 'international' },
  { code: 'ja', nativeName: '日本語', englishName: 'Japanese', direction: 'ltr', category: 'international' },
  { code: 'ko', nativeName: '한국어', englishName: 'Korean', direction: 'ltr', category: 'international' },
];

export const ALL_LANGUAGES: LanguageConfig[] = [
  ...INDIAN_LANGUAGES,
  ...INTERNATIONAL_LANGUAGES,
];

export const DEFAULT_LANGUAGE: LanguageConfig = INTERNATIONAL_LANGUAGES[0]; // English

export const LANGUAGE_MAP: Record<string, LanguageConfig> = ALL_LANGUAGES.reduce(
  (acc, lang) => {
    acc[lang.code] = lang;
    return acc;
  },
  {} as Record<string, LanguageConfig>
);
