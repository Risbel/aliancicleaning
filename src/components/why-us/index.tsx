import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import WaveDivider from '../decorative/WaveDivider';

const capabilities = [
	{
		title: 'Professionalism',
		description: 'Our highly trained team delivers deep cleaning solutions and consistently flawless results.',
		image: '/atomizer_webp.webp',
		alt: 'Professional cleaning atomizer',
		accent: '#156390',
	},
	{
		title: 'Punctuality',
		description: 'We value your schedule, ensuring timely arrivals that never disrupt your daily routine.',
		image: '/clock_webp.webp',
		alt: 'Clock representing punctuality',
		accent: '#ffffff',
	},
	{
		title: 'Attention to Detail',
		description: 'We meticulously treat every room, ensuring that every corner of your home is perfect.',
		image: '/magnifying_glass_webp.webp',
		alt: 'Magnifying glass representing attention to detail',
		accent: '#5bb286',
	},
	{
		title: 'Eco & Pet Friendly',
		description: 'Safe cleaning using biodegradable products that care for your beloved pets and the planet.',
		image: '/eco_pet_webp.webp',
		alt: 'Eco and pet friendly cleaning products',
		accent: '#5bb286',
	},
] as const;

export default function WhyUsSection() {
	return (
		<section id="why-us" className="bg-linear-to-b from-teal-100 to-teal-200 px-6 pt-16 pb-24 lg:px-12 xl:px-16">
			<div className="mx-auto max-w-7xl">
				<div className="mb-14 flex flex-col items-center text-center">
					<div className="mb-5 inline-flex items-center gap-2 rounded-full border border-baltic-blue/20 bg-baltic-blue/8 px-4 py-1.5 text-[11px] font-semibold tracking-[0.15em] text-baltic-blue">
						<span className="size-1.5 rounded-full bg-mint-leaf shadow-sm shadow-mint-leaf/60" />
						What Sets Us Apart
					</div>

					<h2 className="text-[2rem] font-bold leading-[1.1] tracking-tight text-[#1a2e3f] sm:text-[2.4rem] lg:text-[2.6rem] xl:text-[3rem]">
						Eco-Friendly & Pet-Safe Services
					</h2>

					<p className="mt-4 max-w-lg text-base leading-relaxed text-[#1a2e3f]/70">
						Every visit is a commitment — of care, reliability, and a spotless home delivered with pride.
					</p>
				</div>

				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
					{capabilities.map((cap) => (
						<Card key={cap.title} className="gap-2 hover:shadow-lg transition-shadow duration-300">
							<div className="flex items-center justify-center">
								<div
									className="mb-4 flex items-center justify-center rounded-full w-fit"
									style={{ backgroundColor: `${cap.accent}18` }}
								>
									<img src={cap.image} alt={cap.alt} className="h-20 w-20 object-contain rounded-full" loading="lazy" />
								</div>
							</div>

							<CardHeader>
								<CardTitle className="text-2xl font-bold">{cap.title}</CardTitle>
							</CardHeader>

							<CardContent>
								<CardDescription className="text-lg leading-tight font-light">{cap.description}</CardDescription>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</section>
	);
}
