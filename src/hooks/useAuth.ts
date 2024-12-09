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

  const checkUserExists = async (email: string) => {
    try {
      const normalizedEmail = email.toLowerCase();
      console.log('Checking subscription status for:', normalizedEmail);

      // Check profile and subscription status
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_status, subscription_end_date, email')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (profileError) {
        console.error('Profile check error:', profileError);
        return false;
      }

      // Case 4: No profile at all
      if (!profile) {
        console.log('No profile found for email:', normalizedEmail);
        return false;
      }

      // Case 2 & 3: Has profile but inactive subscription
      if (profile.subscription_status !== 'active') {
        console.log('Subscription not active:', {
          email: normalizedEmail,
          status: profile.subscription_status
        });
        return false;
      }

      // Case 1: Check if subscription is active and not expired
      const endDate = profile.subscription_end_date ? new Date(profile.subscription_end_date) : null;
      const isExpired = endDate ? endDate < new Date() : true;

      console.log('Subscription check:', {
        email: normalizedEmail,
        status: profile.subscription_status,
        endDate,
        isExpired
      });

      // Only return true if subscription is active and not expired
      return !isExpired;
    } catch (error) {
      console.error('Error checking subscription status:', error);
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