import { useEffect, useRef, useState, type ComponentType } from 'react';

export type SectionLoader = () => Promise<{ default: ComponentType }>;

const loadedSections = new Map<SectionLoader, ComponentType>();

export function loadSection(loader: SectionLoader) {
	return loader().then((module) => {
		loadedSections.set(loader, module.default);
		return module.default;
	});
}

type DeferredSectionProps = {
	id: string;
	loader: SectionLoader;
	placeholderClassName: string;
	forceRender?: boolean;
};

export function DeferredSection({ id, loader, placeholderClassName, forceRender = false }: DeferredSectionProps) {
	const placeholderRef = useRef<HTMLDivElement>(null);
	const [isNearViewport, setIsNearViewport] = useState(false);
	const [loadedSection, setLoadedSection] = useState<ComponentType | null>(null);
	const [loadError, setLoadError] = useState<unknown>(null);

	const Section = loadedSection ?? loadedSections.get(loader) ?? null;
	const shouldRender = forceRender || isNearViewport;

	useEffect(() => {
		const element = placeholderRef.current;
		if (!element || shouldRender) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsNearViewport(true);
					observer.disconnect();
				}
			},
			{ rootMargin: '300px 0px' },
		);

		observer.observe(element);
		return () => observer.disconnect();
	}, [shouldRender]);

	useEffect(() => {
		if (!shouldRender || Section) return;
		loadSection(loader).then(
			(component) => setLoadedSection(() => component),
			(error: unknown) => setLoadError(error),
		);
	}, [shouldRender, Section, loader]);

	if (loadError) throw loadError;

	if (shouldRender && Section) return <Section />;

	return <div ref={placeholderRef} id={id} className={placeholderClassName} />;
}
