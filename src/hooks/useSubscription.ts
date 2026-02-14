import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export type SubscriptionStatus = 'active' | 'inactive' | 'past_due' | 'canceled';

export function useSubscription() {
  const [status, setStatus] = useState<SubscriptionStatus>('inactive');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const checkSubscriptionStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setStatus('inactive');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status, subscription_end_date')
      .eq('id', user.id)
      .single();

    if (!profile) {
      setStatus('inactive');
      return;
    }

    // Check if subscription has expired
    const endDate = profile.subscription_end_date ? new Date(profile.subscription_end_date) : null;
    const hasExpired = endDate && endDate < new Date();

    if (hasExpired && profile.subscription_status === 'active') {
      // Update the subscription status in Supabase
      await supabase
        .from('profiles')
        .update({ subscription_status: 'inactive' })
        .eq('id', user.id);
      
      setStatus('inactive');
      toast.error('Your subscription has expired. Please renew to continue accessing premium features.');
      navigate('/pricing');
    } else {
      setStatus(profile.subscription_status as SubscriptionStatus);
    }
  };

  useEffect(() => {
    checkSubscriptionStatus();
    
    // Check subscription status every hour
    const interval = setInterval(checkSubscriptionStatus, 60 * 60 * 1000);

    // Subscribe to realtime changes on the profiles table
    const subscription = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${supabase.auth.getUser().then(({ data }) => data.user?.id)}`
        },
        (payload) => {
          const newStatus = payload.new.subscription_status as SubscriptionStatus;
          setStatus(newStatus);
          
          if (newStatus === 'inactive' || newStatus === 'canceled') {
            toast.error('Your subscription is no longer active. Please renew to continue accessing premium features.');
            navigate('/pricing');
          }
        }
      )
      .subscribe();

    setLoading(false);

    return () => {
      clearInterval(interval);
      subscription.unsubscribe();
    };
  }, [navigate]);

  return {
    status,
    loading,
    isActive: status === 'active',
    checkStatus: checkSubscriptionStatus
  };
}
