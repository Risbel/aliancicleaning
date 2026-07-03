import { cva } from 'class-variance-authority';

const badgeVariants = cva(
	"inline-flex shrink-0 items-center justify-center gap-1 rounded-4xl border border-transparent px-3 py-1 text-xs font-medium whitespace-nowrap transition-all outline-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3",
	{
		variants: {
			variant: {
				default: 'bg-muted text-foreground',
				primary: 'bg-primary text-primary-foreground',
				secondary: 'bg-secondary text-secondary-foreground',
				success: 'bg-mint-leaf text-white',
				destructive: 'bg-destructive/10 text-destructive dark:bg-destructive/20',
				outline: 'border-input text-foreground hover:bg-muted',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	},
);

export { badgeVariants };
