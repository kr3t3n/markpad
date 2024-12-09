import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import type { User } from '@supabase/supabase-js';

export type SubscriptionStatus = 'trialing' | 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'unpaid';

interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  status: SubscriptionStatus;
  price_id: string;
  quantity: number;
  cancel_at_period_end: boolean;
  cancel_at: string | null;
  canceled_at: string | null;
  current_period_start: string;
  current_period_end: string;
  trial_start: string | null;
  trial_end: string | null;
  ended_at: string | null;
}

export function useAuth() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchSubscription(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('Auth state changed:', { event: _event, session });
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchSubscription(session.user.id);
      } else {
        setSubscription(null);
      }
    });

    return () => authSubscription.unsubscribe();
  }, []);

  const fetchSubscription = async (userId: string) => {
    console.log('Fetching subscription for user:', userId);
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching subscription:', error);
      return;
    }

    console.log('Subscription data:', data);
    setSubscription(data);
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password: password || Math.random().toString(36).slice(-12),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });
    return { error };
  };

  const signInWithOtp = async (email: string): Promise<{ error: Error | null }> => {
    try {
      console.log('Attempting to sign in with OTP:', email);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        console.error('OTP sign in error:', error);
        
        // Handle rate limit errors specifically
        if (error.message?.toLowerCase().includes('rate limit')) {
          return { 
            error: new Error(
              'Too many sign in attempts. Please wait a few minutes before trying again. ' +
              'Note: You can only request 4 magic links per hour.'
            ) 
          };
        }
        
        return { error };
      }

      console.log('OTP email sent successfully');
      return { error: null };
    } catch (error) {
      console.error('Unexpected error during OTP sign in:', error);
      return { error: error as Error };
    }
  };

  const checkSubscription = async () => {
    if (!user) return false;

    // Fetch latest subscription status
    await fetchSubscription(user.id);

    if (!subscription) return false;

    // Check if subscription is active or trialing
    if (subscription.status !== 'active' && subscription.status !== 'trialing') {
      return false;
    }

    // Check if subscription has ended
    if (subscription.ended_at) {
      const endDate = new Date(subscription.ended_at);
      if (endDate <= new Date()) {
        return false;
      }
    }

    // Check if subscription period has ended
    const periodEnd = new Date(subscription.current_period_end);
    if (periodEnd <= new Date()) {
      return false;
    }

    return true;
  };

  const signOut = async () => {
    try {
      console.log('Signing out...');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      console.log('Successfully signed out');
      setUser(null);
      setSubscription(null);
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out. Please try again.');
    }
  };

  return {
    user,
    loading,
    subscription,
    signIn,
    signUp,
    signOut,
    signInWithOtp,
    checkSubscription,
  };
}