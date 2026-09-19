const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'locales');
if (!fs.existsSync(localesDir)) {
  fs.mkdirSync(localesDir, { recursive: true });
}

const baseBrand = {
  brandName: "BidSure",
  brandSubtitle: "AI Powered Compliance for GeM",
  tagline: "Procurement. Verified.",
  gemTitle: "GeM",
  gemSubtitle1: "Government",
  gemSubtitle2: "e-Marketplace"
};

const translations = {
  en: {
    ...baseBrand,
    govtOfIndia: "Government of India",
    deptOfExpenditure: "Department of Expenditure",
    skipToMain: "Skip to main content",
    screenReader: "Screen Reader",
    fontSizeIncrease: "Increase text size",
    fontSizeNormal: "Default text size",
    fontSizeDecrease: "Decrease text size",
    nav: {
      home: "Home",
      aboutUs: "About Us",
      features: "Features",
      useCases: "Use Cases",
      howItWorks: "How It Works",
      helpSupport: "Help & Support",
      contact: "Contact"
    },
    selector: {
      title: "Select Language",
      subtitle: "भाषा चुनें",
      indianLanguages: "INDIAN LANGUAGES (14)",
      internationalLanguages: "INTERNATIONAL LANGUAGES (9)"
    },
    auth: {
      login: "Login",
      getStarted: "Get Started"
    }
  },
  hi: {
    ...baseBrand,
    govtOfIndia: "भारत सरकार",
    deptOfExpenditure: "व्यय विभाग",
    skipToMain: "मुख्य सामग्री पर जाएं",
    screenReader: "स्क्रीन रीडर",
    fontSizeIncrease: "अक्षर आकार बढ़ाएं",
    fontSizeNormal: "सामान्य आकार",
    fontSizeDecrease: "अक्षर आकार घटाएं",
    nav: {
      home: "मुख्य पृष्ठ",
      aboutUs: "हमारे बारे में",
      features: "सुविधाएं",
      useCases: "उपयोग परिदृश्य",
      howItWorks: "यह कैसे काम करता है",
      helpSupport: "सहायता एवं समर्थन",
      contact: "संपर्क करें"
    },
    selector: {
      title: "Select Language",
      subtitle: "भाषा चुनें",
      indianLanguages: "INDIAN LANGUAGES (14)",
      internationalLanguages: "INTERNATIONAL LANGUAGES (9)"
    },
    auth: {
      login: "लॉग इन",
      getStarted: "शुरू करें"
    }
  },
  bn: {
    ...baseBrand,
    govtOfIndia: "ভারত সরকার",
    deptOfExpenditure: "ব্যয় বিভাগ",
    skipToMain: "মূল বিষয়বস্তুতে যান",
    screenReader: "স্ক্রিন রিডার",
    fontSizeIncrease: "ফন্টের আকার বৃদ্ধি",
    fontSizeNormal: "স্বাভাবিক আকার",
    fontSizeDecrease: "ফন্টের আকার হ্রাস",
    nav: {
      home: "হোম",
      aboutUs: "আমাদের সম্পর্কে",
      features: "বৈশিষ্ট্য",
      useCases: "ব্যবহার ক্ষেত্র",
      howItWorks: "কিভাবে কাজ করে",
      helpSupport: "সাহায্য ও সহায়তা",
      contact: "যোগাযোগ"
    },
    selector: {
      title: "Select Language",
      subtitle: "ভাষা নির্বাচন করুন",
      indianLanguages: "INDIAN LANGUAGES (14)",
      internationalLanguages: "INTERNATIONAL LANGUAGES (9)"
    },
    auth: {
      login: "লগইন",
      getStarted: "শুরু করুন"
    }
  },
  te: {
    ...baseBrand,
    govtOfIndia: "భారత ప్రభుత్వం",
    deptOfExpenditure: "వ్యయ విభాగం",
    skipToMain: "ప్రధాన కంటెంట్‌కు వెళ్లండి",
    screenReader: "స్క్రీన్ రీడర్",
    fontSizeIncrease: "టెక్స్ట్ పరిమాణాన్ని పెంచండి",
    fontSizeNormal: "సాధారణ పరిమాణం",
    fontSizeDecrease: "టెక్స్ట్ పరిమాణాన్ని తగ్గించండి",
    nav: {
      home: "హోమ్",
      aboutUs: "మా గురించి",
      features: "ఫీచర్లు",
      useCases: "వినియోగ సందర్భాలు",
      howItWorks: "ఇది ఎలా పనిచేస్తుంది",
      helpSupport: "సహాయం & మద్దతు",
      contact: "సంప్రదించండి"
    },
    selector: {
      title: "Select Language",
      subtitle: "భాషను ఎంచుకోండి",
      indianLanguages: "INDIAN LANGUAGES (14)",
      internationalLanguages: "INTERNATIONAL LANGUAGES (9)"
    },
    auth: {
      login: "లాగిన్",
      getStarted: "ప్రారంభించండి"
    }
  },
  mr: {
    ...baseBrand,
    govtOfIndia: "भारत सरकार",
    deptOfExpenditure: "खर्च विभाग",
    skipToMain: "मुख्य सामग्रीवर जा",
    screenReader: "स्क्रीन रीडर",
    fontSizeIncrease: "फॉन्ट आकार वाढवा",
    fontSizeNormal: "सामान्य आकार",
    fontSizeDecrease: "फॉन्ट आकार कमी करा",
    nav: {
      home: "मुख्यपृष्ठ",
      aboutUs: "आमच्याबद्दल",
      features: "वैशिष्ट्ये",
      useCases: "वापर प्रकरणे",
      howItWorks: "हे कसे कार्य करते",
      helpSupport: "मदत आणि समर्थन",
      contact: "संपर्क"
    },
    selector: {
      title: "Select Language",
      subtitle: "भाषा निवडा",
      indianLanguages: "INDIAN LANGUAGES (14)",
      internationalLanguages: "INTERNATIONAL LANGUAGES (9)"
    },
    auth: {
      login: "लॉगिन",
      getStarted: "सुरू करा"
    }
  },
  ta: {
    ...baseBrand,
    govtOfIndia: "இந்திய அரசு",
    deptOfExpenditure: "செலவினத் துறை",
    skipToMain: "முதன்மை உள்ளடக்கத்திற்குச் செல்க",
    screenReader: "திரை வாசகர்",
    fontSizeIncrease: "எழுத்துரு அளவை அதிகரிக்க",
    fontSizeNormal: "இயல்பான அளவு",
    fontSizeDecrease: "எழுத்துரு அளவை குறைக்க",
    nav: {
      home: "முகப்பு",
      aboutUs: "எங்களை பற்றி",
      features: "அம்சங்கள்",
      useCases: "பயன்பாட்டு வழக்குகள்",
      howItWorks: "இது எவ்வாறு செயல்படுகிறது",
      helpSupport: "உதவி & ஆதரவு",
      contact: "தொடர்பு கொள்க"
    },
    selector: {
      title: "Select Language",
      subtitle: "மொழியைத் தேர்ந்தெடுக்கவும்",
      indianLanguages: "INDIAN LANGUAGES (14)",
      internationalLanguages: "INTERNATIONAL LANGUAGES (9)"
    },
    auth: {
      login: "உள்நுழைக",
      getStarted: "தொடங்குங்கள்"
    }
  },
  gu: {
    ...baseBrand,
    govtOfIndia: "ભારત સરકાર",
    deptOfExpenditure: "ખર્ચ વિભાગ",
    skipToMain: "મુખ્ય સામગ્રી પર જાઓ",
    screenReader: "સ્ક્રીન રીડર",
    fontSizeIncrease: "ટેક્સ્ટનું કદ વધારો",
    fontSizeNormal: "સામાન્ય કદ",
    fontSizeDecrease: "ટેક્સ્ટનું કદ ઘટાડો",
    nav: {
      home: "હોમ",
      aboutUs: "અમારા વિશે",
      features: "સુવિધાઓ",
      useCases: "ઉપયોગના કેસો",
      howItWorks: "આ કેવી રીતે કાર્ય કરે છે",
      helpSupport: "સહાય અને સમર્થન",
      contact: "સંપર્ક કરો"
    },
    selector: {
      title: "Select Language",
      subtitle: "ભાષા પસંદ કરો",
      indianLanguages: "INDIAN LANGUAGES (14)",
      internationalLanguages: "INTERNATIONAL LANGUAGES (9)"
    },
    auth: {
      login: "પ્રવેશ કરો",
      getStarted: "શરૂ કરો"
    }
  },
  ur: {
    ...baseBrand,
    govtOfIndia: "حکومت ہند",
    deptOfExpenditure: "محکمہ اخراجات",
    skipToMain: "مرکزی مواد پر جائیں",
    screenReader: "اسکرین ریڈر",
    fontSizeIncrease: "متن کا سائز بڑھائیں",
    fontSizeNormal: "عام سائز",
    fontSizeDecrease: "متن کا سائز کم کریں",
    nav: {
      home: "صفحہ اول",
      aboutUs: "ہمارے بارے میں",
      features: "خصوصیات",
      useCases: "استعمال کے کیسز",
      howItWorks: "یہ کیسے کام کرتا ہے",
      helpSupport: "مدد اور تعاون",
      contact: "رابطہ کریں"
    },
    selector: {
      title: "Select Language",
      subtitle: "زبان منتخب کریں",
      indianLanguages: "INDIAN LANGUAGES (14)",
      internationalLanguages: "INTERNATIONAL LANGUAGES (9)"
    },
    auth: {
      login: "لاگ ان",
      getStarted: "شروع کریں"
    }
  },
  kn: {
    ...baseBrand,
    govtOfIndia: "ಭಾರತ ಸರ್ಕಾರ",
    deptOfExpenditure: "ವೆಚ್ಚ ಇಲಾಖೆ",
    skipToMain: "ಮುಖ್ಯ ವಿಷಯಕ್ಕೆ ತೆರಳಿ",
    screenReader: "ಸ್ಕ್ರೀನ್ ರೀಡರ್",
    fontSizeIncrease: "ಅಕ್ಷರ ಗಾತ್ರವನ್ನು ಹೆಚ್ಚಿಸಿ",
    fontSizeNormal: "ಸಾಮಾನ್ಯ ಗಾತ್ರ",
    fontSizeDecrease: "ಅಕ್ಷರ ಗಾತ್ರವನ್ನು ಕಡಿಮೆ ಮಾಡಿ",
    nav: {
      home: "ಮುಖಪುಟ",
      aboutUs: "ನಮ್ಮ ಬಗ್ಗೆ",
      features: "ವೈಶಿಷ್ಟ್ಯಗಳು",
      useCases: "ಬಳಕೆಯ ಪ್ರಕರಣಗಳು",
      howItWorks: "ಇದು ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ",
      helpSupport: "ಸಹಾಯ ಮತ್ತು ಬೆಂಬಲ",
      contact: "ಸಂಪರ್ಕಿಸಿ"
    },
    selector: {
      title: "Select Language",
      subtitle: "ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
      indianLanguages: "INDIAN LANGUAGES (14)",
      internationalLanguages: "INTERNATIONAL LANGUAGES (9)"
    },
    auth: {
      login: "ಲಾಗಿನ್",
      getStarted: "ಪ್ರಾರಂಭಿಸಿ"
    }
  },
  ml: {
    ...baseBrand,
    govtOfIndia: "ഭാരത സർക്കാർ",
    deptOfExpenditure: "ചെലവ് വകുപ്പ്",
    skipToMain: "പ്രധാന ഉള്ളടക്കത്തിലേക്ക് പോകുക",
    screenReader: "സ്ക്രീൻ റീഡർ",
    fontSizeIncrease: "ഫോണ്ട് വലുപ്പം കൂട്ടുക",
    fontSizeNormal: "സാധാരണ വലുപ്പം",
    fontSizeDecrease: "ഫോണ്ട് വലുപ്പം കുറയ്ക്കുക",
    nav: {
      home: "പ്രധാന പേജ്",
      aboutUs: "ഞങ്ങളെ കുറിച്ച്",
      features: "സവിശേഷതകൾ",
      useCases: "ഉപയോഗ കേസുകൾ",
      howItWorks: "ഇത് എങ്ങനെ പ്രവർത്തിക്കുന്നു",
      helpSupport: "സഹായവും പിന്തുണയും",
      contact: "ബന്ധപ്പെടുക"
    },
    selector: {
      title: "Select Language",
      subtitle: "ഭാഷ തിരഞ്ഞെടുക്കുക",
      indianLanguages: "INDIAN LANGUAGES (14)",
      internationalLanguages: "INTERNATIONAL LANGUAGES (9)"
    },
    auth: {
      login: "ലോഗിൻ",
      getStarted: "ആരംഭിക്കുക"
    }
  },
  or: {
    ...baseBrand,
    govtOfIndia: "ଭାରତ ସରକାର",
    deptOfExpenditure: "ବ୍ୟୟ ବିଭାଗ",
    skipToMain: "ମୁଖ୍ୟ ବିଷୟବସ୍ତୁକୁ ଯାଆନ୍ତୁ",
    screenReader: "ସ୍କ୍ରିନ୍ ରିଡର୍",
    fontSizeIncrease: "ଟେକ୍ସଟ୍ ଆକାର ବୃଦ୍ଧି କରନ୍ତୁ",
    fontSizeNormal: "ସାଧାରଣ ଆକାର",
    fontSizeDecrease: "ଟେକ୍ସଟ୍ ଆକାର ହ୍ରାସ କରନ୍ତୁ",
    nav: {
      home: "ମୂଳପୃଷ୍ଠା",
      aboutUs: "ଆମ ବିଷୟରେ",
      features: "ବୈଶିଷ୍ଟ୍ୟଗୁଡିକ",
      useCases: "ବ୍ୟବହାର ପ୍ରକରଣ",
      howItWorks: "ଏହା କିପରି କାମ କରେ",
      helpSupport: "ସହାୟତା ଏବଂ ସମର୍ଥନ",
      contact: "ଯୋଗାଯୋଗ",
    },
    selector: {
      title: "Select Language",
      subtitle: "ଭାଷା ଚୟନ କରନ୍ତୁ",
      indianLanguages: "INDIAN LANGUAGES (14)",
      internationalLanguages: "INTERNATIONAL LANGUAGES (9)"
    },
    auth: {
      login: "ଲଗଇନ୍",
      getStarted: "ଆରମ୍ଭ କରନ୍ତୁ"
    }
  },
  pa: {
    ...baseBrand,
    govtOfIndia: "ਭਾਰਤ ਸਰਕਾਰ",
    deptOfExpenditure: "ਖਰਚ ਵਿਭਾਗ",
    skipToMain: "ਮੁੱਖ ਸਮੱਗਰੀ 'ਤੇ ਜਾਓ",
    screenReader: "ਸਕ੍ਰੀਨ ਰੀਡਰ",
    fontSizeIncrease: "ਅੱਖਰ ਦਾ ਆਕਾਰ ਵਧਾਓ",
    fontSizeNormal: "ਆਮ ਆਕਾਰ",
    fontSizeDecrease: "ਅੱਖਰ ਦਾ ਆਕਾਰ ਘਟਾਓ",
    nav: {
      home: "ਮੁੱਖ ਸਫ਼ਾ",
      aboutUs: "ਸਾਡੇ ਬਾਰੇ",
      features: "ਵਿਸ਼ੇਸ਼ਤਾਵਾਂ",
      useCases: "ਵਰਤੋਂ ਦੇ ਮਾਮਲੇ",
      howItWorks: "ਇਹ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ",
      helpSupport: "ਮਦਦ ਅਤੇ ਸਹਾਇਤਾ",
      contact: "ਸੰਪਰਕ ਕਰੋ"
    },
    selector: {
      title: "Select Language",
      subtitle: "ਭਾਸ਼ਾ ਚੁਣੋ",
      indianLanguages: "INDIAN LANGUAGES (14)",
      internationalLanguages: "INTERNATIONAL LANGUAGES (9)"
    },
    auth: {
      login: "ਲਾਗਇਨ",
      getStarted: "ਸ਼ੁਰੂ ਕਰੋ"
    }
  },
  as: {
    ...baseBrand,
    govtOfIndia: "ভাৰত চৰকাৰ",
    deptOfExpenditure: "ব্যয় বিভাগ",
    skipToMain: "মূল বিষয়বস্তুলৈ যাওক",
    screenReader: "স্ক্ৰীণ ৰীডাৰ",
    fontSizeIncrease: "আখৰৰ আকাৰ বৃদ্ধি কৰক",
    fontSizeNormal: "সাধাৰণ আকাৰ",
    fontSizeDecrease: "আখৰৰ আকাৰ হ্ৰাস কৰক",
    nav: {
      home: "মুখ্য পৃষ্ঠা",
      aboutUs: "আমাৰ বিষয়ে",
      features: "বৈশিষ্ট্যসমূহ",
      useCases: "ব্যৱহাৰৰ ক্ষেত্ৰ",
      howItWorks: "ই কেনেকৈ কাম কৰে",
      helpSupport: "সহায় আৰু সমৰ্থন",
      contact: "যোগাযোগ"
    },
    selector: {
      title: "Select Language",
      subtitle: "ভাষা বাছক",
      indianLanguages: "INDIAN LANGUAGES (14)",
      internationalLanguages: "INTERNATIONAL LANGUAGES (9)"
    },
    auth: {
      login: "লগইন",
      getStarted: "আৰম্ভ কৰক"
    }
  },
  ne: {
    ...baseBrand,
    govtOfIndia: "भारत सरकार",
    deptOfExpenditure: "खर्च विभाग",
    skipToMain: "मुख्य सामग्रीमा जानुहोस्",
    screenReader: "स्क्रिन रिडर",
    fontSizeIncrease: "फन्ट साइज बढाउनुहोस्",
    fontSizeNormal: "सामान्य साइज",
    fontSizeDecrease: "फन्ट साइज घटाउनुहोस्",
    nav: {
      home: "गृहपृष्ठ",
      aboutUs: "हाम्रो बारेमा",
      features: "विशेषताहरू",
      useCases: "प्रयोगका अवस्थाहरू",
      howItWorks: "यो कसरी काम गर्छ",
      helpSupport: "मद्दत र समर्थन",
      contact: "सम्पर्क"
    },
    selector: {
      title: "Select Language",
      subtitle: "भाषा चयन गर्नुहोस्",
      indianLanguages: "INDIAN LANGUAGES (14)",
      internationalLanguages: "INTERNATIONAL LANGUAGES (9)"
    },
    auth: {
      login: "लगइन",
      getStarted: "सुरु गर्नुहोस्"
    }
  },
  sa: {
    ...baseBrand,
    govtOfIndia: "भारतसर्वकारः",
    deptOfExpenditure: "व्ययविभागः",
    skipToMain: "मुख्यविषयं गच्छतु",
    screenReader: "स्क्रीन रीडर",
    fontSizeIncrease: "अक्षरपरिमाणं वर्धयतु",
    fontSizeNormal: "सामान्यपरिमाणम्",
    fontSizeDecrease: "अक्षरपरिमाणं न्यूनीकरोतु",
    nav: {
      home: "मुखपृष्ठम्",
      aboutUs: "अस्माकं विषये",
      features: "वैशिष्ट्यानि",
      useCases: "उपयोगोदाहरणानि",
      howItWorks: "कथं कार्यं करोति",
      helpSupport: "सहायता च समर्थनम्",
      contact: "सम्पर्कं कुर्वन्तु"
    },
    selector: {
      title: "Select Language",
      subtitle: "भाषां चिनोतु",
      indianLanguages: "INDIAN LANGUAGES (14)",
      internationalLanguages: "INTERNATIONAL LANGUAGES (9)"
    },
    auth: {
      login: "प्रवेशः",
      getStarted: "आरभताम्"
    }
  },
  es: {
    ...baseBrand,
    govtOfIndia: "Gobierno de la India",
    deptOfExpenditure: "Departamento de Gastos",
    skipToMain: "Saltar al contenido principal",
    screenReader: "Lector de pantalla",
    fontSizeIncrease: "Aumentar tamaño de texto",
    fontSizeNormal: "Tamaño normal",
    fontSizeDecrease: "Disminuir tamaño de texto",
    nav: {
      home: "Inicio",
      aboutUs: "Sobre nosotros",
      features: "Características",
      useCases: "Casos de uso",
      howItWorks: "Cómo funciona",
      helpSupport: "Ayuda y soporte",
      contact: "Contacto"
    },
    selector: {
      title: "Select Language",
      subtitle: "Seleccionar idioma",
      indianLanguages: "INDIAN LANGUAGES (14)",
      internationalLanguages: "INTERNATIONAL LANGUAGES (9)"
    },
    auth: {
      login: "Iniciar sesión",
      getStarted: "Empezar"
    }
  },
  fr: {
    ...baseBrand,
    govtOfIndia: "Gouvernement de l'Inde",
    deptOfExpenditure: "Département des Dépenses",
    skipToMain: "Passer au contenu principal",
    screenReader: "Lecteur d'écran",
    fontSizeIncrease: "Agrandir le texte",
    fontSizeNormal: "Taille normale",
    fontSizeDecrease: "Diminuer le texte",
    nav: {
      home: "Accueil",
      aboutUs: "À propos",
      features: "Fonctionnalités",
      useCases: "Cas d'usage",
      howItWorks: "Comment ça marche",
      helpSupport: "Aide & Support",
      contact: "Contact"
    },
    selector: {
      title: "Select Language",
      subtitle: "Sélectionner la langue",
      indianLanguages: "INDIAN LANGUAGES (14)",
      internationalLanguages: "INTERNATIONAL LANGUAGES (9)"
    },
    auth: {
      login: "Connexion",
      getStarted: "Démarrer"
    }
  },
  de: {
    ...baseBrand,
    govtOfIndia: "Regierung von Indien",
    deptOfExpenditure: "Ausgabenabteilung",
    skipToMain: "Zum Hauptinhalt springen",
    screenReader: "Bildschirmleser",
    fontSizeIncrease: "Text vergrößern",
    fontSizeNormal: "Normale Größe",
    fontSizeDecrease: "Text verkleinern",
    nav: {
      home: "Startseite",
      aboutUs: "Über uns",
      features: "Funktionen",
      useCases: "Anwendungsfälle",
      howItWorks: "Wie es funktioniert",
      helpSupport: "Hilfe & Support",
      contact: "Kontakt"
    },
    selector: {
      title: "Select Language",
      subtitle: "Sprache auswählen",
      indianLanguages: "INDIAN LANGUAGES (14)",
      internationalLanguages: "INTERNATIONAL LANGUAGES (9)"
    },
    auth: {
      login: "Anmelden",
      getStarted: "Jetzt starten"
    }
  },
  pt: {
    ...baseBrand,
    govtOfIndia: "Governo da Índia",
    deptOfExpenditure: "Departamento de Despesas",
    skipToMain: "Ir para o conteúdo principal",
    screenReader: "Leitor de tela",
    fontSizeIncrease: "Aumentar tamanho do texto",
    fontSizeNormal: "Tamanho padrão",
    fontSizeDecrease: "Diminuir tamanho do texto",
    nav: {
      home: "Início",
      aboutUs: "Sobre nós",
      features: "Recursos",
      useCases: "Casos de uso",
      howItWorks: "Como funciona",
      helpSupport: "Ajuda e suporte",
      contact: "Contato"
    },
    selector: {
      title: "Select Language",
      subtitle: "Selecionar idioma",
      indianLanguages: "INDIAN LANGUAGES (14)",
      internationalLanguages: "INTERNATIONAL LANGUAGES (9)"
    },
    auth: {
      login: "Entrar",
      getStarted: "Começar"
    }
  },
  ar: {
    ...baseBrand,
    govtOfIndia: "حكومة الهند",
    deptOfExpenditure: "إدارة النفقات",
    skipToMain: "الانتقال إلى المحتوى الرئيسي",
    screenReader: "قارئ الشاشة",
    fontSizeIncrease: "تكبير حجم الخط",
    fontSizeNormal: "الحجم الافتراضي",
    fontSizeDecrease: "تصغير حجم الخط",
    nav: {
      home: "الرئيسية",
      aboutUs: "من نحن",
      features: "الميزات",
      useCases: "حالات الاستخدام",
      howItWorks: "كيف يعمل",
      helpSupport: "المساعدة والدعم",
      contact: "اتصل بنا"
    },
    selector: {
      title: "Select Language",
      subtitle: "اختر اللغة",
      indianLanguages: "INDIAN LANGUAGES (14)",
      internationalLanguages: "INTERNATIONAL LANGUAGES (9)"
    },
    auth: {
      login: "تسجيل الدخول",
      getStarted: "ابدأ الآن"
    }
  },
  'zh-CN': {
    ...baseBrand,
    govtOfIndia: "印度政府",
    deptOfExpenditure: "支出部",
    skipToMain: "跳转至主要内容",
    screenReader: "屏幕阅读器",
    fontSizeIncrease: "放大字体",
    fontSizeNormal: "标准字体",
    fontSizeDecrease: "缩小字体",
    nav: {
      home: "首页",
      aboutUs: "关于我们",
      features: "功能特点",
      useCases: "应用场景",
      howItWorks: "工作原理",
      helpSupport: "帮助与支持",
      contact: "联系我们"
    },
    selector: {
      title: "Select Language",
      subtitle: "选择语言",
      indianLanguages: "INDIAN LANGUAGES (14)",
      internationalLanguages: "INTERNATIONAL LANGUAGES (9)"
    },
    auth: {
      login: "登录",
      getStarted: "立即体验"
    }
  },
  ja: {
    ...baseBrand,
    govtOfIndia: "インド政府",
    deptOfExpenditure: "支出局",
    skipToMain: "メインコンテンツへスキップ",
    screenReader: "スクリーンリーダー",
    fontSizeIncrease: "文字サイズを拡大",
    fontSizeNormal: "標準サイズ",
    fontSizeDecrease: "文字サイズを縮小",
    nav: {
      home: "ホーム",
      aboutUs: "私たちについて",
      features: "機能",
      useCases: "導入事例",
      howItWorks: "仕組み",
      helpSupport: "ヘルプ＆サポート",
      contact: "お問い合わせ"
    },
    selector: {
      title: "Select Language",
      subtitle: "言語を選択",
      indianLanguages: "INDIAN LANGUAGES (14)",
      internationalLanguages: "INTERNATIONAL LANGUAGES (9)"
    },
    auth: {
      login: "ログイン",
      getStarted: "始める"
    }
  },
  ko: {
    ...baseBrand,
    govtOfIndia: "인도 정부",
    deptOfExpenditure: "지출부",
    skipToMain: "주요 내용으로 건너뛰기",
    screenReader: "화면 리더",
    fontSizeIncrease: "글자 크기 확대",
    fontSizeNormal: "기본 크기",
    fontSizeDecrease: "글자 크기 축소",
    nav: {
      home: "홈",
      aboutUs: "회사 소개",
      features: "주요 기능",
      useCases: "사용 사례",
      howItWorks: "작동 방식",
      helpSupport: "도움말 및 지원",
      contact: "문의하기"
    },
    selector: {
      title: "Select Language",
      subtitle: "언어 선택",
      indianLanguages: "INDIAN LANGUAGES (14)",
      internationalLanguages: "INTERNATIONAL LANGUAGES (9)"
    },
    auth: {
      login: "로그인",
      getStarted: "시작하기"
    }
  }
};

for (const [code, content] of Object.entries(translations)) {
  const filePath = path.join(localesDir, `${code}.json`);
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf-8');
  console.log(`Generated ${filePath}`);
}

console.log(`Successfully generated ${Object.keys(translations).length} locale JSON files.`);
