import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { LogIn, AlertCircle, Loader2, CheckCircle2, ArrowRight, Clock, Mail } from 'lucide-react';

export function Auth() {
  const [email, setEmail] = useState('');
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);  
  const [timeRemaining, setTimeRemaining] = useState(0);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining]);

  useEffect(() => {
    if (sessionId) {
      handleStripeSuccess();
    }
  }, [sessionId]);

  const handleStripeSuccess = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Get session from Stripe
      const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to verify payment');
      }
      
      const session = await response.json();
      const customerEmail = session.customer_details?.email;
      
      if (customerEmail) {
        setEmail(customerEmail);
        await handleMagicLink(customerEmail);
      }
    } catch (err) {
      console.error('Stripe verification error:', err);
      setError('Failed to verify payment. Please contact support.');
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleMagicLink = async (emailAddress: string) => {
    setIsLoading(true);
    setError('');
    
    const redirectTo = `https://markpad.online/auth/callback`;
    
    const { error } = await supabase.auth.signInWithOtp({
      email: emailAddress,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          email: emailAddress
        }
      }
    });
    setIsLoading(false);
    
    if (error) {
      if (error.message.toLowerCase().includes('rate limit')) {
        setTimeRemaining(60);
        setError('Please wait a minute before requesting another link.');
      } else {
        setError(error.message);
      }
      return;
    }
    
    toast.success('Check your email for the magic link!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setError('');
    
    if (isExistingUser) {
      await handleMagicLink(email);
    } else {
      setIsLoading(true);
      try {
        // Redirect to Stripe with prefilled email
        window.location.href = `https://buy.stripe.com/test_aEUdTPbkE7AueMEbII?prefilled_email=${encodeURIComponent(email)}&success_url=${encodeURIComponent('https://markpad.online/auth')}`;
      } catch (err) {
        console.error('Signup error:', err);
        setError('An unexpected error occurred. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
  };

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
                    ) : (
                      <AlertCircle size={16} className="flex-shrink-0" />
                    )}
                    <span>{error}</span>
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
              We've sent a magic link to <strong>{email}</strong>. Click the link in your email to continue.
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