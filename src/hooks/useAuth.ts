import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

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
        return { error };
      }

      console.log('OTP email sent successfully');
      return { error: null };
    } catch (error) {
      console.error('Unexpected error during OTP sign in:', error);
      return { error: error as Error };
    }
  };

  const checkUserExists = async (email: string) => {
    try {
      // First check if the user exists and has an active subscription
      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_status')
        .eq('email', email.toLowerCase())
        .maybeSingle();

      if (error) {
        console.error('Database error:', error);
        return false;
      }

      if (!data) {
        console.log('No profile found for email:', email);
        return false;
      }

      // Check if subscription is active
      const isActive = data.subscription_status === 'active';
      
      if (!isActive) {
        console.log('Subscription not active for email:', email);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking user subscription:', error);
      return false;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/auth/callback'
    });
    return { error };
  };

  const checkSubscription = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status')
      .eq('id', user.id)
      .single();

    return profile?.subscription_status === 'active';
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signInWithOtp,
    signOut,
    resetPassword,
    checkSubscription,
    checkUserExists,
    isLoading: loading
  };
}