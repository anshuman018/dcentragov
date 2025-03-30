import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { user };
};