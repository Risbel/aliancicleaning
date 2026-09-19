import { Route, Routes } from 'react-router-dom';
import { RequireAdmin } from '@/components/auth/RequireAdmin';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { RequireStaff } from '@/components/auth/RequireStaff';
import LandingPage from '@/pages/landing';
import LoginPage from '@/pages/login';
import SignupPage from '@/pages/signup';
import BookingPage from '@/pages/booking';
import DashboardQuotesPage from '@/pages/dashboard/quotes';
import DashboardMyQuotesPage from '@/pages/my-quotes';
import DashboardPlansPage from '@/pages/dashboard/plans';
import DashboardClientsPage from '@/pages/dashboard/clients';
import ConfirmationPage from '@/pages/confirmation';
import PrivacyPage from '@/pages/privacy';
import TermsPage from '@/pages/terms';

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
				path="/dashboard/clients"
				element={
					<RequireStaff>
						<DashboardClientsPage />
					</RequireStaff>
				}
			/>
			<Route
				path="/my-quotes"
				element={
					<RequireAuth>
						<DashboardMyQuotesPage />
					</RequireAuth>
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
			<Route path="/privacy" element={<PrivacyPage />} />
			<Route path="/terms" element={<TermsPage />} />
		</Routes>
	);
}
