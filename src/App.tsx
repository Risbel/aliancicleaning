import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { RequireAdmin } from '@/components/auth/RequireAdmin';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { RequireStaff } from '@/components/auth/RequireStaff';
import { PageSpinner } from '@/components/PageSpinner';
import LandingPage from '@/pages/landing';

const DashboardLayout = lazy(() =>
	import('@/components/dashboard/DashboardLayout').then((module) => ({ default: module.DashboardLayout })),
);
const LoginPage = lazy(() => import('@/pages/login'));
const SignupPage = lazy(() => import('@/pages/signup'));
const ForgotPasswordPage = lazy(() => import('@/pages/forgot-password'));
const ResetPasswordPage = lazy(() => import('@/pages/reset-password'));
const BookingPage = lazy(() => import('@/pages/booking'));
const DashboardHomePage = lazy(() => import('@/pages/dashboard'));
const DashboardQuotesPage = lazy(() => import('@/pages/dashboard/quotes'));
const DashboardMyQuotesPage = lazy(() => import('@/pages/my-quotes'));
const DashboardPlansPage = lazy(() => import('@/pages/dashboard/plans'));
const DashboardClientsPage = lazy(() => import('@/pages/dashboard/clients'));
const DashboardStaffPage = lazy(() => import('@/pages/dashboard/staff'));
const DashboardReviewsPage = lazy(() => import('@/pages/dashboard/reviews'));
const ConfirmationPage = lazy(() => import('@/pages/confirmation'));
const PrivacyPage = lazy(() => import('@/pages/privacy'));
const TermsPage = lazy(() => import('@/pages/terms'));
const NotFoundPage = lazy(() => import('@/pages/not-found'));

export default function App() {
	return (
		<Suspense fallback={<PageSpinner />}>
			<Routes>
				<Route path="/" element={<LandingPage />} />
				<Route path="/login" element={<LoginPage />} />
				<Route path="/signup" element={<SignupPage />} />
				<Route path="/forgot-password" element={<ForgotPasswordPage />} />
				<Route path="/reset-password" element={<ResetPasswordPage />} />
				<Route
					path="/booking"
					element={
						<RequireAuth>
							<BookingPage />
						</RequireAuth>
					}
				/>
				<Route
					path="/dashboard"
					element={
						<RequireStaff>
							<DashboardLayout />
						</RequireStaff>
					}
				>
					<Route index element={<DashboardHomePage />} />
					<Route path="quotes" element={<DashboardQuotesPage />} />
					<Route path="clients" element={<DashboardClientsPage />} />
					<Route
						path="plans"
						element={
							<RequireAdmin>
								<DashboardPlansPage />
							</RequireAdmin>
						}
					/>
					<Route
						path="staff"
						element={
							<RequireAdmin>
								<DashboardStaffPage />
							</RequireAdmin>
						}
					/>
					<Route
						path="reviews"
						element={
							<RequireAdmin>
								<DashboardReviewsPage />
							</RequireAdmin>
						}
					/>
					<Route path="*" element={<Navigate to="/dashboard" replace />} />
				</Route>
				<Route
					path="/my-quotes"
					element={
						<RequireAuth>
							<DashboardMyQuotesPage />
						</RequireAuth>
					}
				/>
				<Route path="/confirmation/:token" element={<ConfirmationPage />} />
				<Route path="/privacy" element={<PrivacyPage />} />
				<Route path="/terms" element={<TermsPage />} />
				<Route path="*" element={<NotFoundPage />} />
			</Routes>
		</Suspense>
	);
}
