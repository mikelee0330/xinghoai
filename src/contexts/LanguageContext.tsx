import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, detectBrowserLanguage } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('繁體中文');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initLanguage = async () => {
      // Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Get user's preferred language from profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('preferred_language')
          .eq('user_id', session.user.id)
          .single();
        
        if (profile?.preferred_language) {
          setLanguageState(profile.preferred_language as Language);
          setInitialized(true);
          return;
        }
      }
      
      // Check localStorage
      const savedLang = localStorage.getItem('preferredLanguage') as Language;
      if (savedLang) {
        setLanguageState(savedLang);
      } else {
        // Detect browser language
        const browserLang = detectBrowserLanguage();
        setLanguageState(browserLang);
        localStorage.setItem('preferredLanguage', browserLang);
      }
      
      setInitialized(true);
    };

    initLanguage();
  }, []);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('preferredLanguage', lang);
    
    // Update user profile if logged in
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase
        .from('profiles')
        .update({ preferred_language: lang })
        .eq('user_id', session.user.id);
    }
  };

  if (!initialized) {
    return null; // or a loading spinner
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};