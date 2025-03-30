import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { BusinessInfo } from '../types/business';

export const useBusinessInfo = () => {
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusinessInfo = async () => {
      try {
        const { data, error } = await supabase
          .from('business_info')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setBusinessInfo(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessInfo();
  }, []);

  return { businessInfo, loading, error };
};