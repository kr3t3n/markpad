import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner'; 
import { LogIn, AlertCircle, Loader2, CheckCircle2, ArrowRight, Clock, ShieldCheck } from 'lucide-react';

export function Auth() {
  const [email, setEmail] = useState('');
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);  
  const [timeRemaining, setTimeRemaining] = useState(0);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, subscription, signInWithOtp } = useAuth();

  // Handle countdown timer
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining]);

  // Handle authenticated user redirect
  useEffect(() => {
    if (user) {
      const redirectTo = searchParams.get('redirectTo') || '/';
      if (subscription && (subscription.status === 'active' || subscription.status === 'trialing')) {
        navigate(redirectTo, { replace: true });
      } else if (redirectTo !== '/signup') {
        // Only redirect to signup if we're not already there
        navigate('/signup', { replace: true });
      }
    }
  }, [user, subscription, navigate, searchParams]);

  // Pre-fill email from URL params if present
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleMagicLink = async (emailAddress: string) => {
    setIsLoading(true);
    setError('');
    
    if (timeRemaining > 0) {
      const message = `Please wait ${timeRemaining} seconds before requesting another sign in link`;
      toast.error(message);
      setError(message);
      setIsLoading(false);
      return;
    }

    try {
      // Send sign in link and let the auth callback handle subscription check
      console.log('Sending sign in link to:', emailAddress);
      const { error: signInError } = await signInWithOtp(emailAddress);
      
      if (signInError) {
        console.error('Sign in error:', signInError);
        let errorMessage = signInError.message || 'Failed to send sign in link. Please try again.';
        
        // Make rate limit message more user-friendly
        if (errorMessage.toLowerCase().includes('rate limit')) {
          errorMessage = 'For security reasons, please wait a few minutes before requesting another sign in link.';
          setTimeRemaining(300); // 5 minutes cooldown for rate limits
        }
        
        toast.error(errorMessage);
        setError(errorMessage);
      } else {
        toast.success('Check your email for the secure sign in link!');
        setTimeRemaining(60); // Normal cooldown
        setIsExistingUser(true);
        // Add email to URL params without page reload
        navigate(`/auth?email=${encodeURIComponent(emailAddress)}`, { replace: true });
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error('An error occurred. Please try again.');
      setError('An unexpected error occurred. Please try again or contact support.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Sign in to Markpad
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Your secure gateway to better note-taking
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={(e) => {
            e.preventDefault();
            handleMagicLink(email);
          }}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading || timeRemaining > 0}
                className="flex w-full justify-center items-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Sending Link...
                  </>
                ) : timeRemaining > 0 ? (
                  <>
                    <Clock className="-ml-1 mr-2 h-4 w-4" />
                    Wait {timeRemaining}s
                  </>
                ) : isExistingUser ? (
                  <>
                    <LogIn className="-ml-1 mr-2 h-4 w-4" />
                    Send Sign In Link
                  </>
                ) : (
                  <>
                    <ArrowRight className="-ml-1 mr-2 h-4 w-4" />
                    Continue with Email
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">
                  Secure Authentication
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4">
              <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                <ShieldCheck className="h-4 w-4 text-green-500 mr-2" />
                <span>No password required</span>
              </div>
              <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                <span>Encrypted end-to-end</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}