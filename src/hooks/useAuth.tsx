import React, { useState, useEffect, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
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

interface AuthContextType {
  user: User | null;
  loading: boolean;
  subscription: Subscription | null;
  signInWithOtp: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  const checkSubscriptionAndSetUser = async (session: any) => {
    if (!session?.user) {
      setUser(null);
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      // Check profile first
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_status')
        .eq('email', session.user.email)
        .single();

      if (profile?.subscription_status === 'active' || profile?.subscription_status === 'trialing') {
        setUser(session.user);
        setLoading(false);
        return;
      }

      // Then check subscriptions table
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (subError) {
        console.error('Error fetching subscription:', subError);
        await supabase.auth.signOut();
        setUser(null);
        setSubscription(null);
        setLoading(false);
        return;
      }

      if (!subscription || (subscription.status !== 'active' && subscription.status !== 'trialing')) {
        console.log('No active subscription found, signing out');
        await supabase.auth.signOut();
        setUser(null);
        setSubscription(null);
      } else {
        setUser(session.user);
        setSubscription(subscription);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      await supabase.auth.signOut();
      setUser(null);
      setSubscription(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      checkSubscriptionAndSetUser(session);
    });

    // Listen for auth changes
    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('Auth state changed:', { event: _event, session });
      await checkSubscriptionAndSetUser(session);
    });

    return () => {
      authSubscription.unsubscribe();
    };
  }, []);

  const signInWithOtp = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          shouldCreateUser: true
        },
      });

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error signing out');
    }
  };

  const value = {
    user,
    loading,
    subscription,
    signInWithOtp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}