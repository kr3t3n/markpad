import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useSubscription } from '../hooks/useSubscription';
import { Spinner } from './ui/spinner';

interface RequireSubscriptionProps {
  children: ReactNode;
}

export function RequireSubscription({ children }: RequireSubscriptionProps) {
  const { isActive, loading } = useSubscription();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isActive) {
    return <Navigate to="/pricing" replace />;
  }

  return <>{children}</>;
}
