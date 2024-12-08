import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogIn, LogOut, FileText, Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export function Header() {
  const { user, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleAuth = async () => {
    if (user) {
      await signOut();
    }
    navigate('/auth');
  };

  return (
    <div className="border-b dark:border-gray-700">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img 
            src="/favicon.svg" 
            alt="Markpad Logo" 
            className="w-12 h-12 logo-image" 
          />
          <div className="flex flex-col">
            <h1 className="font-poppins text-[30px] leading-7 font-semibold">
              markpad
            </h1>
            <p className="font-poppins text-xs text-gray-600 dark:text-gray-400">
              simple and beautiful markdown editor
            </p>
          </div>
        </Link>
        
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          {user && (
            <Link
              to="/documents"
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            >
              <FileText size={18} />
              My Documents
            </Link>
          )}
          <button
            onClick={handleAuth}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            {user ? (
              <><LogOut size={18} /> Sign Out</>
            ) : (
              <><LogIn size={18} /> Sign In</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}