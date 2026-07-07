import FloatingBubble from '@/components/decorative/FloatingBubble';
import services from '@/data/services.json';
import ServiceCard from './ServiceCard';
import { AnimatedHeading, Reveal, StaggerContainer, StaggerItem } from '@/components/motion/Reveal';

export default function ServicesSection() {
	return (
		<section id="services" className="relative overflow-hidden bg-white-smoke px-6 pt-24 pb-24 lg:px-12 xl:px-16">
			<FloatingBubble size={140} color="#54a1ced2" opacity={1} top="25px" left="-60px" animationDuration="8s" />
			<FloatingBubble
				size={120}
				color="#40a7e36c"
				opacity={0.3}
				top="60px"
				left="40px"
				animationDuration="8s"
				variant="outline"
			/>
			<FloatingBubble
				size={100}
				color="#5bb286"
				opacity={0.1}
				top="20%"
				right="5%"
				animationDelay="1.5s"
				animationDuration="7s"
			/>
			<FloatingBubble
				size={60}
				color="#54a8d0"
				variant="outline"
				opacity={0.18}
				bottom="20%"
				left="8%"
				animationDelay="0.8s"
				animationDuration="6s"
			/>
			<FloatingBubble
				size={130}
				color="#5bb286"
				opacity={0.2}
				bottom="20%"
				right="-20px"
				animationDelay="2s"
				animationDuration="9s"
			/>
			<FloatingBubble
				size={130}
				color="#5bb286"
				opacity={0.07}
				bottom="10%"
				right="-30px"
				animationDelay="2s"
				animationDuration="9s"
				variant="outline"
			/>

			<div className="relative z-10 mx-auto max-w-7xl">
				<div className="mb-14 flex flex-col items-center text-center">
					<Reveal className="mb-5 inline-flex items-center gap-2 rounded-full border border-mint-leaf/25 bg-mint-leaf/8 px-4 py-1.5 text-[11px] font-semibold tracking-[0.15em] text-mint-leaf">
						<span className="size-1.5 rounded-full bg-mint-leaf shadow-sm shadow-mint-leaf/60" />
						Cleaning Services
					</Reveal>

					<AnimatedHeading
						text="Choose the Cleaning Service That Fits Your Needs."
						className="max-w-2xl text-[2rem] font-bold leading-[1.1] tracking-tight text-[#1a2e3f] sm:text-[2.4rem] lg:text-[2.6rem] xl:text-[3rem]"
					/>

					<Reveal delay={0.2}>
						<p className="mt-4 max-w-lg text-base leading-relaxed text-[#1a2e3f]/70">
							We offer cleaning that is 100% safe for pets and the environment. Choose the ideal service to keep your home
							shining responsibly.
						</p>
					</Reveal>
				</div>

				<StaggerContainer className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:items-end lg:py-6">
					{services.map((service) => (
						<StaggerItem key={service.id}>
							<ServiceCard service={service} />
						</StaggerItem>
					))}
				</StaggerContainer>
			</div>
		</section>
	);
}
