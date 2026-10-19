import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { Role } from '../../types';

interface ProtectedRouteProps {
  /** Roles allowed to access the nested routes. Omit to allow any signed-in user. */
  roles?: Role[];
}

/** Guards nested routes: redirects guests to sign-in and wrong roles to /unauthorized. */
export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/signin" replace state={{ from: location }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
  return <Outlet />;
}

/** Keeps signed-in users away from the sign-in / sign-up pages. */
export function GuestRoute() {
  const { user } = useAuth();
  if (user) return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/'} replace />;
  return <Outlet />;
}
