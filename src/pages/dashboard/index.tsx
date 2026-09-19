import { usePageMeta } from '@/hooks/usePageMeta';

export default function DashboardHomePage() {
	usePageMeta({
		title: 'Dashboard | Alianci Cleaning Dashboard',
		path: '/dashboard',
		noIndex: true,
	});

	return (
		<div className="px-6 py-8 lg:px-12">
			<div className="mx-auto max-w-6xl">
				<h1 className="mb-6 text-2xl font-bold text-foreground">Overview</h1>
				<p className="text-sm text-muted-foreground">Charts and metrics are coming soon.</p>
			</div>
		</div>
	);
}
