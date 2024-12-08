import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { LogIn, UserPlus, Loader2, KeyRound, ExternalLink } from 'lucide-react';

export function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [error, setError] = useState('');
  const { signIn, signUp, resetPassword, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleAuthRedirect = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        toast.success('Successfully authenticated!');
        navigate('/', { replace: true });
      }
    }

    handleAuthRedirect();
  }, [navigate, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (isForgotPassword) {
      if (searchParams.get('type') === 'recovery') {
        // Handle password reset
        const { error: resetError } = await supabase.auth.updateUser({ password });
        if (resetError) {
          setError(resetError.message);
        } else {
          toast.success('Password updated successfully');
          navigate('/auth');
          setIsForgotPassword(false);
        }
      } else {
        // Send reset password email
        const { error: resetError } = await resetPassword(email);
        if (resetError) {
          setError(resetError.message);
        } else {
          toast.success('Check your email for the password reset link');
          setIsForgotPassword(false);
        }
      }
      return;
    }

    if (isSignUp) {
      const { error: signUpError } = await signUp(email, password);
      if (signUpError) {
        setError(signUpError.message);
      } else if (!searchParams.get('purchased')) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          window.location.href = `https://buy.stripe.com/test_aEUdTPbkE7AueMEbII?client_reference_id=${user.id}`;
        } else {
          setError('Failed to get user information');
        }
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
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-semibold mb-6">
          {isForgotPassword 
            ? (searchParams.get('type') === 'recovery' ? 'Reset Password' : 'Forgot Password')
            : (isSignUp ? 'Create an Account' : 'Sign In')}
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {(!isForgotPassword || searchParams.get('type') !== 'recovery') && (
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
          )}

          {(!isForgotPassword || searchParams.get('type') === 'recovery') && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                {isForgotPassword ? 'New Password' : 'Password'}
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
          )}

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          {isSignUp && !searchParams.get('purchased') && (
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              After signing up, you'll be redirected to complete your purchase.
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            {isForgotPassword ? <KeyRound size={20} /> : (isSignUp ? <UserPlus size={20} /> : <LogIn size={20} />)}
            {isLoading ? 'Loading...' : (
              isForgotPassword 
                ? (searchParams.get('type') === 'recovery' ? 'Reset Password' : 'Send Reset Link')
                : (isSignUp ? 'Sign Up' : 'Sign In')
            )}
          </button>

          <div className="flex flex-col gap-2">
            {!isForgotPassword && (
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="w-full text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            )}
            
            {!isSignUp && !isForgotPassword && (
              <button
                type="button"
                onClick={() => setIsForgotPassword(true)}
                className="w-full text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Forgot your password?
              </button>
            )}
            
            {isForgotPassword && (
              <button
                type="button"
                onClick={() => setIsForgotPassword(false)}
                className="w-full text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Back to sign in
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}