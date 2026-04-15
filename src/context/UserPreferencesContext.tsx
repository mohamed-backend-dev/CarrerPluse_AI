import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export type Language = 'ar' | 'en' | 'fr' | 'de' | 'es';

interface UserPreferences {
  emailNotifications: boolean;
  aiLanguage: Language;
}

interface UserPreferencesContextType {
  preferences: UserPreferences;
  updatePreferences: (newPrefs: Partial<UserPreferences>) => Promise<void>;
  loading: boolean;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

export function UserPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>({
    emailNotifications: true,
    aiLanguage: 'ar',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPreferences() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data && !error) {
        setPreferences({
          emailNotifications: data.email_notifications,
          aiLanguage: data.ai_language as Language,
        });
      } else if (error && error.code === 'PGRST116') {
        // No preferences found, create default ones
        await supabase.from('user_preferences').insert({
          user_id: user.id,
          email_notifications: true,
          ai_language: 'ar',
        });
      }
      setLoading(false);
    }

    fetchPreferences();
  }, []);

  const updatePreferences = async (newPrefs: Partial<UserPreferences>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);

    await supabase
      .from('user_preferences')
      .update({
        email_notifications: updated.emailNotifications,
        ai_language: updated.aiLanguage,
      })
      .eq('user_id', user.id);
  };

  return (
    <UserPreferencesContext.Provider value={{ preferences, updatePreferences, loading }}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
}
