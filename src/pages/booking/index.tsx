import { useSearchParams } from 'react-router-dom';
import services from '@/data/services.json';

export default function BookingPage() {
	const [searchParams] = useSearchParams();
	const planId = searchParams.get('plan');
	const plan = services.find((service) => service.id === planId);

	return (
		<div className="flex min-h-dvh flex-col items-center justify-center gap-2 px-6 text-center">
			<h1 className="text-2xl font-bold text-foreground">Request a Quote</h1>
			<p className="text-muted-foreground">The booking form is coming soon.</p>
			{plan && <p className="text-sm text-muted-foreground">Selected plan: {plan.name}</p>}
		</div>
	);
}
