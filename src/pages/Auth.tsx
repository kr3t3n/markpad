import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { LogIn, UserPlus, Loader2 } from 'lucide-react';

export function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const { signIn, signUp, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'recovery') {
      // Handle password reset
      toast.info('Please enter your new password');
    } else if (type === 'signup') {
      toast.success('Email verified successfully! Please sign in.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isSignUp) {
      const { error: signUpError } = await signUp(email, password);
      if (signUpError) {
        setError(signUpError.message);
      } else {
        toast.success('Please check your email to confirm your account');
        setIsSignUp(false);
      }
    } else {
      const { error: signInError } = await signIn(email, password);
      if (signInError) {
        setError(signInError.message);
      } else {
        navigate('/');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8"> 
      <div className="max-w-md mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-semibold mb-6">
          {isSignUp ? 'Create an Account' : 'Sign In'}
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border dark:border-gray-700 dark:bg-gray-800 p-2"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border dark:border-gray-700 dark:bg-gray-800 p-2"
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            {isSignUp ? <UserPlus size={20} /> : <LogIn size={20} />}
            {isLoading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>

          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </form>
      </div>
      </div>
    </div>
  );
}