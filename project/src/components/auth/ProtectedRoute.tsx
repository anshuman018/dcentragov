import { Navigate } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';
import { ReactNode } from 'react';

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
};