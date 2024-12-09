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
      const code = searchParams.get('code');
      const type = searchParams.get('type');
      
      if (code) {
        // Handle OAuth or magic link
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error || !data?.session?.user) {
          console.error('Session error:', error);
          toast.error('Authentication failed');
          navigate('/auth');
          return;
        }
        
        // Get user's profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_status')
          .eq('user_id', data.session.user.id)
          .single();
          
        if (!profile || profile.subscription_status !== 'active') {
          console.error('No active subscription:', profile);
          toast.error('No active subscription found');
          await supabase.auth.signOut();
          navigate('/auth');
          return;
        }
        
        toast.success('Successfully authenticated!');
        navigate('/');
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
            token,
            type: 'recovery'
          });
          if (error) throw error;
          
          navigate('/auth');
        } else if (type === 'signup') {
          // Handle email verification
          const { error } = await supabase.auth.verifyOtp({
            token,
            type: 'signup'
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