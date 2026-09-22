import { useState, type ComponentProps } from 'react';
import { ViewIcon, ViewOffSlashIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export function PasswordInput({ className, ...props }: Omit<ComponentProps<typeof Input>, 'type' | 'prefix'>) {
	const [visible, setVisible] = useState(false);

	return (
		<div className="relative">
			<Input type={visible ? 'text' : 'password'} className={cn('pr-10', className)} {...props} />
			<button
				type="button"
				onClick={() => setVisible((current) => !current)}
				aria-label={visible ? 'Hide password' : 'Show password'}
				aria-pressed={visible}
				className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-4xl text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
			>
				<HugeiconsIcon icon={visible ? ViewOffSlashIcon : ViewIcon} strokeWidth={2} className="size-4" />
			</button>
		</div>
	);
}
