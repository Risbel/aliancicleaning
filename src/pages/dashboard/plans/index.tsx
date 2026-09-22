import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlanContentForm } from '@/components/dashboard/plans/PlanContentForm';
import { PlanPricingForm } from '@/components/dashboard/plans/PlanPricingForm';
import { useAllPlans } from '@/hooks/queries/use-plans';
import { usePageMeta } from '@/hooks/usePageMeta';
import { getPlanImage } from '@/lib/plan-images';

export default function DashboardPlansPage() {
	const { data: plans, isLoading, isError } = useAllPlans();

	usePageMeta({
		title: 'Plans | Alianci Cleaning Dashboard',
		path: '/dashboard/plans',
		noIndex: true,
	});

	return (
		<div className="px-6 py-8 lg:px-12">
			<div className="mx-auto max-w-6xl">
				<h1 className="mb-1 text-2xl font-bold text-foreground">Plans</h1>
				<p className="mb-6 text-sm text-muted-foreground">
					Pricing and landing page content for each plan. The plan image is fixed and cannot be changed here.
				</p>

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
									<div className="flex items-center gap-4">
										<div
											className="size-16 shrink-0 overflow-hidden rounded-lg"
											style={{ backgroundColor: plan.image_bg ?? undefined }}
										>
											<img
												src={getPlanImage(plan.type)}
												alt={plan.name}
												className="h-full w-full object-cover"
											/>
										</div>

										<div className="flex flex-col gap-1.5">
											<CardTitle>{plan.name}</CardTitle>
											<div className="flex flex-wrap items-center gap-1.5">
												<Badge variant="outline">{plan.type}</Badge>
												{plan.is_popular && <Badge>Most Popular</Badge>}
												{!plan.is_active && <Badge variant="outline">Inactive</Badge>}
											</div>
										</div>
									</div>
								</CardHeader>

								<CardContent>
									<Tabs defaultValue="pricing">
										<TabsList>
											<TabsTrigger value="pricing">Pricing</TabsTrigger>
											<TabsTrigger value="content">Content</TabsTrigger>
										</TabsList>

										<TabsContent value="pricing">
											<PlanPricingForm plan={plan} />
										</TabsContent>

										<TabsContent value="content">
											<PlanContentForm plan={plan} />
										</TabsContent>
									</Tabs>
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
