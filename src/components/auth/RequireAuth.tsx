import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/auth/use-auth';
import { PageSpinner } from '@/components/PageSpinner';

export function RequireAuth({ children }: { children: ReactNode }) {
	const { user, loading } = useAuth();
	const location = useLocation();

	if (loading) return <PageSpinner />;

	if (!user) {
		return <Navigate to="/login" state={{ from: location.pathname }} replace />;
	}

	return <>{children}</>;
}
