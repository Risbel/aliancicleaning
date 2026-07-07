import { HugeiconsIcon } from '@hugeicons/react';
import { SparklesIcon, Clock01Icon, SearchFocusIcon, Leaf01Icon } from '@hugeicons/core-free-icons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedHeading, Reveal, StaggerContainer, StaggerItem } from '@/components/motion/Reveal';

const capabilities = [
	{
		title: 'Professionalism',
		description: 'Our highly trained team delivers deep cleaning solutions and consistently flawless results.',
		icon: SparklesIcon,
		accent: '#2aaaf4',
	},
	{
		title: 'Punctuality',
		description: 'We value your schedule, ensuring timely arrivals that never disrupt your daily routine.',
		icon: Clock01Icon,
		accent: '#fdc90d',
	},
	{
		title: 'Attention to Detail',
		description: 'We meticulously treat every room, ensuring that every corner of your home is perfect.',
		icon: SearchFocusIcon,
		accent: '#cb22ff',
	},
	{
		title: 'Eco & Pet Friendly',
		description: 'Safe cleaning using biodegradable products that care for your beloved pets and the planet.',
		icon: Leaf01Icon,
		accent: '#5bb286',
	},
] as const;

export default function WhyUsSection() {
	return (
		<section id="why-us" className="bg-linear-to-b from-teal-100 to-teal-200 px-6 pt-16 pb-24 lg:px-12 xl:px-16">
			<div className="mx-auto max-w-7xl">
				<div className="mb-14 flex flex-col items-center text-center">
					<Reveal className="mb-5 inline-flex items-center gap-2 rounded-full border border-baltic-blue/20 bg-baltic-blue/8 px-4 py-1.5 text-[11px] font-semibold tracking-[0.15em] text-baltic-blue">
						<span className="size-1.5 rounded-full bg-mint-leaf shadow-sm shadow-mint-leaf/60" />
						What Sets Us Apart
					</Reveal>

					<AnimatedHeading
						text="Eco-Friendly & Pet-Safe Services"
						className="text-[2rem] font-bold leading-[1.1] tracking-tight text-[#1a2e3f] sm:text-[2.4rem] lg:text-[2.6rem] xl:text-[3rem]"
					/>

					<Reveal delay={0.2}>
						<p className="mt-4 max-w-lg text-base leading-relaxed text-[#1a2e3f]/70">
							Every visit is a commitment — of care, reliability, and a spotless home delivered with pride.
						</p>
					</Reveal>
				</div>

				<StaggerContainer className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
					{capabilities.map((cap) => (
						<StaggerItem key={cap.title} hoverLift className="h-full">
							<Card className="h-full gap-2 hover:shadow-lg transition-shadow duration-300">
							<div className="flex items-center justify-center">
								<div
									className="mb-4 flex h-20 w-20 items-center justify-center rounded-full"
									style={{ backgroundColor: `${cap.accent}18` }}
								>
									<HugeiconsIcon icon={cap.icon} size={40} color={cap.accent} strokeWidth={1.5} />
								</div>
							</div>

							<CardHeader>
								<CardTitle className="text-2xl font-bold">{cap.title}</CardTitle>
							</CardHeader>

								<CardContent>
									<CardDescription className="text-lg leading-tight font-light">{cap.description}</CardDescription>
								</CardContent>
							</Card>
						</StaggerItem>
					))}
				</StaggerContainer>
			</div>
		</section>
	);
}
