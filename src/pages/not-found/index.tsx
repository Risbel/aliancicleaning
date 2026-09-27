import { Link } from 'react-router-dom';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { usePageMeta } from '@/hooks/usePageMeta';

export default function NotFoundPage() {
	usePageMeta({
		title: 'Page not found | Alianci Cleaning',
		noIndex: true,
	});

	return (
		<>
			<Navbar />
			<main className="relative bg-white-smoke pt-32 pb-24">
				<div className="mx-auto flex max-w-3xl flex-col items-center px-6 text-center lg:px-12 xl:px-16">
					<p className="text-sm font-semibold tracking-[0.15em] text-baltic-blue">404</p>
					<h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Page not found</h1>
					<p className="mt-4 max-w-md text-sm leading-relaxed text-foreground/80">
						The page you are looking for does not exist or has been moved.
					</p>
					<Button asChild variant="gradient" size="lg" className="mt-8">
						<Link to="/">Back to home</Link>
					</Button>
				</div>
			</main>
			<Footer />
		</>
	);
}
