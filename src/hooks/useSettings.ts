import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export type PaymentMethod = 'whatsapp' | 'stripe';

export interface SiteSettings {
  payment_method: PaymentMethod;
  login_enabled: boolean;
}

const DEFAULTS: SiteSettings = {
  payment_method: 'whatsapp',
  login_enabled: true,
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
        });
      }
      setLoading(false);
    });
  }, []);

  return { settings, loading };
}
