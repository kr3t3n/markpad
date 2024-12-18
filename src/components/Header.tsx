import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogIn, Save, Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export function Header() {
  const { user, loading, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="border-b dark:border-gray-700">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img 
            src="/favicon.svg" 
            alt="Markpad Logo" 
            className="w-16 h-16 sm:w-12 sm:h-12 logo-image" 
          />
          <div className="flex flex-col">
            <h1 className="font-poppins text-[28px] leading-7 sm:leading-8 font-semibold">
              markpad
            </h1>
            <p className="font-poppins text-xs text-gray-600 dark:text-gray-400 leading-3 sm:leading-4 mt-1 sm:mt-0">
              simple and beautiful markdown editor
            </p>
          </div>
        </Link>
        
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 ml-4 sm:ml-0 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {!loading && (
            <>
              {user ? (
                <>
                  <Link
                    to="/documents"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Save size={18} />
                    My Documents
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <LogIn size={18} className="rotate-180" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/signup')}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    <Save size={18} />
                    <span className="hidden sm:inline">Save & Manage</span>
                  </button>
                  <button
                    onClick={() => navigate('/auth')}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <LogIn size={18} />
                    <span className="hidden sm:inline">Sign In</span>
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}