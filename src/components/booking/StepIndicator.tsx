import { HugeiconsIcon } from '@hugeicons/react';
import { Tick02Icon } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils';

export const BOOKING_STEP_LABELS = ['Plan & Home', 'Address & Date', 'Contact & Review'];
export const CUSTOM_BOOKING_STEP_LABELS = ['Service & Photos', 'Address & Date', 'Contact & Review'];

interface StepIndicatorProps {
	currentStep: number;
	labels?: string[];
}

export function StepIndicator({ currentStep, labels = BOOKING_STEP_LABELS }: StepIndicatorProps) {
	return (
		<ol className="flex items-center gap-3">
			{labels.map((label, index) => {
				const step = index + 1;
				const isActive = step === currentStep;
				const isDone = step < currentStep;

				return (
					<li key={label} className="flex items-center gap-2">
						<span
							className={cn(
								'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors',
								isDone && 'bg-mint-leaf text-white',
								isActive && !isDone && 'bg-primary text-primary-foreground',
								!isActive && !isDone && 'bg-muted text-muted-foreground',
							)}
						>
							{isDone ? <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} className="size-4" /> : step}
						</span>
						<span
							className={cn(
								'hidden text-sm font-medium sm:inline',
								isActive ? 'text-foreground' : 'text-muted-foreground',
							)}
						>
							{label}
						</span>
						{step < labels.length && <span className="h-px w-6 bg-border sm:w-10" />}
					</li>
				);
			})}
		</ol>
	);
}
