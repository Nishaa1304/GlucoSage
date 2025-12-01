// Translation system for English and Hindi
export interface Translations {
  // Common
  loading: string;
  error: string;
  success: string;
  cancel: string;
  save: string;
  delete: string;
  edit: string;
  close: string;
  back: string;
  next: string;
  confirm: string;
  
  // Greetings
  goodMorning: string;
  goodAfternoon: string;
  goodEvening: string;
  
  // Home Page
  home: {
    title: string;
    listening: string;
    tapToSpeak: string;
    trySaying: string;
    youSaid: string;
    processing: string;
    sugarStableToday: string;
    lastReading: string;
    hoursAgo: string;
  };
  
  // Food Scan
  foodScan: {
    title: string;
    subtitle: string;
    positionPlate: string;
    cameraOff: string;
    turnOnCamera: string;
    turnOffCamera: string;
    capturePhoto: string;
    browseUpload: string;
    analyzing: string;
    tipsTitle: string;
    tips: string[];
    result: {
      title: string;
      detected: string;
      nutrition: string;
      calories: string;
      carbs: string;
      protein: string;
      fat: string;
      fiber: string;
      sugar: string;
      sugarImpact: string;
      advice: string;
      logMeal: string;
    };
  };
  
  // Prediction
  prediction: {
    title: string;
    subtitle: string;
    currentReading: string;
    peakForecast: string;
    whatIfScenarios: string;
    whatIfSubtitle: string;
    resetToDefault: string;
    glucoseZones: string;
    zones: {
      normal: string;
      moderate: string;
      high: string;
    };
    scenarios: {
      sweet: string;
      walk: string;
      skipMeal: string;
      medication: string;
    };
  };
  
  // ABHA Records
  abha: {
    title: string;
    subtitle: string;
    notLinked: string;
    linkAbha: string;
    abhaNumber: string;
    abhaAddress: string;
    voiceQuery: string;
    voiceQueryPlaceholder: string;
    searchRecords: string;
    shareWithDoctor: string;
    selectDoctor: string;
    shareButton: string;
    shareSuccess: string;
    recordTypes: {
      all: string;
      prescription: string;
      labReport: string;
      discharge: string;
      consultation: string;
    };
  };
  
  // Doctor Dashboard
  doctor: {
    title: string;
    subtitle: string;
    totalPatients: string;
    highRisk: string;
    activeToday: string;
    avgGlucose: string;
    filterAll: string;
    filterHighRisk: string;
    viewDetails: string;
    lastReading: string;
    status: {
      normal: string;
      moderate: string;
      high: string;
    };
  };
  
  // Navigation
  nav: {
    home: string;
    scan: string;
    trend: string;
    records: string;
  };
  
  // Onboarding
  onboarding: {
    welcome: string;
    subtitle: string;
    chooseLanguage: string;
    grantPermissions: string;
    microphoneAccess: string;
    cameraAccess: string;
    granted: string;
    grant: string;
    moreLanguagesSoon: string;
    getStarted: string;
  };
  
  // Voice Commands
  voiceCommands: {
    scanFood: string;
    showPrediction: string;
    showRecords: string;
    logMedicine: string;
  };
  
  // Voice Responses
  voiceResponses: {
    openingScanner: string;
    showingPredictions: string;
    openingRecords: string;
    iHeard: string;
    languageChangedToHindi: string;
    languageChangedToEnglish: string;
  };
}

export const translations: Record<'en' | 'hi', Translations> = {
  en: {
    // Common
    loading: 'Loading',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    confirm: 'Confirm',
    
    // Greetings
    goodMorning: 'Good morning',
    goodAfternoon: 'Good afternoon',
    goodEvening: 'Good evening',
    
    // Home Page
    home: {
      title: 'Home',
      listening: 'Listening...',
      tapToSpeak: 'Tap to speak',
      trySaying: 'Try saying...',
      youSaid: 'You said:',
      processing: 'Processing...',
      sugarStableToday: 'Your sugar seems stable today.',
      lastReading: 'Last reading:',
      hoursAgo: 'hours ago',
    },
    
    // Food Scan
    foodScan: {
      title: 'Scan Your Food',
      subtitle: 'Capture or upload your meal photo',
      positionPlate: 'Position your plate in the frame',
      cameraOff: 'Camera is Off',
      turnOnCamera: 'Turn On Camera',
      turnOffCamera: 'Turn Off Camera',
      capturePhoto: 'Capture Photo',
      browseUpload: 'Browse & Upload Photo',
      analyzing: 'Analyzing...',
      tipsTitle: 'Tips for best results:',
      tips: [
        'Ensure good lighting',
        'Show the entire plate',
        'Avoid shadows on food',
        'Or upload a clear photo from gallery',
      ],
      result: {
        title: 'Food Analysis Result',
        detected: 'Detected Food Items',
        nutrition: 'Nutrition Information',
        calories: 'Calories',
        carbs: 'Carbs',
        protein: 'Protein',
        fat: 'Fat',
        fiber: 'Fiber',
        sugar: 'Sugar',
        sugarImpact: 'Sugar Impact',
        advice: 'Health Advice',
        logMeal: 'Log This Meal',
      },
    },
    
    // Prediction
    prediction: {
      title: 'Glucose Prediction',
      subtitle: "Today's trend and forecast",
      currentReading: 'Current Reading',
      peakForecast: 'Peak Forecast',
      whatIfScenarios: '🔮 What-If Scenarios',
      whatIfSubtitle: 'See how different actions affect your glucose',
      resetToDefault: 'Reset to Default Prediction',
      glucoseZones: 'Glucose Zones',
      zones: {
        normal: 'Normal (70-140 mg/dL)',
        moderate: 'Moderate (140-180 mg/dL)',
        high: 'High (180+ mg/dL)',
      },
      scenarios: {
        sweet: 'What if I eat something sweet?',
        walk: 'What if I take a 20-minute walk?',
        skipMeal: 'What if I skip my next meal?',
        medication: 'What if I take my medication now?',
      },
    },
    
    // ABHA Records
    abha: {
      title: 'ABHA Health Records',
      subtitle: 'Your digital health records',
      notLinked: 'Link your ABHA account to access your health records',
      linkAbha: 'Link ABHA Account',
      abhaNumber: 'ABHA Number',
      abhaAddress: 'ABHA Address',
      voiceQuery: 'Voice Query',
      voiceQueryPlaceholder: 'Ask about your health records...',
      searchRecords: 'Search Records',
      shareWithDoctor: 'Share with Doctor',
      selectDoctor: 'Select a doctor to share your records',
      shareButton: 'Share Records',
      shareSuccess: 'Records shared successfully!',
      recordTypes: {
        all: 'All Records',
        prescription: 'Prescriptions',
        labReport: 'Lab Reports',
        discharge: 'Discharge Summary',
        consultation: 'Consultation',
      },
    },
    
    // Doctor Dashboard
    doctor: {
      title: 'Doctor Dashboard',
      subtitle: 'Monitor your patients',
      totalPatients: 'Total Patients',
      highRisk: 'High Risk',
      activeToday: 'Active Today',
      avgGlucose: 'Avg Glucose',
      filterAll: 'All Patients',
      filterHighRisk: 'High Risk Only',
      viewDetails: 'View Details',
      lastReading: 'Last Reading',
      status: {
        normal: 'Normal',
        moderate: 'Moderate',
        high: 'High Risk',
      },
    },
    
    // Navigation
    nav: {
      home: 'Home',
      scan: 'Scan',
      trend: 'Trend',
      records: 'Records',
    },
    
    // Onboarding
    onboarding: {
      welcome: 'Welcome to GlucoSage',
      subtitle: "Let's set up your experience",
      chooseLanguage: 'Choose your language',
      grantPermissions: 'Grant Permissions',
      microphoneAccess: 'Microphone Access',
      cameraAccess: 'Camera Access',
      granted: 'Granted ✓',
      grant: 'Grant Permission',
      moreLanguagesSoon: 'More languages coming soon',
      getStarted: 'Get Started',
    },
    
    // Voice Commands
    voiceCommands: {
      scanFood: 'What will my sugar be after lunch?',
      showPrediction: 'Scan my food',
      showRecords: 'Show my health records',
      logMedicine: 'Log my morning medicine',
    },
    
    // Voice Responses
    voiceResponses: {
      openingScanner: 'Opening food scanner',
      showingPredictions: 'Showing your glucose predictions',
      openingRecords: 'Opening your health records',
      iHeard: 'I heard:',
      languageChangedToHindi: 'Language changed to Hindi',
      languageChangedToEnglish: 'Language changed to English',
    },
  },
  
  hi: {
    // Common
    loading: 'लोड हो रहा है',
    error: 'त्रुटि',
    success: 'सफलता',
    cancel: 'रद्द करें',
    save: 'सहेजें',
    delete: 'हटाएं',
    edit: 'संपादित करें',
    close: 'बंद करें',
    back: 'वापस',
    next: 'आगे',
    confirm: 'पुष्टि करें',
    
    // Greetings
    goodMorning: 'सुप्रभात',
    goodAfternoon: 'शुभ दोपहर',
    goodEvening: 'शुभ संध्या',
    
    // Home Page
    home: {
      title: 'होम',
      listening: 'सुन रहा हूं...',
      tapToSpeak: 'बोलने के लिए टैप करें',
      trySaying: 'बोलने की कोशिश करें...',
      youSaid: 'आपने कहा:',
      processing: 'प्रोसेस हो रहा है...',
      sugarStableToday: 'आपकी शुगर आज स्थिर लग रही है।',
      lastReading: 'अंतिम रीडिंग:',
      hoursAgo: 'घंटे पहले',
    },
    
    // Food Scan
    foodScan: {
      title: 'अपना खाना स्कैन करें',
      subtitle: 'अपने भोजन की फोटो कैप्चर या अपलोड करें',
      positionPlate: 'अपनी प्लेट को फ्रेम में रखें',
      cameraOff: 'कैमरा बंद है',
      turnOnCamera: 'कैमरा चालू करें',
      turnOffCamera: 'कैमरा बंद करें',
      capturePhoto: 'फोटो कैप्चर करें',
      browseUpload: 'ब्राउज़ करें और फोटो अपलोड करें',
      analyzing: 'विश्लेषण हो रहा है...',
      tipsTitle: 'सर्वोत्तम परिणामों के लिए सुझाव:',
      tips: [
        'अच्छी रोशनी सुनिश्चित करें',
        'पूरी प्लेट दिखाएं',
        'खाने पर छाया से बचें',
        'या गैलरी से स्पष्ट फोटो अपलोड करें',
      ],
      result: {
        title: 'भोजन विश्लेषण परिणाम',
        detected: 'पहचाने गए खाद्य पदार्थ',
        nutrition: 'पोषण जानकारी',
        calories: 'कैलोरी',
        carbs: 'कार्ब्स',
        protein: 'प्रोटीन',
        fat: 'वसा',
        fiber: 'फाइबर',
        sugar: 'शुगर',
        sugarImpact: 'शुगर प्रभाव',
        advice: 'स्वास्थ्य सलाह',
        logMeal: 'इस भोजन को लॉग करें',
      },
    },
    
    // Prediction
    prediction: {
      title: 'ग्लूकोज भविष्यवाणी',
      subtitle: 'आज का ट्रेंड और पूर्वानुमान',
      currentReading: 'वर्तमान रीडिंग',
      peakForecast: 'चरम पूर्वानुमान',
      whatIfScenarios: '🔮 क्या होगा यदि परिदृश्य',
      whatIfSubtitle: 'देखें कि विभिन्न कार्य आपके ग्लूकोज को कैसे प्रभावित करते हैं',
      resetToDefault: 'डिफ़ॉल्ट पूर्वानुमान पर रीसेट करें',
      glucoseZones: 'ग्लूकोज ज़ोन',
      zones: {
        normal: 'सामान्य (70-140 mg/dL)',
        moderate: 'मध्यम (140-180 mg/dL)',
        high: 'उच्च (180+ mg/dL)',
      },
      scenarios: {
        sweet: 'यदि मैं कुछ मीठा खाऊं तो क्या होगा?',
        walk: 'यदि मैं 20 मिनट टहलूं तो क्या होगा?',
        skipMeal: 'यदि मैं अगला भोजन छोड़ दूं तो क्या होगा?',
        medication: 'यदि मैं अभी अपनी दवा लूं तो क्या होगा?',
      },
    },
    
    // ABHA Records
    abha: {
      title: 'ABHA स्वास्थ्य रिकॉर्ड',
      subtitle: 'आपके डिजिटल स्वास्थ्य रिकॉर्ड',
      notLinked: 'अपने स्वास्थ्य रिकॉर्ड तक पहुंचने के लिए अपने ABHA खाते को लिंक करें',
      linkAbha: 'ABHA खाता लिंक करें',
      abhaNumber: 'ABHA नंबर',
      abhaAddress: 'ABHA पता',
      voiceQuery: 'आवाज़ से पूछें',
      voiceQueryPlaceholder: 'अपने स्वास्थ्य रिकॉर्ड के बारे में पूछें...',
      searchRecords: 'रिकॉर्ड खोजें',
      shareWithDoctor: 'डॉक्टर के साथ साझा करें',
      selectDoctor: 'अपने रिकॉर्ड साझा करने के लिए एक डॉक्टर चुनें',
      shareButton: 'रिकॉर्ड साझा करें',
      shareSuccess: 'रिकॉर्ड सफलतापूर्वक साझा किए गए!',
      recordTypes: {
        all: 'सभी रिकॉर्ड',
        prescription: 'पर्चे',
        labReport: 'लैब रिपोर्ट',
        discharge: 'छुट्टी सारांश',
        consultation: 'परामर्श',
      },
    },
    
    // Doctor Dashboard
    doctor: {
      title: 'डॉक्टर डैशबोर्ड',
      subtitle: 'अपने रोगियों की निगरानी करें',
      totalPatients: 'कुल मरीज़',
      highRisk: 'उच्च जोखिम',
      activeToday: 'आज सक्रिय',
      avgGlucose: 'औसत ग्लूकोज',
      filterAll: 'सभी मरीज़',
      filterHighRisk: 'केवल उच्च जोखिम',
      viewDetails: 'विवरण देखें',
      lastReading: 'अंतिम रीडिंग',
      status: {
        normal: 'सामान्य',
        moderate: 'मध्यम',
        high: 'उच्च जोखिम',
      },
    },
    
    // Navigation
    nav: {
      home: 'होम',
      scan: 'स्कैन',
      trend: 'ट्रेंड',
      records: 'रिकॉर्ड',
    },
    
    // Onboarding
    onboarding: {
      welcome: 'GlucoSage में आपका स्वागत है',
      subtitle: 'आइए अपना अनुभव सेट करें',
      chooseLanguage: 'अपनी भाषा चुनें',
      grantPermissions: 'अनुमतियाँ दें',
      microphoneAccess: 'माइक्रोफ़ोन एक्सेस',
      cameraAccess: 'कैमरा एक्सेस',
      granted: 'प्रदान की गई ✓',
      grant: 'अनुमति दें',
      moreLanguagesSoon: 'जल्द ही और भाषाएँ आ रही हैं',
      getStarted: 'शुरू करें',
    },
    
    // Voice Commands
    voiceCommands: {
      scanFood: 'दोपहर के खाने के बाद मेरी शुगर क्या होगी?',
      showPrediction: 'मेरा खाना स्कैन करो',
      showRecords: 'मेरे स्वास्थ्य रिकॉर्ड दिखाओ',
      logMedicine: 'मेरी सुबह की दवा लॉग करो',
    },
    
    // Voice Responses
    voiceResponses: {
      openingScanner: 'खाना स्कैनर खोल रहा हूं',
      showingPredictions: 'आपकी ग्लूकोज भविष्यवाणी दिखा रहा हूं',
      openingRecords: 'आपके स्वास्थ्य रिकॉर्ड खोल रहा हूं',
      iHeard: 'मैंने सुना:',
      languageChangedToHindi: 'भाषा हिंदी में बदल गई',
      languageChangedToEnglish: 'भाषा अंग्रेजी में बदल गई',
    },
  },
};

// Helper function to get translations based on current language
export const getTranslations = (language: 'en' | 'hi'): Translations => {
  return translations[language];
};

// Helper function for greeting based on time and language
export const getGreeting = (language: 'en' | 'hi'): string => {
  const hour = new Date().getHours();
  const t = translations[language];
  
  if (hour < 12) return t.goodMorning;
  if (hour < 17) return t.goodAfternoon;
  return t.goodEvening;
};
