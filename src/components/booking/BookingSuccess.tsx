import { Link } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { CheckmarkCircle02Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';

export function BookingSuccess() {
	return (
		<div className="flex flex-col items-center gap-3 py-6 text-center">
			<HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-12 text-mint-leaf" />
			<h2 className="text-xl font-bold text-foreground">Quote request received</h2>
			<p className="max-w-sm text-sm text-muted-foreground">
				Thanks for reaching out. Our team will review your request and get back to you shortly with a confirmed quote.
			</p>
			<Button asChild variant="gradient" size="lg" className="mt-2">
				<Link to="/">Back to home</Link>
			</Button>
		</div>
	);
}
