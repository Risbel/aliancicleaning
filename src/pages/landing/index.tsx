import { useEffect, useRef, useState } from 'react';
import Navbar from '@/components/navbar';
import HeroSection from '@/components/hero/HeroSection';
import { DeferredSection, loadSection, type SectionLoader } from '@/components/landing/DeferredSection';
import { LazyServiceAreaMap } from '@/components/service-area-map/LazyServiceAreaMap';
import Footer from '@/components/footer';
import FloatingContactButtons from '@/components/FloatingContactButtons';

type DeferredSectionConfig = {
	id: string;
	loader: SectionLoader;
	placeholderClassName: string;
};

const deferredSections: DeferredSectionConfig[] = [
	{
		id: 'why-us',
		loader: () => import('@/components/why-us'),
		placeholderClassName: 'min-h-[1653px] bg-[#e8f8f6] md:min-h-[1032px] lg:min-h-[800px]',
	},
	{
		id: 'about',
		loader: () => import('@/components/about/AboutSection'),
		placeholderClassName: 'min-h-[1017px] bg-mint-cream md:min-h-[1189px] lg:min-h-[710px]',
	},
	{
		id: 'services',
		loader: () => import('@/components/services'),
		placeholderClassName: 'min-h-[2458px] bg-white-smoke md:min-h-[1766px] lg:min-h-[1250px]',
	},
	{
		id: 'before-after',
		loader: () => import('@/components/before-after'),
		placeholderClassName: 'min-h-[2263px] bg-white-smoke md:min-h-[1597px] lg:min-h-[1400px]',
	},
	{
		id: 'faq',
		loader: () => import('@/components/faq'),
		placeholderClassName: 'min-h-[933px] bg-white-smoke md:min-h-[809px] lg:min-h-[815px]',
	},
	{
		id: 'reviews',
		loader: () => import('@/components/reviews'),
		placeholderClassName: 'min-h-[710px] bg-white-smoke md:min-h-[717px] lg:min-h-[720px]',
	},
];

function useRevealAllOnHash() {
	const [revealAll, setRevealAll] = useState(false);
	const pendingTargetId = useRef<string | null>(null);

	useEffect(() => {
		function handleHash() {
			const targetId = decodeURIComponent(window.location.hash.slice(1));
			if (!deferredSections.some((section) => section.id === targetId)) return;

			Promise.all(deferredSections.map((section) => loadSection(section.loader))).then(
				() => {
					pendingTargetId.current = targetId;
					setRevealAll(true);
				},
				() => {},
			);
		}

		handleHash();
		window.addEventListener('hashchange', handleHash);
		return () => window.removeEventListener('hashchange', handleHash);
	}, []);

	useEffect(() => {
		if (!revealAll || !pendingTargetId.current) return;
		document.getElementById(pendingTargetId.current)?.scrollIntoView();
		pendingTargetId.current = null;
	}, [revealAll]);

	return revealAll;
}

export default function LandingPage() {
	const revealAll = useRevealAllOnHash();

	return (
		<>
			<FloatingContactButtons />
			<Navbar />
			<main className="relative overflow-x-clip">
				<HeroSection />
				{deferredSections.map((section) => (
					<DeferredSection
						key={section.id}
						id={section.id}
						loader={section.loader}
						placeholderClassName={section.placeholderClassName}
						forceRender={revealAll}
					/>
				))}
				<LazyServiceAreaMap />
			</main>
			<Footer />
		</>
	);
}
