import * as React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { StarIcon } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils';
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselDots,
	useCarouselSelectedIndex,
	type CarouselApi,
} from '@/components/ui/carousel';

type Review = {
	src: string;
	name: string;
	info: string;
	rating: number;
	quote: string;
};

const reviews: Review[] = [
	{
		src: '/avatar_1.jpg',
		name: 'Sarah Martinez',
		info: 'Homeowner, Miami',
		rating: 5,
		quote:
			"Honestly didn't expect them to be this good? They got into corners I literally can't even reach. My mom came over and was like wow your place is spotless lol",
	},
	{
		src: '/avatar_2.jpg',
		name: 'James Wilson',
		info: 'Homeowner, Orlando',
		rating: 5,
		quote:
			"I use them every 2 weeks and it's way better than doing it myself every time. The lady remembered how I like my bathroom done without me telling her twice",
	},
	{
		src: '/avatar_3.jpg',
		name: 'Michelle Chen',
		info: 'Office Manager, Tampa',
		rating: 4,
		quote:
			'Pretty happy so far. They do a solid job but sometimes miss a spot here and there. Overall way better than the last company we had that was honestly lazy',
	},
	{
		src: '/avatar_4.jpg',
		name: 'David Rodriguez',
		info: 'Homeowner, Miami',
		rating: 5,
		quote:
			"Finally found someone I can trust in my house. They're nice people too not just good at cleaning. Saved me so much time on weekends",
	},
	{
		src: '/avatar_5.jpg',
		name: 'Jennifer Thompson',
		info: 'Property Manager, Orlando',
		rating: 5,
		quote:
			'Been coordinating them for like 15 properties now? Tenants actually complain less about cleanliness which is saying something lol. Super reliable',
	},
	{
		src: '/avatar_6.jpg',
		name: 'Robert Garcia',
		info: 'Homeowner, Tampa',
		rating: 4,
		quote:
			"They're good. Show up on time which I appreciate. Did have to ask them to redo one room once but they came back no problem",
	},
	{
		src: '/avatar_7.jpg',
		name: 'Angela Patel',
		info: 'Homeowner, Miami',
		rating: 5,
		quote:
			"Tried like 3 different cleaners before these guys. This one actually works with my schedule and doesn't flake out. That's already a win",
	},
	{
		src: '/avatar_8.jpg',
		name: 'Michael Anderson',
		info: 'Homeowner, Orlando',
		rating: 5,
		quote:
			'My allergies are way better now that someone else is dusting lol. Super easy to reschedule when something comes up. Worth every penny',
	},
];

export default function ReviewsSection() {
	const [api, setApi] = React.useState<CarouselApi>();
	const selectedIndex = useCarouselSelectedIndex(api);

	return (
		<section id="reviews" className="relative bg-white-smoke pb-24">
			<div className="mx-auto max-w-7xl px-6 lg:px-12 xl:px-16">
				<div className="flex flex-col items-center text-center">
					<div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-baltic-blue/30 bg-baltic-blue/10 px-4 py-1.5 text-[11px] font-semibold tracking-[0.15em] text-baltic-blue">
						<span className="size-1.5 rounded-full bg-baltic-blue shadow-xs shadow-baltic-blue/60" />
						TESTIMONIALS
					</div>

					<h2 className="text-[2rem] font-bold leading-[1.1] tracking-tight text-[#1a2e3f] sm:text-[2.4rem] lg:text-[2.6rem] xl:text-[3rem]">
						What Our Clients Say
					</h2>
				</div>

				<div className="mt-10">
					<Carousel setApi={setApi} opts={{ loop: true, align: 'center' }}>
						<CarouselContent className="py-6">
							{reviews.map((review, index) => (
								<CarouselItem key={review.src} className="basis-[85%] sm:basis-[60%] lg:basis-[38%] xl:basis-[32%]">
									<div
										className={cn(
											'flex h-full select-none hover:cursor-pointer flex-col rounded-3xl border border-pale-sky bg-white p-6 shadow-sm transition-transform duration-300',
											index === selectedIndex ? 'scale-100' : 'scale-[0.96]',
										)}
									>
										<div className="flex items-center gap-1">
											{Array.from({ length: 5 }).map((_, index) => (
												<HugeiconsIcon
													key={index}
													icon={StarIcon}
													size={18}
													strokeWidth={0}
													className={
														index < review.rating ? 'fill-amber-400 text-amber-400' : 'fill-pale-sky text-pale-sky'
													}
												/>
											))}
										</div>

										<p className="mt-4 flex-1 text-sm leading-relaxed text-[#1a2e3f]/70">{review.quote}</p>

										<div className="mt-6 flex items-center gap-3 border-t border-pale-sky pt-4">
											<img
												src={review.src}
												alt={review.name}
												className="size-11 shrink-0 rounded-full object-cover"
												loading="lazy"
											/>
											<div className="flex flex-col">
												<span className="text-sm font-semibold text-[#1a2e3f]">{review.name}</span>
												<span className="text-xs text-[#1a2e3f]/60">{review.info}</span>
											</div>
										</div>
									</div>
								</CarouselItem>
							))}
						</CarouselContent>

						<CarouselDots className="mt-8" />
					</Carousel>
				</div>
			</div>
		</section>
	);
}
