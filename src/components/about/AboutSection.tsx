import * as React from 'react';
import { Button } from '@/components/ui/button';
import WaveDivider from '@/components/decorative/WaveDivider';
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselPrevious,
	CarouselNext,
	type CarouselApi,
} from '@/components/ui/carousel';

const images = [
	{ src: '/cleaning_glasses.webp', alt: 'Cleaning glasses' },
	{ src: '/cleaning_phone.webp', alt: 'Cleaning phone' },
	{ src: '/cleaning_toilet.webp', alt: 'Cleaning toilet' },
	{ src: '/cleaning-door-handles.webp', alt: 'Cleaning door handles' },
];

const checks = ['Eco Biodegradable Cleaning', 'Safe for All Your Pets'];

export default function AboutSection() {
	const [api, setApi] = React.useState<CarouselApi>();

	React.useEffect(() => {
		if (!api) return;
		const timer = setInterval(() => api.scrollNext(), 3000);
		return () => clearInterval(timer);
	}, [api]);

	return (
		<section id="about" className="relative bg-white-smoke pb-44 pt-16">
			<div className="mx-auto max-w-7xl px-6 lg:px-12 xl:px-16">
				<div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-16">
					{/* Carousel — left on desktop, bottom on mobile */}
					<div className="order-2 lg:order-1 lg:flex-1">
						<Carousel className="rounded-3xl overflow-hidden shadow" setApi={setApi} opts={{ loop: true }}>
							<CarouselContent>
								{images.map(({ src, alt }) => (
									<CarouselItem key={src} className="pl-0 h-full">
										<img src={src} alt={alt} className="h-full w-full object-cover" loading="lazy" />
									</CarouselItem>
								))}
							</CarouselContent>

							<CarouselPrevious className="left-3 translate-x-0 bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/35" />
							<CarouselNext className="right-3 translate-x-0 bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/35" />
						</Carousel>
					</div>

					{/* Text — right on desktop, top on mobile */}
					<div className="order-1 lg:order-2 lg:flex-1 flex flex-col justify-center">
						<div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-mint-leaf/30 bg-mint-leaf/10 px-4 py-1.5 text-[11px] font-semibold tracking-[0.15em] text-mint-leaf">
							<span className="size-1.5 rounded-full bg-mint-leaf shadow-xs shadow-mint-leaf/60" />
							ECO-FRIENDLY
						</div>

						<h2 className="text-[2rem] font-bold leading-[1.1] tracking-tight text-[#1a2e3f] sm:text-[2.4rem] lg:text-[2.6rem] xl:text-[3rem]">
							Eco-Conscious &<br />
							Pet-Safe Care
						</h2>

						<p className="mt-5 max-w-md text-base leading-relaxed text-[#1a2e3f]/70">
							At Alianci Cleaning Services, we protect what matters most. As a proudly eco-friendly service, our ethical
							commitment drives us to use biodegradable products that respect the environment and your pets' health,
							creating a much healthier, cleaner, and fully sustainable home for you.
						</p>

						<ul className="mt-7 flex flex-col gap-3">
							{checks.map((label) => (
								<li key={label} className="flex items-center gap-3 text-sm font-medium text-[#1a2e3f]">
									<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-mint-leaf/15">
										<svg
											className="size-3.5 text-mint-leaf"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
											strokeWidth={2.5}
										>
											<path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
										</svg>
									</span>
									✓ {label}
								</li>
							))}
						</ul>

						<div className="mt-6 flex items-center gap-4">
							<Button variant="gradient" size="lg" asChild className="rounded-4xl cursor-pointer">
								<a href="#about">Book Now ! </a>
							</Button>
							<Button variant="outline" size="lg" asChild className="rounded-4xl cursor-pointer text-black shadow">
								<a href="#about">More info</a>
							</Button>
						</div>
					</div>
				</div>
			</div>
			<WaveDivider fill="#cbfbf1" fillBack="#0cecbf" />
		</section>
	);
}
