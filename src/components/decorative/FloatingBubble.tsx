interface FloatingBubbleProps {
	size: number;
	color: string;
	variant?: 'filled' | 'outline';
	opacity?: number;
	top?: string;
	left?: string;
	right?: string;
	bottom?: string;
	animationDelay?: string;
	animationDuration?: string;
}

export default function FloatingBubble({
	size,
	color,
	variant = 'filled',
	opacity = 0.15,
	top,
	left,
	right,
	bottom,
	animationDelay = '0s',
	animationDuration = '6s',
}: FloatingBubbleProps) {
	const positionStyle: React.CSSProperties = {
		position: 'absolute',
		width: size,
		height: size,
		borderRadius: '50%',
		top,
		left,
		right,
		bottom,
		animationDelay,
		animationDuration,
		animationName: 'bubble-float',
		animationTimingFunction: 'ease-in-out',
		animationIterationCount: 'infinite',
		animationDirection: 'alternate',
		pointerEvents: 'none',
	};

	if (variant === 'filled') {
		return (
			<div
				style={{
					...positionStyle,
					backgroundColor: color,
					opacity,
				}}
			/>
		);
	}

	return (
		<div
			style={{
				...positionStyle,
				border: `2px solid ${color}`,
				opacity,
			}}
		/>
	);
}
