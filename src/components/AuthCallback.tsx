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
      const token = searchParams.get('token');
      const type = searchParams.get('type');
      const sessionId = searchParams.get('session_id');
      
      if (sessionId) {
        // Handle Stripe success
        const response = await fetch('/.netlify/functions/verify-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId })
        });

        if (!response.ok) {
          console.error('Session verification failed:', await response.text());
          console.error('Session verification failed');
          toast.error('Payment verification failed');
          navigate('/auth');
          return;
        }

        const { email } = await response.json();
        if (!email) {
          toast.error('Could not verify payment details');
          navigate('/auth');
          return;
        }

        // Send magic link to confirmed email
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
        });

        if (error) {
          console.error('Magic link error:', error);
          toast.error('Failed to send login link');
          navigate('/auth');
          return;
        }

        toast.success('Check your email for the login link!');
        navigate('/auth', { 
          state: { email, message: 'Check your email for the login link!' }
        });
        return;
      }
      
      if (!token || !type) {
        navigate('/');
        return;
      }

      try {
        if (type === 'recovery') {
          // Handle password reset
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'recovery'
          });
          if (error) throw error;
          
          navigate('/auth');
        } else if (type === 'signup') {
          // Handle email verification
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'signup',
          });
          if (error) throw error;
          
          navigate('/auth');
        }
      } catch (error) {
        console.error('Error processing auth callback:', error);
        toast.error('Authentication failed');
        navigate('/auth?error=true');
      }
    };

    handleAuthCallback();
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="w-8 h-8 mb-4 mx-auto animate-spin text-blue-600" />
        <h2 className="text-xl font-semibold mb-2">Processing authentication...</h2>
        <p className="text-gray-600 dark:text-gray-400">Please wait while we verify your credentials.</p>
      </div>
    </div>
  );
}