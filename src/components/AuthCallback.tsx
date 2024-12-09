import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Log all search params for debugging
        console.log('Auth callback params:', Object.fromEntries(searchParams.entries()));

        // Get hash parameters if any (Supabase sometimes puts params in hash)
        const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
        console.log('Hash params:', Object.fromEntries(hashParams.entries()));

        // First check if we're already logged in
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log('User already has valid session');
          toast.success('Successfully signed in!');
          navigate('/');
          return;
        }

        const code = searchParams.get('code');
        const token = searchParams.get('token') || hashParams.get('access_token');
        const email = searchParams.get('email') || hashParams.get('email');
        const type = searchParams.get('type');
        const paymentSuccess = searchParams.get('payment_success');

        // Handle Stripe redirect first
        if (paymentSuccess === 'true' && email) {
          console.log('Processing payment success callback for:', email);
          const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`
            }
          });

          if (error) {
            console.error('Failed to send magic link after payment:', error);
            toast.error('Failed to send sign in link. Please try again.');
            navigate('/auth');
            return;
          }

          toast.success('Please check your email for the magic link to sign in.');
          navigate('/auth');
          return;
        }

        // Handle magic link code
        if (code) {
          console.log('Processing magic link callback with code');
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error('Code exchange error:', error);
            toast.error('Failed to verify magic link. Please try again.');
            navigate('/auth');
            return;
          }

          toast.success('Successfully signed in!');
          navigate('/');
          return;
        }

        // Handle legacy token if present
        if (token) {
          console.log('Processing callback with token');
          const { error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Session error:', error);
            toast.error('Failed to verify authentication. Please try again.');
            navigate('/auth');
            return;
          }

          toast.success('Successfully signed in!');
          navigate('/');
          return;
        }

        // If we get here with no auth parameters, check if we're logged in again
        const { data: { session: finalSession } } = await supabase.auth.getSession();
        if (finalSession) {
          console.log('Session exists after callback');
          toast.success('Successfully signed in!');
          navigate('/');
          return;
        }

        // Only show error if we have no session and no valid auth parameters
        console.error('Unknown callback type:', { code, token, email, type, paymentSuccess });
        toast.error('Invalid authentication callback. Please try again.');
        navigate('/auth');
      } catch (error) {
        console.error('Auth callback error:', error);
        toast.error('An error occurred during authentication. Please try again.');
        navigate('/auth');
      }
    };

    handleAuthCallback();
  }, [searchParams, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
      <p className="mt-4 text-sm text-gray-500">
        Processing authentication...
        <br />
        Please wait while we verify your credentials.
      </p>
    </div>
  );
}