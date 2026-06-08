import { Button } from '@/components/ui/button';
import GradientText from '@/components/ui/GradientText';
import FloatingBubble from '@/components/decorative/FloatingBubble';
import WaveDivider from '@/components/decorative/WaveDivider';

export default function HeroSection() {
	return (
		<>
			<style>{`
				@keyframes bubble-float {
					from { transform: translateY(0px) scale(1); }
					to   { transform: translateY(-18px) scale(1.04); }
				}
				@keyframes logo-float {
					0%, 100% { transform: translateY(0px); }
					50%       { transform: translateY(-12px); }
				}
			`}</style>

			<section
				className="relative min-h-dvh overflow-x-hidden"
				style={{
					background: 'linear-gradient(135deg, #156390 0%, #54a8d0 55%, #cbe0ea 100%)',
				}}
			>
				{/* Floating background bubbles */}
				<FloatingBubble
					size={220}
					color="#ffffff"
					variant="filled"
					opacity={0.06}
					top="-60px"
					left="-60px"
					animationDuration="7s"
				/>
				<FloatingBubble
					size={140}
					color="#5bb286"
					variant="filled"
					opacity={0.12}
					top="10%"
					right="8%"
					animationDelay="1.2s"
					animationDuration="5.5s"
				/>
				<FloatingBubble
					size={80}
					color="#ffffff"
					variant="outline"
					opacity={0.25}
					top="30%"
					left="5%"
					animationDelay="0.8s"
					animationDuration="6.5s"
				/>
				<FloatingBubble
					size={55}
					color="#cde2d7"
					variant="filled"
					opacity={0.18}
					top="55%"
					left="12%"
					animationDelay="2s"
					animationDuration="8s"
				/>
				<FloatingBubble
					size={100}
					color="#ffffff"
					variant="outline"
					opacity={0.15}
					bottom="15%"
					right="20%"
					animationDelay="1.5s"
					animationDuration="7.5s"
				/>
				<FloatingBubble
					size={45}
					color="#5bb286"
					variant="filled"
					opacity={0.2}
					top="20%"
					left="35%"
					animationDelay="3s"
					animationDuration="5s"
				/>
				<FloatingBubble
					size={70}
					color="#cbe0ea"
					variant="outline"
					opacity={0.3}
					bottom="25%"
					left="40%"
					animationDelay="0.4s"
					animationDuration="9s"
				/>

				{/* Content grid */}
				<div className="relative z-10 mx-auto flex min-h-dvh max-w-7xl flex-col items-center px-6 pb-24 pt-24 lg:flex-row lg:gap-12 lg:pb-40 lg:px-12 xl:px-16">
					{/* Left: text */}
					<div className="flex flex-1 flex-col justify-center">
						<div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-semibold tracking-[0.15em] text-white/80 backdrop-blur-sm">
							<span className="size-1.5 rounded-full bg-mint-leaf shadow-xs shadow-mint-leaf/60" />
							Austin's Premium Cleaning
						</div>

						<div className="w-full">
							<GradientText
								colors={['#ffffff', '#cde2d7', '#5bb286', '#cde2d7', '#ffffff']}
								animationSpeed={4}
								className="mx-0! max-w-none! justify-start! rounded-none! text-left text-[2.8rem] leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-5xl xl:text-[3.75rem] 2xl:text-[4.5rem] font-bold"
							>
								YOUR HOME IN
								<br />
								SAFE HANDS
							</GradientText>
						</div>

						<p className="mt-4 md:mt-6 max-w-md text-base leading-relaxed text-white/80 sm:text-lg">
							Austin's detail-oriented cleaning experts using eco-friendly and pet-safe products for you.
						</p>

						<div className="mt-8 flex flex-col gap-3 sm:flex-row">
							<Button
								size="xxxl"
								asChild
								variant="default"
								className="bg-linear-to-r from-teal-700 to-baltic-blue hover:bg-teal-600 text-white"
							>
								<a href="#booking">Request a Quote</a>
							</Button>

							<Button size="xxxl" asChild variant="outline">
								<a href="#services">See Our Services</a>
							</Button>
						</div>

						<div className="hidden mt-10 md:flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/80">
							{['Eco-Friendly', 'Pet-Safe', 'Fully Insured'].map((tag) => (
								<span key={tag} className="flex items-center gap-1.5">
									<svg
										className="size-5 text-green-500"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										strokeWidth={2}
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
									{tag}
								</span>
							))}
						</div>
					</div>

					{/* Right: logo circle */}
					<div className="mt-12 flex shrink-0 items-center justify-center lg:mt-0 lg:w-105 xl:w-120">
						<div className="relative" style={{ animation: 'logo-float 5s ease-in-out infinite' }}>
							{/* Outer glow ring */}
							<div
								className="absolute inset-0 rounded-full"
								style={{
									background: 'conic-gradient(from 0deg, #5bb286, #54a8d0, #cbe0ea, #5bb286)',
									padding: '3px',
									borderRadius: '50%',
									filter: 'blur(0px)',
									boxShadow:
										'0 0 0 8px rgba(84,168,208,0.2), 0 0 0 16px rgba(21,99,144,0.12), 0 20px 60px rgba(21,99,144,0.4)',
								}}
							/>

							{/* Gradient border ring */}
							<div
								className="relative flex items-center justify-center rounded-full"
								style={{
									background: 'conic-gradient(from 0deg, #5bb286, #54a8d0, #ffffff, #cde2d7, #5bb286)',
									padding: '4px',
									width: 320,
									height: 320,
								}}
							>
								{/* White inner ring */}
								<div
									className="flex items-center justify-center rounded-full bg-white/15 backdrop-blur-sm"
									style={{ width: 312 - 8, height: 312 - 8, padding: '6px' }}
								>
									<div
										className="flex items-center justify-center overflow-hidden rounded-full bg-white"
										style={{ width: 288, height: 288 }}
									>
										<img
											src="/logo_webp.webp"
											alt="Alianci Cleaning"
											className="h-full w-full object-cover"
											loading="eager"
										/>
									</div>
								</div>
							</div>

							{/* Sparkle dots */}
							<div className="absolute -top-2 -right-2 size-4 rounded-full bg-mint-leaf shadow-lg shadow-mint-leaf/50" />
							<div className="absolute -bottom-1 -left-3 size-3 rounded-full bg-fresh-sky shadow-md shadow-fresh-sky/50" />
							<div className="absolute top-1/4 -left-4 size-2 rounded-full bg-white/70" />
						</div>
					</div>
				</div>

				{/* Wave bottom divider */}
				<WaveDivider fill="#f2f2f2" />
			</section>
		</>
	);
}
