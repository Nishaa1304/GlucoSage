export const formatDate = (dateString: string, language: 'en' | 'hi' = 'en'): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  const locale = language === 'hi' ? 'hi-IN' : 'en-IN';
  return date.toLocaleDateString(locale, options);
};

export const formatTime = (dateString: string, language: 'en' | 'hi' = 'en'): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
  };
  const locale = language === 'hi' ? 'hi-IN' : 'en-IN';
  return date.toLocaleTimeString(locale, options);
};

export const formatGlucoseValue = (value: number): string => {
  return `${value} mg/dL`;
};

export const getGreeting = (language: 'en' | 'hi' = 'en'): string => {
  const hour = new Date().getHours();
  
  if (language === 'hi') {
    if (hour < 12) return 'सुप्रभात';
    if (hour < 17) return 'शुभ दोपहर';
    return 'शुभ संध्या';
  }
  
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

export const getTimeOfDay = (): 'morning' | 'afternoon' | 'evening' | 'night' => {
  const hour = new Date().getHours();
  
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  if (hour < 21) return 'evening';
  return 'night';
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const capitalizeFirst = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};
