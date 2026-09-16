import { useEffect } from 'react';

const SITE_URL = 'https://aliancicleaning.com';
const DEFAULT_TITLE = "Alianci Cleaning | Austin's Premium Home Cleaning";
const DEFAULT_DESCRIPTION =
	"Austin's premium home cleaning service. Book trusted, professional cleaners for your home in minutes.";
const DEFAULT_CANONICAL = `${SITE_URL}/`;

interface PageMetaOptions {
	title?: string;
	description?: string;
	path?: string;
	noIndex?: boolean;
}

export function usePageMeta({ title, description, path, noIndex }: PageMetaOptions) {
	useEffect(() => {
		document.title = title ?? DEFAULT_TITLE;

		const descriptionTag = document.querySelector('meta[name="description"]');
		descriptionTag?.setAttribute('content', description ?? DEFAULT_DESCRIPTION);

		const canonicalTag = document.querySelector('link[rel="canonical"]');
		canonicalTag?.setAttribute('href', path ? `${SITE_URL}${path}` : DEFAULT_CANONICAL);

		let robotsTag = document.querySelector('meta[name="robots"]');
		if (noIndex) {
			if (!robotsTag) {
				robotsTag = document.createElement('meta');
				robotsTag.setAttribute('name', 'robots');
				document.head.appendChild(robotsTag);
			}
			robotsTag.setAttribute('content', 'noindex, nofollow');
		} else {
			robotsTag?.remove();
		}

		return () => {
			document.title = DEFAULT_TITLE;
			descriptionTag?.setAttribute('content', DEFAULT_DESCRIPTION);
			canonicalTag?.setAttribute('href', DEFAULT_CANONICAL);
		};
	}, [title, description, path, noIndex]);
}
