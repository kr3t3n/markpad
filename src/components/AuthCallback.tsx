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

        // Check for Stripe session ID first
        const sessionId = searchParams.get('session_id');
        if (sessionId) {
          console.log('Processing Stripe session callback:', sessionId);
          
          // Call your webhook or API to verify the session and get the customer email
          const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-session`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({ session_id: sessionId })
          });

          if (!response.ok) {
            throw new Error('Failed to verify payment session');
          }

          const { email } = await response.json();
          
          if (!email) {
            throw new Error('No email found in session');
          }

          // Send magic link to the customer
          const { error: signInError } = await supabase.auth.signInWithOtp({
            email,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`
            }
          });

          if (signInError) {
            console.error('Failed to send sign in link:', signInError);
            toast.error('Payment successful! However, we could not send the sign in link. Please try signing in again.');
            navigate('/auth');
            return;
          }

          toast.success('Payment successful! Please check your email to sign in.');
          navigate('/auth');
          return;
        }

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

        // If we get here with no auth parameters, log and show error
        console.error('No valid authentication parameters found');
        toast.error('Invalid authentication callback. Please try again.');
        navigate('/auth');
      } catch (error) {
        console.error('Auth callback error:', error);
        toast.error('Authentication failed. Please try again.');
        navigate('/auth');
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Loader2 className="w-8 h-8 animate-spin" />
      <p className="mt-4 text-gray-600 dark:text-gray-300">Verifying your authentication...</p>
    </div>
  );
}