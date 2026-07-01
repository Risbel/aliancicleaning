import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth/use-auth';

export function useGoToBooking() {
	const { user } = useAuth();
	const navigate = useNavigate();

	return function goToBooking(planId?: string) {
		const target = planId ? `/booking?plan=${encodeURIComponent(planId)}` : '/booking';

		if (user) {
			navigate(target);
		} else {
			navigate('/login', { state: { from: target } });
		}
	};
}
