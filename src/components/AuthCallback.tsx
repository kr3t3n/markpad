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
        const token = searchParams.get('token');
        const type = searchParams.get('type');
        const paymentSuccess = searchParams.get('payment_success');
        const email = searchParams.get('email');

        if (paymentSuccess === 'true' && email) {
          await supabase.auth.signInWithOtp({
            email,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`
            }
          });
          toast.success('Please check your email for the magic link to sign in.');
          navigate('/auth');
          return;
        }

        // Handle magic link verification
        if (token && type === 'magiclink' && email) {
          const { error } = await supabase.auth.verifyOtp({
            token,
            type: 'magiclink',
            email
          });
          
          if (error) {
            console.error('Magic link verification error:', error);
            toast.error('Failed to verify magic link. Please try again.');
            navigate('/auth');
            return;
          }

          toast.success('Successfully signed in!');
          navigate('/');
          return;
        }

        if (token && type === 'recovery' && email) {
          const { error } = await supabase.auth.verifyOtp({
            token,
            type: 'recovery',
            email
          });

          if (error) {
            console.error('Recovery verification error:', error);
            toast.error('Failed to verify recovery link. Please try again.');
            navigate('/auth');
            return;
          }

          navigate('/');
          return;
        }

        if (token && type === 'signup' && email) {
          const { error } = await supabase.auth.verifyOtp({
            token,
            type: 'signup',
            email
          });

          if (error) {
            console.error('Signup verification error:', error);
            toast.error('Failed to verify signup. Please try again.');
            navigate('/auth');
            return;
          }

          navigate('/auth');
          return;
        }

        // If we get here, we don't recognize the callback type
        console.error('Unknown callback type:', { token, type, email });
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