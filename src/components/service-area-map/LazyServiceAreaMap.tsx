import { lazy, Suspense, useEffect, useRef, useState } from 'react';

const ServiceAreaMapSection = lazy(() => import('@/components/service-area-map'));

function Placeholder() {
	return <div className="relative z-40 min-h-[560px] bg-[#0f1a24] sm:min-h-[640px] lg:min-h-[560px]" />;
}

export function LazyServiceAreaMap() {
	const placeholderRef = useRef<HTMLDivElement>(null);
	const [isNearViewport, setIsNearViewport] = useState(false);

	useEffect(() => {
		const element = placeholderRef.current;
		if (!element || isNearViewport) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsNearViewport(true);
					observer.disconnect();
				}
			},
			{ rootMargin: '400px 0px' },
		);

		observer.observe(element);
		return () => observer.disconnect();
	}, [isNearViewport]);

	if (!isNearViewport) {
		return (
			<div ref={placeholderRef}>
				<Placeholder />
			</div>
		);
	}

	return (
		<Suspense fallback={<Placeholder />}>
			<ServiceAreaMapSection />
		</Suspense>
	);
}
