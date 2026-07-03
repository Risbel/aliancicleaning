import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/auth/use-auth';
import { useStaffProfile } from '@/hooks/queries/use-profile';

export function RequireStaff({ children }: { children: ReactNode }) {
	const { user, loading } = useAuth();
	const location = useLocation();
	const { data: staffProfile, isLoading: staffLoading } = useStaffProfile(user?.id);

	if (loading || (user && staffLoading)) {
		return <div className="flex h-screen w-screen items-center justify-center">loading...</div>;
	}

	if (!user) {
		return <Navigate to="/login" state={{ from: location.pathname }} replace />;
	}

	if (!staffProfile) {
		return <Navigate to="/" replace />;
	}

	return <>{children}</>;
}
