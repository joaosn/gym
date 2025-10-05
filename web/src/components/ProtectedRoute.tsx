import { Navigate, Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { User } from '@/types';

interface ProtectedRouteProps {
  allowedRoles: string[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ['currentUser'],
    queryFn: authService.getCurrentUser,
    enabled: authService.isAuthenticated(),
    retry: false,
  });

  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dashboard-bg flex items-center justify-center">
        <div className="text-dashboard-fg">Carregando...</div>
      </div>
    );
  }

  if (error || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}