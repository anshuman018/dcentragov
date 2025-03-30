import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useUser } from '../hooks/useUser';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useUser();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <header className="bg-gradient-to-r from-orange-600 to-red-700 text-white shadow-lg">
      <nav className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold">सहज सरकार</span>
              <span className="ml-2 text-sm">DecentraGov</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink href="#services">सेवाएं / Services</NavLink>
            <NavLink href="#track">ट्रैक / Track</NavLink>
            <NavLink href="#support">सहायता / Support</NavLink>
            {user ? (
              <>
                <Link 
                  to="/dashboard"
                  className="text-white hover:text-orange-200 transition-colors font-medium"
                >
                  डैशबोर्ड / Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  className="bg-white text-red-700 px-4 py-2 rounded-lg font-semibold hover:bg-red-50 transition-colors"
                >
                  लॉगआउट / Logout
                </button>
              </>
            ) : (
              <Link 
                to="/login"
                className="bg-white text-red-700 px-4 py-2 rounded-lg font-semibold hover:bg-red-50 transition-colors"
              >
                लॉगिन / Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <div className="flex flex-col space-y-4">
              <MobileNavLink href="#services">सेवाएं / Services</MobileNavLink>
              <MobileNavLink href="#track">ट्रैक / Track</MobileNavLink>
              <MobileNavLink href="#support">सहायता / Support</MobileNavLink>
              <Link 
                to="/login"
                className="bg-white text-red-700 px-4 py-2 rounded-lg font-semibold w-full text-center"
              >
                लॉगिन / Login
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a 
    href={href}
    className="hover:text-orange-200 transition-colors font-medium"
  >
    {children}
  </a>
);

const MobileNavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a 
    href={href}
    className="text-white hover:text-orange-200 transition-colors block py-2 text-center"
  >
    {children}
  </a>
);

export default Header;