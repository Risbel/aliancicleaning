import { motion, useReducedMotion, type Variants } from 'motion/react';

const spring = { type: 'spring', stiffness: 260, damping: 24 } as const;

const viewport = { once: true, margin: '-80px' } as const;

type RevealProps = {
	children: React.ReactNode;
	delay?: number;
	className?: string;
};

export function Reveal({ children, delay = 0, className }: RevealProps) {
	const reduced = useReducedMotion();

	return (
		<motion.div
			initial={{ opacity: 0, y: reduced ? 0 : 24 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={viewport}
			transition={{ ...spring, delay }}
			className={className}
		>
			{children}
		</motion.div>
	);
}

type StaggerContainerProps = {
	children: React.ReactNode;
	className?: string;
	onMount?: boolean;
	staggerChildren?: number;
	delayChildren?: number;
};

export function StaggerContainer({
	children,
	className,
	onMount = false,
	staggerChildren = 0.12,
	delayChildren = 0.1,
}: StaggerContainerProps) {
	const containerVariants: Variants = {
		hidden: {},
		visible: {
			transition: { staggerChildren, delayChildren },
		},
	};

	return (
		<motion.div
			variants={containerVariants}
			initial="hidden"
			{...(onMount ? { animate: 'visible' } : { whileInView: 'visible', viewport })}
			className={className}
		>
			{children}
		</motion.div>
	);
}

type StaggerItemProps = {
	children: React.ReactNode;
	className?: string;
	variant?: 'up' | 'left' | 'right' | 'scale';
	hoverLift?: boolean;
};

export function StaggerItem({ children, className, variant = 'up', hoverLift = false }: StaggerItemProps) {
	const reduced = useReducedMotion();

	const hidden = reduced
		? { opacity: 0 }
		: variant === 'left'
			? { opacity: 0, x: -48 }
			: variant === 'right'
				? { opacity: 0, x: 48 }
				: variant === 'scale'
					? { opacity: 0, scale: 0.85 }
					: { opacity: 0, y: 20 };

	const itemVariants: Variants = {
		hidden,
		visible: { opacity: 1, x: 0, y: 0, scale: 1, transition: spring },
	};

	return (
		<motion.div
			variants={itemVariants}
			className={className}
			{...(hoverLift && !reduced ? { whileHover: { y: -6 } } : {})}
		>
			{children}
		</motion.div>
	);
}

type AnimatedHeadingProps = {
	text: string;
	className?: string;
	delay?: number;
};

export function AnimatedHeading({ text, className, delay = 0 }: AnimatedHeadingProps) {
	const reduced = useReducedMotion();
	const words = text.split(' ');

	if (reduced) {
		return (
			<motion.h2
				initial={{ opacity: 0 }}
				whileInView={{ opacity: 1 }}
				viewport={viewport}
				transition={{ duration: 0.5, delay }}
				className={className}
			>
				{text}
			</motion.h2>
		);
	}

	return (
		<motion.h2
			variants={{
				hidden: {},
				visible: { transition: { staggerChildren: 0.06, delayChildren: delay } },
			}}
			initial="hidden"
			whileInView="visible"
			viewport={viewport}
			className={className}
		>
			{words.map((word, index) => (
				<span key={index}>
					<span className="inline-block overflow-hidden pb-[0.1em] -mb-[0.1em] align-bottom">
						<motion.span
							variants={{
								hidden: { y: '100%', opacity: 0 },
								visible: { y: 0, opacity: 1, transition: spring },
							}}
							className="inline-block"
						>
							{word}
						</motion.span>
					</span>
					{index < words.length - 1 ? ' ' : null}
				</span>
			))}
		</motion.h2>
	);
}
