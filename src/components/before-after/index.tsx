import { cn } from '@/lib/utils';
import { Comparison, ComparisonHandle, ComparisonItem } from '@/components/ui/comparison';
import { AnimatedHeading, Reveal } from '@/components/motion/Reveal';

type ComparisonPair = {
	before: string;
	after: string;
};

const PAIRS: ComparisonPair[] = [
	{ before: '/comparizon1-01.webp', after: '/comparizon1-02.webp' },
	{ before: '/comparizon2-01.webp', after: '/comparizon2-02.webp' },
	{ before: '/comparizon3-01.webp', after: '/comparizon3-02.webp' },
	{ before: '/comparizon4-01.webp', after: '/comparizon4-02.webp' },
	{ before: '/comparizon5-01.jpg', after: '/comparizon5-02.webp' },
	{ before: '/comparizon6-01.webp', after: '/comparizon6-02.webp' },
	{ before: '/comparizon7-01.webp', after: '/comparizon7-02.webp' },
];

const LABEL_CLASS =
	'absolute top-3 z-10 rounded-full bg-white/85 px-3 py-1 text-[11px] font-semibold tracking-[0.12em] text-[#1a2e3f] backdrop-blur-sm';

function ComparisonCard({ pair, index, className }: { pair: ComparisonPair; index: number; className?: string }) {
	return (
		<Comparison className={cn('rounded-3xl border border-pale-sky shadow-sm', className)}>
			<ComparisonItem position="start">
				<span className={cn(LABEL_CLASS, 'start-3')}>BEFORE</span>
				<img
					src={pair.before}
					alt={`Cleaning job ${index + 1} before`}
					className="size-full object-cover"
					draggable={false}
					loading="lazy"
					decoding="async"
				/>
			</ComparisonItem>
			<ComparisonItem position="end">
				<span className={cn(LABEL_CLASS, 'end-3')}>AFTER</span>
				<img
					src={pair.after}
					alt={`Cleaning job ${index + 1} after`}
					className="size-full object-cover"
					draggable={false}
					loading="lazy"
					decoding="async"
				/>
			</ComparisonItem>
			<ComparisonHandle aria-label={`Before and after comparison ${index + 1}`} />
		</Comparison>
	);
}

export default function BeforeAfterSection() {
	const [featured, ...rest] = PAIRS;

	return (
		<section id="before-after" className="relative bg-white-smoke pt-8 pb-24">
			<div className="mx-auto max-w-7xl px-6 lg:px-12 xl:px-16">
				<div className="flex flex-col items-center text-center">
					<Reveal className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-baltic-blue/30 bg-baltic-blue/10 px-4 py-1.5 text-[11px] font-semibold tracking-[0.15em] text-baltic-blue">
						<span className="size-1.5 rounded-full bg-baltic-blue shadow-xs shadow-baltic-blue/60" />
						BEFORE &amp; AFTER
					</Reveal>

					<AnimatedHeading
						text="See the Difference"
						className="text-[2rem] font-bold leading-[1.1] tracking-tight text-[#1a2e3f] sm:text-[2.4rem] lg:text-[2.6rem] xl:text-[3rem]"
					/>

					<Reveal delay={0.1}>
						<p className="mt-4 max-w-xl text-sm leading-relaxed text-[#1a2e3f]/70 sm:text-base">
							Drag the slider on any photo to compare the space before and after our team got to work.
						</p>
					</Reveal>
				</div>

				<Reveal delay={0.15} className="mt-12">
					<ComparisonCard pair={featured} index={0} className="mx-auto aspect-4/3 max-w-4xl sm:aspect-video" />
				</Reveal>

				<div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{rest.map((pair, index) => (
						<Reveal key={pair.before} delay={0.05 * (index % 3)}>
							<ComparisonCard pair={pair} index={index + 1} className="aspect-4/3" />
						</Reveal>
					))}
				</div>
			</div>
		</section>
	);
}
