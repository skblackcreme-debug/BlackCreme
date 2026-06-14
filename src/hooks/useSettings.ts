import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export type PaymentMethod = 'whatsapp' | 'stripe';

export type ThemeKey =
  | 'default'
  | 'raya'
  | 'raya-haji'
  | 'maulidur-rasul'
  | 'cny'
  | 'dragon-boat'
  | 'mid-autumn'
  | 'deepavali'
  | 'thaipusam'
  | 'merdeka'
  | 'malaysia-day'
  | 'new-year'
  | 'valentines'
  | 'mothers-day'
  | 'wesak'
  | 'fathers-day'
  | 'christmas';

export interface SiteSettings {
  payment_method: PaymentMethod;
  login_enabled: boolean;
  signup_enabled: boolean;
  whatsapp_quick_order: boolean;
  active_theme: ThemeKey;
}

const DEFAULTS: SiteSettings = {
  payment_method: 'whatsapp',
  login_enabled: true,
  signup_enabled: true,
  whatsapp_quick_order: false,
  active_theme: 'default',
};

export function useSettings(): { settings: SiteSettings; loading: boolean } {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('site_settings').select('key, value').then(({ data }) => {
      if (data) {
        const map: Record<string, string> = {};
        data.forEach(({ key, value }: { key: string; value: string }) => { map[key] = value; });
        setSettings({
          payment_method: (map.payment_method as PaymentMethod) ?? DEFAULTS.payment_method,
          login_enabled: map.login_enabled !== 'false',
          signup_enabled: map.signup_enabled !== 'false',
          whatsapp_quick_order: map.whatsapp_quick_order === 'true',
          active_theme: (map.active_theme as ThemeKey) ?? DEFAULTS.active_theme,
        });
      }
      setLoading(false);
    });
  }, []);

  return { settings, loading };
}
