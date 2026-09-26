import * as React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowUpRight01Icon, GoogleIcon, StarIcon } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import WaveDivider from '@/components/decorative/WaveDivider';
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselDots,
	useCarouselSelectedIndex,
	type CarouselApi,
} from '@/components/ui/carousel';
import { AnimatedHeading, Reveal } from '@/components/motion/Reveal';
import { usePublishedReviews } from '@/hooks/queries/use-reviews';
import { getReviewInitials } from '@/lib/reviews';
import type { Tables } from '@/types/supabase';

const GOOGLE_BUSINESS_ID = '0x86197c2abbefc739:0x4f91edc8f97c11db';
const GOOGLE_SEARCH_URL = 'https://www.google.com/search?q=alianci+cleaning';
const GOOGLE_WRITE_REVIEW_URL = `${GOOGLE_SEARCH_URL}#lrd=${GOOGLE_BUSINESS_ID},3,,,,`;
const GOOGLE_READ_REVIEWS_URL = `${GOOGLE_SEARCH_URL}#lrd=${GOOGLE_BUSINESS_ID},1,,,,`;

const CAROUSEL_ITEM_CLASS = 'basis-[85%] sm:basis-[60%] lg:basis-[38%] xl:basis-[32%]';

function ReviewAvatar({ review }: { review: Tables<'reviews'> }) {
	const [hasFailed, setHasFailed] = React.useState(false);

	if (!review.avatar_url || hasFailed) {
		return (
			<span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-baltic-blue/10 text-sm font-semibold text-baltic-blue">
				{getReviewInitials(review.name)}
			</span>
		);
	}

	return (
		<img
			src={review.avatar_url}
			alt={review.name}
			className="size-11 shrink-0 rounded-full object-cover"
			loading="lazy"
			referrerPolicy="no-referrer"
			onError={() => setHasFailed(true)}
		/>
	);
}

function ReviewCard({ review, isSelected }: { review: Tables<'reviews'>; isSelected: boolean }) {
	return (
		<div
			className={cn(
				'flex h-full select-none hover:cursor-pointer flex-col rounded-3xl border border-pale-sky bg-white p-6 shadow-sm transition-transform duration-300',
				isSelected ? 'scale-100' : 'scale-[0.96]',
			)}
		>
			<div className="flex items-center gap-1">
				{Array.from({ length: 5 }).map((_, index) => (
					<HugeiconsIcon
						key={index}
						icon={StarIcon}
						size={18}
						strokeWidth={0}
						className={index < review.rating ? 'fill-amber-400 text-amber-400' : 'fill-pale-sky text-pale-sky'}
					/>
				))}
			</div>

			<p className="mt-4 flex-1 line-clamp-4 text-sm leading-relaxed text-[#1a2e3f]/70">{review.quote}</p>

			<div className="mt-6 flex items-center gap-3 border-t border-pale-sky pt-4">
				<ReviewAvatar review={review} />
				<div className="flex min-w-0 flex-col">
					<span className="truncate text-sm font-semibold text-[#1a2e3f]">{review.name}</span>
					{review.reviewed_at && (
						<span className="truncate text-xs text-[#1a2e3f]/60">
							{formatDistanceToNow(new Date(`${review.reviewed_at}T00:00:00`), { addSuffix: true })}
						</span>
					)}
				</div>

				{review.review_url && (
					<a
						href={review.review_url}
						target="_blank"
						rel="noopener noreferrer"
						aria-label={`Read ${review.name}'s review on Google`}
						className="ml-auto shrink-0 rounded-full p-2 text-[#1a2e3f]/40 transition-colors hover:bg-baltic-blue/10 hover:text-baltic-blue"
					>
						<HugeiconsIcon icon={GoogleIcon} className="size-4" strokeWidth={1.5} />
					</a>
				)}
			</div>
		</div>
	);
}

function ReviewSkeletons() {
	return (
		<div className="flex gap-4 overflow-hidden py-6">
			{Array.from({ length: 3 }).map((_, index) => (
				<div key={index} className={cn('shrink-0 grow-0', CAROUSEL_ITEM_CLASS)}>
					<div className="flex h-full flex-col rounded-3xl border border-pale-sky bg-white p-6 shadow-sm">
						<Skeleton className="h-4 w-28" />
						<Skeleton className="mt-5 h-3 w-full" />
						<Skeleton className="mt-2 h-3 w-full" />
						<Skeleton className="mt-2 h-3 w-3/4" />
						<div className="mt-6 flex items-center gap-3 border-t border-pale-sky pt-4">
							<Skeleton className="size-11 shrink-0 rounded-full" />
							<div className="flex flex-col gap-2">
								<Skeleton className="h-3 w-24" />
								<Skeleton className="h-3 w-16" />
							</div>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}

export default function ReviewsSection() {
	const [api, setApi] = React.useState<CarouselApi>();
	const selectedIndex = useCarouselSelectedIndex(api);
	const { data: reviews, isLoading } = usePublishedReviews();

	return (
		<section id="reviews" className="relative bg-linear-to-b from-white-smoke to-pale-sky/60 pb-52">
			<div className="mx-auto max-w-7xl px-6 lg:px-12 xl:px-16">
				<div className="flex flex-col items-center text-center">
					<Reveal className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-baltic-blue/30 bg-baltic-blue/10 px-4 py-1.5 text-[11px] font-semibold tracking-[0.15em] text-baltic-blue">
						<span className="size-1.5 rounded-full bg-baltic-blue shadow-xs shadow-baltic-blue/60" />
						TESTIMONIALS
					</Reveal>

					<AnimatedHeading
						text="What Our Clients Say"
						className="text-[2rem] font-bold leading-[1.1] tracking-tight text-[#1a2e3f] sm:text-[2.4rem] lg:text-[2.6rem] xl:text-[3rem]"
					/>
				</div>

				{isLoading && <ReviewSkeletons />}

				{!isLoading && reviews && reviews.length > 0 && (
					<Reveal delay={0.15} className="mt-10">
						<Carousel setApi={setApi} opts={{ loop: true, align: 'center' }}>
							<CarouselContent className="py-6">
								{reviews.map((review, index) => (
									<CarouselItem key={review.id} className={CAROUSEL_ITEM_CLASS}>
										<ReviewCard review={review} isSelected={index === selectedIndex} />
									</CarouselItem>
								))}
							</CarouselContent>

							<CarouselDots />
						</Carousel>
					</Reveal>
				)}

				<Reveal delay={0.25} className="mt-6 flex items-center justify-center gap-3">
					<Button variant="default" asChild>
						<a href={GOOGLE_WRITE_REVIEW_URL} target="_blank" rel="noopener noreferrer">
							<HugeiconsIcon icon={GoogleIcon} className="size-5" strokeWidth={1.5} />
							Leave a Review
						</a>
					</Button>

					<Button variant="outline" asChild className="border-pale-sky bg-white text-[#1a2e3f]">
						<a href={GOOGLE_READ_REVIEWS_URL} target="_blank" rel="noopener noreferrer">
							See All Reviews
							<HugeiconsIcon icon={ArrowUpRight01Icon} className="size-5" strokeWidth={1.5} />
						</a>
					</Button>
				</Reveal>
			</div>
			<WaveDivider fill="#0f1a24" />
		</section>
	);
}
