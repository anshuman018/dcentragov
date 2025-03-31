import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { BlockchainService } from '../../blockchain/services/BlockchainService';
import TurnstileWidget from './Turnstile';
import { AuthError, User } from '@supabase/supabase-js';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleTurnstileVerify = (token: string) => {
    setTurnstileToken(token);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!turnstileToken) {
        throw new Error('कृपया मानव सत्यापन पूरा करें / Please complete human verification');
      }

      const verificationResponse = await fetch('/.netlify/functions/verify-turnstile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: turnstileToken })
      });

      if (!verificationResponse.ok) {
        throw new Error('Human verification failed');
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error('Registration failed');

      const blockchain = BlockchainService.getInstance();
      const { publicKey, privateKey } = await blockchain.createIdentity(data.user.id);

      await supabase.auth.updateUser({
        data: { blockchain_public_key: publicKey }
      });

      console.log('Your private key:', privateKey);

      navigate('/login');
    } catch (err) {
      setError(err instanceof AuthError ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            रजिस्टर करें
            <span className="block text-xl text-gray-600 mt-1">Create new account</span>
          </h2>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
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

          <TurnstileWidget onVerify={handleTurnstileVerify} />

          <button
            type="submit"
            disabled={loading || !turnstileToken}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-orange-600 to-red-700 hover:from-orange-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
          >
            {loading ? 'रजिस्टर हो रहा है... / Registering...' : 'रजिस्टर / Register'}
          </button>
        </form>

        <div className="text-center">
          <Link to="/login" className="text-orange-600 hover:text-orange-700">
            पहले से अकाउंट है? लॉगिन करें / Already have an account? Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;