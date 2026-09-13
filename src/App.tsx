import { Route, Routes } from 'react-router-dom';
import { RequireAdmin } from '@/components/auth/RequireAdmin';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { RequireStaff } from '@/components/auth/RequireStaff';
import LandingPage from '@/pages/landing';
import LoginPage from '@/pages/login';
import SignupPage from '@/pages/signup';
import BookingPage from '@/pages/booking';
import DashboardQuotesPage from '@/pages/dashboard/quotes';
import DashboardPlansPage from '@/pages/dashboard/plans';
import ConfirmationPage from '@/pages/confirmation';

export default function App() {
	return (
		<Routes>
			<Route path="/" element={<LandingPage />} />
			<Route path="/login" element={<LoginPage />} />
			<Route path="/signup" element={<SignupPage />} />
			<Route
				path="/booking"
				element={
					<RequireAuth>
						<BookingPage />
					</RequireAuth>
				}
			/>
			<Route
				path="/dashboard/quotes"
				element={
					<RequireStaff>
						<DashboardQuotesPage />
					</RequireStaff>
				}
			/>
			<Route
				path="/dashboard/plans"
				element={
					<RequireAdmin>
						<DashboardPlansPage />
					</RequireAdmin>
				}
			/>
			<Route path="/confirmation/:token" element={<ConfirmationPage />} />
		</Routes>
	);
}
