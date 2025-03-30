import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        if (signInError.message === 'Invalid login credentials') {
          throw new Error('ईमेल या पासवर्ड गलत है। कृपया पुनः प्रयास करें। / Invalid email or password. Please try again.');
        }
        throw signInError;
      }

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            लॉगिन करें
            <span className="block text-xl text-gray-600 mt-1">Login to your account</span>
          </h2>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                ईमेल / Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                पासवर्ड / Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-orange-600 to-red-700 hover:from-orange-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
          >
            {loading ? 'लॉगिन हो रहा है... / Logging in...' : 'लॉगिन / Login'}
          </button>
        </form>

        <div className="text-center">
          <Link to="/register" className="text-orange-600 hover:text-orange-700">
            नया अकाउंट बनाएं / Create new account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;