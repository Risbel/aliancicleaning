import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlanPricingForm } from '@/components/dashboard/plans/PlanPricingForm';
import { useAllPlans } from '@/hooks/queries/use-plans';
import { usePageMeta } from '@/hooks/usePageMeta';

export default function DashboardPlansPage() {
	const { data: plans, isLoading, isError } = useAllPlans();

	usePageMeta({
		title: 'Plan Pricing | Alianci Cleaning Dashboard',
		path: '/dashboard/plans',
		noIndex: true,
	});

	return (
		<div className="px-6 py-8 lg:px-12">
			<div className="mx-auto max-w-6xl">
				<h1 className="mb-6 text-2xl font-bold text-foreground">Plan Pricing</h1>

				{isLoading && <p className="text-sm text-muted-foreground">Loading plans...</p>}
				{isError && <p className="text-sm text-destructive">Failed to load plans.</p>}
				{!isLoading && !isError && plans?.length === 0 && (
					<p className="text-sm text-muted-foreground">No plans found.</p>
				)}

				{!isLoading && !isError && plans && plans.length > 0 && (
					<div className="grid gap-6 md:grid-cols-2">
						{plans.map((plan) => (
							<Card key={plan.id}>
								<CardHeader>
									<CardTitle className="flex items-center justify-between gap-2">
										<span>{plan.name}</span>
										{!plan.is_active && <Badge variant="outline">Inactive</Badge>}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<PlanPricingForm plan={plan} />
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
