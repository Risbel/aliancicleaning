import { cn } from '@/lib/utils';

export function PageSpinner({ className }: { className?: string }) {
	return (
		<div className={cn('flex min-h-dvh items-center justify-center bg-background', className)}>
			<div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
		</div>
	);
}
