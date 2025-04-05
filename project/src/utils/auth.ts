import { supabase } from '../lib/supabase';

export const checkAuth = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    throw new Error('Authentication error');
  }
  
  if (!session) {
    throw new Error('No active session');
  }
  
  return session.user;
};