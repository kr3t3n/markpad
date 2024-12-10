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
        // Get the raw URL for debugging
        console.log('Full URL:', window.location.href);
        console.log('Search params:', searchParams.toString());
        console.log('Hash:', window.location.hash);

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

        // Handle magic link code
        const code = searchParams.get('code');
        if (code) {
          console.log('Processing magic link callback with code');
          
          try {
            // Exchange code for session
            console.log('Exchanging code for session...');
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            console.log('Exchange result:', { data, error });
            
            if (error) {
              console.error('Code exchange error:', error);
              toast.error('Failed to verify magic link. Please try again.');
              navigate('/auth');
              return;
            }

            if (!data.session) {
              console.error('No session after code exchange');
              toast.error('Failed to create session. Please try again.');
              navigate('/auth');
              return;
            }

            console.log('Got session, user:', { 
              id: data.session.user.id,
              email: data.session.user.email,
              lastSignIn: data.session.user.last_sign_in_at
            });

            // First check profile status
            console.log('Checking profile status...');
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.session.user.id)
              .single();

            console.log('Profile check result:', { profile, error: profileError });

            if (profileError) {
              console.log('Creating new profile...');
              const { error: insertError } = await supabase
                .from('profiles')
                .insert([
                  { 
                    id: data.session.user.id,
                    email: data.session.user.email,
                    subscription_status: 'pending'
                  }
                ]);
              
              if (insertError) {
                console.error('Error creating profile:', insertError);
                toast.error('Error creating user profile. Please try again.');
                await supabase.auth.signOut();
                navigate('/auth');
                return;
              }
            }

            if (profile?.subscription_status === 'active' || profile?.subscription_status === 'trialing') {
              console.log('Found active subscription in profile');
              toast.success('Successfully signed in!');
              navigate('/documents', { replace: true });
              return;
            }

            // If no active profile subscription, check subscriptions table
            console.log('Checking subscriptions table...');
            const { data: subscription, error: subError } = await supabase
              .from('subscriptions')
              .select('*')
              .eq('user_id', data.session.user.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();

            console.log('Subscription check result:', { subscription, error: subError });

            if (subError) {
              console.error('Error fetching subscription:', subError);
              toast.error('Error verifying subscription. Please try again.');
              await supabase.auth.signOut();
              navigate('/auth', { replace: true });
              return;
            }

            if (!subscription || (subscription.status !== 'active' && subscription.status !== 'trialing')) {
              console.log('No active subscription, redirecting to signup');
              toast.info('Please choose a subscription plan to continue.');
              navigate('/signup', { replace: true });
              return;
            }

            // Update profile with subscription status
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ subscription_status: subscription.status })
              .eq('id', data.session.user.id);

            if (updateError) {
              console.error('Error updating profile:', updateError);
            }

            console.log('Found active subscription, redirecting to documents');
            toast.success('Successfully signed in!');
            navigate('/documents', { replace: true });
          } catch (error) {
            console.error('Unexpected error in auth callback:', error);
            toast.error('An unexpected error occurred. Please try again.');
            navigate('/auth');
          }
          return;
        }

        // If we get here with no valid parameters, show error
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