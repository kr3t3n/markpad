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
  const { user, checkUserExists, signInWithOtp } = useAuth();

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
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

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
      console.log('Checking subscription for:', emailAddress);
      const exists = await checkUserExists(emailAddress);

      if (!exists) {
        // For new users, redirect to signup
        console.log('New user, redirecting to signup');
        setIsLoading(false);
        toast.info('Get started with Markpad Premium to access all features');
        navigate('/signup', { 
          replace: true,
          state: { email: emailAddress }
        });
        return;
      }

      // User exists and has active subscription, send sign in link
      console.log('User has active subscription, sending sign in link');
      setIsExistingUser(true);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    await handleMagicLink(email);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <Loader2 className="animate-spin mx-auto" size={24} />
          <p className="mt-4 text-gray-600 dark:text-gray-300">Checking your account...</p>
        </div>
      </div>
    );
  }

  // Early return if loading
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <Loader2 className="animate-spin mx-auto" size={24} />
          <p className="mt-4 text-gray-600 dark:text-gray-300">Checking your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8"> 
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        {!searchParams.get('email') ? (
          <div className="space-y-6">
            <div className="flex gap-4 border-b dark:border-gray-700">
              <button
                onClick={() => setIsExistingUser(false)}
                className={`pb-2 px-1 -mb-px ${!isExistingUser ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
              >
                New User
              </button>
              <button
                onClick={() => setIsExistingUser(true)}
                className={`pb-2 px-1 -mb-px ${isExistingUser ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
              >
                Already Premium
              </button>
            </div>

            <h1 className="text-2xl font-semibold">
              {isExistingUser ? 'Welcome Back!' : 'Premium Access'}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {!isExistingUser && (
                <p className="text-gray-600 dark:text-gray-300">
                  Unlock all premium features and take your markdown editing to the next level.
                </p>
              )}
              
              <div className="space-y-4">
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
                    placeholder={isExistingUser ? "Enter your premium account email" : "Enter your email"}
                    required
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 dark:bg-red-950/50 p-4 rounded-lg">
                    {timeRemaining > 0 ? (
                      <Clock size={16} className="flex-shrink-0 animate-pulse" />
                    ) : error.includes('No active premium subscription') ? (
                      <ShieldCheck size={16} className="flex-shrink-0" />
                    ) : (
                      <AlertCircle size={16} className="flex-shrink-0" />
                    )}
                    <span>{error}</span>
                    {error.includes('No active premium subscription') && (
                      <button
                        onClick={() => {
                          setIsExistingUser(false);
                          setError('');
                        }}
                        className="ml-auto text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline text-xs"
                      >
                        Switch to New User
                      </button>
                    )}
                  </div>
                )}

                {!isExistingUser && (<div className="space-y-2">
                  <h2 className="text-lg font-semibold">What you'll get:</h2>
                  <ul className="space-y-2">
                    {[
                      'Cloud synchronization across devices',
                      'Multiple document management',
                      'Secure document storage',
                      'Real-time autosave',
                      'Document organization',
                      'Priority support'
                    ].map(feature => (
                      <li key={feature} className="flex items-center gap-2">
                        <CheckCircle2 className="text-green-500 flex-shrink-0" size={18} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>)}

                <button
                  type="submit"
                  disabled={isLoading || timeRemaining > 0}
                  className="w-full bg-blue-600 text-white rounded-lg py-3 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : timeRemaining > 0 ? (
                    <>
                      <Clock size={20} className="animate-pulse" />
                      Wait {timeRemaining}s
                    </>
                  ) : isExistingUser ? (
                    <>
                      <LogIn size={20} />
                      Sign In
                    </>
                  ) : (
                    <>
                      <ArrowRight size={20} />
                      Continue to Payment
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-4">Check Your Email</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We've sent a secure sign in link to <strong>{email}</strong>. Click the link in your email to continue.
            </p>
            {isLoading && (
              <Loader2 className="animate-spin mx-auto" size={24} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}