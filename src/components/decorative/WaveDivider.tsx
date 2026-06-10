interface WaveDividerProps {
	fill?: string;
	fillBack?: string;
	className?: string;
}

export default function WaveDivider({ fill = '#f2f2f2', fillBack, className = '' }: WaveDividerProps) {
	return (
		<div className={`absolute bottom-0 left-0 right-0 overflow-hidden leading-none ${className}`}>
			<svg
				viewBox="0 0 1440 160"
				xmlns="http://www.w3.org/2000/svg"
				preserveAspectRatio="none"
				className="block w-full"
				style={{ height: '160px' }}
			>
				<path
					d="M0,80 C240,160 480,0 720,80 C960,160 1200,0 1440,80 L1440,160 L0,160 Z"
					fill={fillBack ?? fill}
					opacity="0.4"
				/>
				<path
					d="M0,100 C200,40 400,140 600,90 C800,40 1000,140 1200,90 C1300,65 1380,110 1440,100 L1440,160 L0,160 Z"
					fill={fill}
				/>
			</svg>
		</div>
	);
}
