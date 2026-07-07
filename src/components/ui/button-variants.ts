import { cva } from 'class-variance-authority';

const buttonVariants = cva(
	"group/button cursor-pointer inline-flex shrink-0 items-center justify-center rounded-4xl border border-transparent bg-clip-padding font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
	{
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground hover:bg-primary/80',
				gradient: 'bg-linear-to-tr from-teal-600 to-baltic-blue text-white hover:from-teal-500 hover:to-baltic-blue/90',
				outline: 'hover:bg-input/20 aria-expanded:bg-muted aria-expanded:text-white',
				secondary:
					'bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground',
				ghost:
					'hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50',
				destructive:
					'bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40',
				link: 'text-primary underline-offset-4 hover:underline',
				shine:
					'animate-background-shine bg-[length:200%_100%] bg-[linear-gradient(110deg,#156390,45%,#5db48750,55%,#156390)] text-white shadow-md shadow-baltic-blue/20 hover:shadow-lg hover:shadow-baltic-blue/30 hover:brightness-110 active:brightness-90',
			},
			size: {
				default: 'text-sm h-9 gap-1.5 px-3 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5',
				xs: "text-xs h-6 gap-1 px-2.5 text-xs has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
				sm: 'text-xs h-8 gap-1 px-3 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
				lg: 'text-sm h-10 gap-1.5 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3',
				xl: 'text-md h-11 gap-2 px-5 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4',
				xxl: 'h-12 gap-2.5 px-6 has-data-[icon=inline-end]:pr-4.5 has-data-[icon=inline-start]:pl-4.5',
				xxxl: 'h-14 gap-3 px-8 has-data-[icon=inline-end]:pr-6 has-data-[icon=inline-start]:pl-6',
				icon: 'size-9',
				'icon-xs': "size-6 [&_svg:not([class*='size-'])]:size-3",
				'icon-sm': 'size-8',
				'icon-lg': 'size-10',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

export { buttonVariants };
