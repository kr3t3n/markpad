import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { LogIn, Mail, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';

export function Auth() {
  const [email, setEmail] = useState('');
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const email = searchParams.get('email');
    if (email) {
      setEmail(email);
      handleMagicLink(email);
    }
  }, [searchParams]);

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
    const { error } = await supabase.auth.signInWithOtp({
      email: emailAddress,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });
    setIsLoading(false);
    
    if (error) {
      setError(error.message);
      return;
    }
    
    toast.success('Check your email for the magic link!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isExistingUser) {
      await handleMagicLink(email);
    } else {
      // First create a temporary user and get their ID
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password: crypto.randomUUID(), // Random password since we'll use magic links
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      
      if (!user?.id) {
        setError('Failed to create account');
        return;
      }
      
      // Redirect to Stripe with the user ID as client_reference_id
      window.location.href = `https://buy.stripe.com/test_aEUdTPbkE7AueMEbII?client_reference_id=${user.id}`;
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
                  <div className="text-red-500 text-sm">{error}</div>
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
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white rounded-lg py-3 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" size={20} />
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
              We've sent you a magic link to sign in. Click the link in your email to continue.
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