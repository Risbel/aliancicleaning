import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01Icon } from '@hugeicons/core-free-icons';
import { AnimatedHeading, Reveal } from '@/components/motion/Reveal';
import serviceAreas from '@/data/service-areas.json';

const faqs = [
	{
		question: 'What cleaning services do you offer in Austin?',
		answer:
			'We offer Standard Cleaning for regular upkeep, Deep Cleaning for a thorough top-to-bottom clean, and Move-In/Move-Out Cleaning for when you are changing homes. If you need something else, you can describe the job in your own words and attach photos, and we will send you a price.',
	},
	{
		question: 'Which areas do you serve?',
		answer: `We clean homes in ${serviceAreas.slice(0, -1).join(', ')} and ${serviceAreas.at(-1)}, TX, within roughly 25 miles of downtown Austin. If you are not sure whether you are in our area, contact us and we will let you know.`,
	},
	{
		question: 'How much does a house cleaning cost?',
		answer:
			'The price depends on the plan you choose and on your home: bedrooms, bathrooms, square footage, pets, and any special requests. When you request a quote you see an estimate right away. Our team then reviews your request and sends you the final price, and nothing is booked until you accept it.',
	},
	{
		question: 'What is included in a deep cleaning?',
		answer:
			'Deep Cleaning includes everything in our Standard Cleaning plus the inside of the oven and refrigerator, baseboards, doors and window sills, blinds and window tracks, grout and tile scrubbing, and light fixtures and ceiling fans.',
	},
	{
		question: 'What does move-in/move-out cleaning include?',
		answer:
			'It includes everything in Deep Cleaning plus the inside of all cabinets, drawers and closets, interior windows, and a detailed clean of the stovetop and appliances, so the home is ready for a landlord inspection or a fresh start.',
	},
	{
		question: 'Are your cleaning products safe for pets?',
		answer: 'Yes. We use eco-friendly, pet-safe cleaning products in every home we clean.',
	},
	{
		question: 'Are your cleaners insured?',
		answer: 'Yes. Alianci Cleaning is fully insured, so your home is protected while we work.',
	},
	{
		question: 'How do I book a cleaning?',
		answer:
			'Create a free account, choose your plan, and fill in a few details about your home. You can attach photos if you like. We review your request, send you a final quote by email, and your cleaning is confirmed once you accept it. To cancel or reschedule, contact us as soon as possible by phone, email, or WhatsApp.',
	},
];

export default function FaqSection() {
	return (
		<section id="faq" className="relative bg-white-smoke px-6 pt-8 pb-24 lg:px-12 xl:px-16">
			<div className="mx-auto max-w-3xl">
				<div className="flex flex-col items-center text-center">
					<Reveal className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-baltic-blue/30 bg-baltic-blue/10 px-4 py-1.5 text-[11px] font-semibold tracking-[0.15em] text-baltic-blue">
						<span className="size-1.5 rounded-full bg-baltic-blue shadow-xs shadow-baltic-blue/60" />
						FAQ
					</Reveal>

					<AnimatedHeading
						text="Austin House Cleaning Questions"
						className="text-[2rem] font-bold leading-[1.1] tracking-tight text-[#1a2e3f] sm:text-[2.4rem] lg:text-[2.6rem] xl:text-[3rem]"
					/>
				</div>

				<Reveal delay={0.15} className="mt-10 flex flex-col gap-3">
					{faqs.map(({ question, answer }) => (
						<details
							key={question}
							className="group rounded-2xl border border-pale-sky bg-white px-5 py-4 shadow-xs open:shadow-sm"
						>
							<summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-semibold text-[#1a2e3f] [&::-webkit-details-marker]:hidden">
								<h3>{question}</h3>
								<HugeiconsIcon
									icon={ArrowDown01Icon}
									size={20}
									strokeWidth={1.5}
									className="shrink-0 text-baltic-blue transition-transform duration-200 group-open:rotate-180"
								/>
							</summary>
							<p className="mt-3 text-sm leading-relaxed text-[#1a2e3f]/80">{answer}</p>
						</details>
					))}
				</Reveal>
			</div>
		</section>
	);
}
