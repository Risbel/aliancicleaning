import { motion, useReducedMotion } from 'motion/react';
import { Button } from '@/components/ui/button';
import GradientText from '@/components/ui/GradientText';
import FloatingBubble from '@/components/decorative/FloatingBubble';
import { StaggerContainer, StaggerItem } from '@/components/motion/Reveal';
import { useGoToBooking } from '@/hooks/booking/use-go-to-booking';

const WAVE_FRONT_EDGE =
	'M0.5,0 C0.44,0.11 0.54,0.22 0.48,0.333 C0.42,0.444 0.52,0.555 0.46,0.667 C0.4,0.778 0.48,0.889 0.42,1';

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
				className="relative min-h-dvh overflow-hidden lg:min-h-0 lg:h-[min(100dvh,48rem)]"
				style={{
					background: 'linear-gradient(135deg, #08679e 0%, #2290c3 55%, #e4f1f7 100%)',
				}}
			>
				<motion.img
					src="/hero-image-01.webp"
					alt="Alianci Cleaning professional vacuuming a living room"
					initial={reduced ? false : { scale: 1.05 }}
					animate={{ scale: 1 }}
					transition={{ duration: 1.2, ease: 'easeOut' }}
					className="pointer-events-none absolute inset-0 size-full object-cover object-[20%_center] lg:w-[70%] lg:max-w-344 lg:mask-[linear-gradient(to_right,black_80%,transparent)]"
					loading="eager"
					fetchPriority="high"
				/>

				<div className="pointer-events-none absolute inset-0 bg-linear-to-b from-[#08679e]/70 to-[#08679e]/85 lg:hidden" />

				<div className="pointer-events-none absolute inset-0 hidden lg:block">
					<svg className="absolute size-0" aria-hidden="true">
						<defs>
							<clipPath id="hero-wave-back" clipPathUnits="objectBoundingBox">
								<path d="M1,0 H0.38 C0.32,0.11 0.42,0.22 0.36,0.333 C0.3,0.444 0.4,0.555 0.34,0.667 C0.28,0.778 0.36,0.889 0.3,1 H1 Z" />
							</clipPath>
							<clipPath id="hero-wave-middle" clipPathUnits="objectBoundingBox">
								<path d="M1,0 H0.44 C0.49,0.12 0.38,0.21 0.42,0.333 C0.46,0.46 0.35,0.54 0.39,0.667 C0.43,0.79 0.33,0.88 0.36,1 H1 Z" />
							</clipPath>
							<clipPath id="hero-wave-front" clipPathUnits="objectBoundingBox">
								<path d={`${WAVE_FRONT_EDGE} H1 V0 Z`} />
							</clipPath>
						</defs>
					</svg>

					<motion.div
						initial={{ opacity: 0 }}
						animate={reduced ? { opacity: 1 } : { opacity: 1, x: [0, 18, 0] }}
						transition={{
							opacity: { duration: 0.8, delay: 0.2 },
							x: { duration: 9, repeat: Infinity, ease: 'easeInOut' },
						}}
						className="absolute inset-0 bg-linear-to-b from-mint-leaf/35 to-honeydew/25 [clip-path:url(#hero-wave-back)]"
					/>
					<motion.div
						initial={{ opacity: 0 }}
						animate={reduced ? { opacity: 1 } : { opacity: 1, x: [0, -12, 0] }}
						transition={{
							opacity: { duration: 0.8, delay: 0.35 },
							x: { duration: 7, repeat: Infinity, ease: 'easeInOut' },
						}}
						className="absolute inset-0 bg-white/15 backdrop-blur-[2px] [clip-path:url(#hero-wave-middle)]"
					/>
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.8, delay: 0.5 }}
						className="absolute inset-0 bg-linear-to-br from-[#08679e]/80 via-[#08679e]/70 to-[#2290c3]/65 backdrop-blur-sm [clip-path:url(#hero-wave-front)]"
					/>

					<svg viewBox="0 0 1 1" preserveAspectRatio="none" className="absolute inset-0 size-full" aria-hidden="true">
						<path
							d={WAVE_FRONT_EDGE}
							fill="none"
							stroke="white"
							strokeOpacity={0.6}
							strokeWidth={2}
							strokeLinecap="round"
							vectorEffect="non-scaling-stroke"
						/>
					</svg>
				</div>

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
				<div className="relative z-10 mx-auto flex min-h-dvh max-w-7xl lg:h-full lg:min-h-0 flex-col items-center px-6 pb-12 pt-24 lg:flex-row lg:justify-end lg:pb-16 lg:px-12 xl:px-16">
					{/* Right: text */}
					<StaggerContainer onMount className="flex flex-1 flex-col justify-center lg:w-1/2 lg:flex-none lg:pl-12">
						<StaggerItem fade={false} className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-semibold tracking-[0.15em] text-white/80 backdrop-blur-sm">
							<span className="size-1.5 rounded-full bg-mint-leaf shadow-xs shadow-mint-leaf/60" />
							<h1>House Cleaning Services in Austin, TX</h1>
						</StaggerItem>

						<StaggerItem fade={false} className="w-full">
							<div>
								<GradientText
									colors={['#ffffff', '#cde2d7', '#5bb286', '#cde2d7', '#ffffff']}
									animationSpeed={4}
									className="mx-0! max-w-none! justify-start! rounded-none! text-left text-[2.8rem] leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl 2xl:text-[4.5rem] font-extrabold"
								>
									YOUR HOME IN
									<br />
									SAFE HANDS
								</GradientText>
							</div>
						</StaggerItem>

						<StaggerItem fade={false}>
							<p className="mt-4 md:mt-6 max-w-md text-base leading-relaxed text-white/80 sm:text-lg">
								Austin's detail-oriented cleaning experts using eco-friendly and pet-safe products for you.
							</p>
						</StaggerItem>

						<StaggerItem fade={false} className="mt-8 flex flex-col gap-3 sm:flex-row">
							<Button size="xxxl" variant="shine" onClick={() => goToBooking()}>
								Request a Quote
							</Button>

							<Button size="xxxl" asChild variant="outline" className="text-white/80 hover:text-white bg-white/20">
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
				</div>
			</section>
		</>
	);
}
