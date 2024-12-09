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

      if (token && type === 'recovery' && email) {
        await supabase.auth.verifyOtp({
          token,
          type: 'recovery',
          email
        });
        navigate('/');
      }

      if (token && type === 'signup' && email) {
        await supabase.auth.verifyOtp({
          token,
          type: 'signup',
          email
        });
        navigate('/auth');
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