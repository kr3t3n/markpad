import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSubscription?: boolean;
}

export function ProtectedRoute({ children, requireSubscription = false }: ProtectedRouteProps) {
  const { user, loading, subscription } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (requireSubscription && (!subscription || (subscription.status !== 'active' && subscription.status !== 'trialing'))) {
    return <Navigate to="/signup" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
