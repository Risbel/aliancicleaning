import { motion, useReducedMotion } from 'motion/react';
import { Button } from '@/components/ui/button';
import GradientText from '@/components/ui/GradientText';
import FloatingBubble from '@/components/decorative/FloatingBubble';
import WaveDivider from '@/components/decorative/WaveDivider';
import { StaggerContainer, StaggerItem } from '@/components/motion/Reveal';
import { useGoToBooking } from '@/hooks/booking/use-go-to-booking';

export default function HeroSection() {
	const goToBooking = useGoToBooking();
	const reduced = useReducedMotion();

	return (
		<>
			<style>{`
				@keyframes bubble-float {
					from { transform: translateY(0px) scale(1); }
					to   { transform: translateY(-18px) scale(1.04); }
				}
				@keyframes orbit-dot-pulse {
					0%, 100% { opacity: 0.9; transform: translate(-50%, -50%) scale(1); }
					50%       { opacity: 0.5; transform: translate(-50%, -50%) scale(0.7); }
				}
			`}</style>

			<section
				id="home"
				className="relative min-h-dvh overflow-x-hidden"
				style={{
					background: 'linear-gradient(135deg, #08679e 0%, #2290c3 55%, #e4f1f7 100%)',
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
				<FloatingBubble
					size={340}
					color="#ffffff"
					variant="outline"
					opacity={0.12}
					top="-90px"
					right="-110px"
					animationDelay="0.6s"
					animationDuration="10s"
				/>
				<FloatingBubble
					size={180}
					color="#5bb286"
					variant="filled"
					opacity={0.14}
					bottom="8%"
					right="-50px"
					animationDelay="2.4s"
					animationDuration="8s"
				/>

				{/* Content grid */}
				<div className="relative z-10 mx-auto flex min-h-dvh max-w-7xl flex-col items-center px-6 pb-24 pt-24 lg:flex-row-reverse lg:gap-12 lg:pb-40 lg:px-12 xl:px-16">
					{/* Right: text */}
					<StaggerContainer onMount className="flex flex-1 flex-col justify-center">
						<StaggerItem className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-semibold tracking-[0.15em] text-white/80 backdrop-blur-sm">
							<span className="size-1.5 rounded-full bg-mint-leaf shadow-xs shadow-mint-leaf/60" />
							Austin's Premium Cleaning
						</StaggerItem>

						<StaggerItem className="w-full">
							<h1>
								<GradientText
									colors={['#ffffff', '#cde2d7', '#5bb286', '#cde2d7', '#ffffff']}
									animationSpeed={4}
									className="mx-0! max-w-none! justify-start! rounded-none! text-left text-[2.8rem] leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl 2xl:text-[4.5rem] font-extrabold"
								>
									YOUR HOME IN
									<br />
									SAFE HANDS
								</GradientText>
							</h1>
						</StaggerItem>

						<StaggerItem>
							<p className="mt-4 md:mt-6 max-w-md text-base leading-relaxed text-white/80 sm:text-lg">
								Austin's detail-oriented cleaning experts using eco-friendly and pet-safe products for you.
							</p>
						</StaggerItem>

						<StaggerItem className="mt-8 flex flex-col gap-3 sm:flex-row">
							<Button size="xxxl" variant="shine" onClick={() => goToBooking()}>
								Request a Quote
							</Button>

							<Button size="xxxl" asChild variant="outline" className="text-white/80 hover:text-white">
								<a href="#services">See Our Services</a>
							</Button>
						</StaggerItem>

						<StaggerContainer
							onMount
							staggerChildren={0.15}
							delayChildren={0.7}
							className="hidden mt-10 md:flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/80"
						>
							{['Eco-Friendly', 'Pet-Safe', 'Fully Insured'].map((tag) => (
								<StaggerItem key={tag} className="flex items-center gap-1.5">
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
								</StaggerItem>
							))}
						</StaggerContainer>
					</StaggerContainer>

					{/* Left: portrait */}
					<motion.div
						initial={reduced ? { opacity: 0 } : { opacity: 0, y: 40 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ type: 'spring', stiffness: 160, damping: 22, delay: 0.4 }}
						className="relative hidden shrink-0 lg:-mb-40 lg:block lg:w-105 lg:self-end xl:w-115"
					>
						<div
							className="absolute left-1/2 top-[50%] aspect-square w-full -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30 backdrop-blur-sm"
							style={{
								background:
									'linear-gradient(150deg, rgba(255,255,255,0.4) 0%, rgba(203,224,234,0.25) 45%, rgba(91,178,134,0.55) 100%)',
								boxShadow: '0 30px 80px rgba(8,42,66,0.35), inset 0 0 60px rgba(255,255,255,0.15)',
							}}
						/>

						<div className="absolute left-[12%] top-[40%] size-2.5 rounded-full bg-mint-leaf shadow-md shadow-mint-leaf/50" />

						<img
							src="/yansi.png"
							alt="Alianci Cleaning owner"
							className="relative z-10 w-full drop-shadow-[0_20px_30px_rgba(8,42,66,0.35)]"
							loading="eager"
						/>
					</motion.div>
				</div>

				{/* Wave bottom divider */}
				<WaveDivider fill="#e8f8f6" className="z-20" />
			</section>
		</>
	);
}
