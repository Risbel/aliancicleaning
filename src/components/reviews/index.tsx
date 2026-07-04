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
		name: 'Placeholder Name',
		info: 'Homeowner, Miami',
		rating: 5,
		quote: 'Placeholder testimonial — replace with a real customer review about the cleaning service.',
	},
	{
		src: '/avatar_2.jpg',
		name: 'Placeholder Name',
		info: 'Homeowner, Orlando',
		rating: 5,
		quote: 'Placeholder testimonial — replace with a real customer review about the cleaning service.',
	},
	{
		src: '/avatar_3.jpg',
		name: 'Placeholder Name',
		info: 'Office Manager, Tampa',
		rating: 4,
		quote: 'Placeholder testimonial — replace with a real customer review about the cleaning service.',
	},
	{
		src: '/avatar_4.jpg',
		name: 'Placeholder Name',
		info: 'Homeowner, Miami',
		rating: 5,
		quote: 'Placeholder testimonial — replace with a real customer review about the cleaning service.',
	},
	{
		src: '/avatar_5.jpg',
		name: 'Placeholder Name',
		info: 'Property Manager, Orlando',
		rating: 5,
		quote: 'Placeholder testimonial — replace with a real customer review about the cleaning service.',
	},
	{
		src: '/avatar_6.jpg',
		name: 'Placeholder Name',
		info: 'Homeowner, Tampa',
		rating: 4,
		quote: 'Placeholder testimonial — replace with a real customer review about the cleaning service.',
	},
	{
		src: '/avatar_7.jpg',
		name: 'Placeholder Name',
		info: 'Homeowner, Miami',
		rating: 5,
		quote: 'Placeholder testimonial — replace with a real customer review about the cleaning service.',
	},
	{
		src: '/avatar_8.jpg',
		name: 'Placeholder Name',
		info: 'Homeowner, Orlando',
		rating: 5,
		quote: 'Placeholder testimonial — replace with a real customer review about the cleaning service.',
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

										<p className="mt-4 flex-1 text-sm leading-relaxed text-[#1a2e3f]/70">"{review.quote}"</p>

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
