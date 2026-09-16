import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { usePageMeta } from '@/hooks/usePageMeta';

export default function TermsPage() {
	usePageMeta({
		title: 'Terms of Service | Alianci Cleaning',
		description: "Read Alianci Cleaning's terms of service governing use of this website and bookings.",
		path: '/terms',
	});

	return (
		<>
			<Navbar />
			<main className="relative bg-white-smoke pt-32 pb-24">
				<div className="mx-auto max-w-3xl px-6 lg:px-12 xl:px-16">
					<h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Terms of Service</h1>
					<p className="mt-2 text-sm text-foreground/60">Last updated: September 15, 2026</p>

					<p className="mt-8 text-sm leading-relaxed text-foreground/80">
						These Terms of Service are a general template governing use of this website and the booking
						of cleaning services through it. They have not been reviewed by an attorney and should not
						be treated as a substitute for legal advice tailored to your business.
					</p>

					<h2 className="mt-10 text-xl font-semibold tracking-tight text-foreground">Using this site</h2>
					<p className="mt-3 text-sm leading-relaxed text-foreground/80">
						By creating an account, requesting a quote, or booking a cleaning service through this site,
						you agree to provide accurate information and to these Terms. You are responsible for
						keeping your account credentials secure.
					</p>

					<h2 className="mt-10 text-xl font-semibold tracking-tight text-foreground">Quotes and bookings</h2>
					<p className="mt-3 text-sm leading-relaxed text-foreground/80">
						Prices shown for a requested quote are estimates based on the information you provide (plan
						selected, bedrooms/bathrooms, square footage, pets, etc.). The final price may be adjusted
						by our staff after reviewing your request, and a booking is only confirmed once you accept a
						final quote.
					</p>

					<h2 className="mt-10 text-xl font-semibold tracking-tight text-foreground">Cancellations and changes</h2>
					<p className="mt-3 text-sm leading-relaxed text-foreground/80">
						If you need to cancel or reschedule a confirmed booking, contact us as soon as possible using
						the details below so we can adjust our schedule accordingly.
					</p>

					<h2 className="mt-10 text-xl font-semibold tracking-tight text-foreground">Limitation of liability</h2>
					<p className="mt-3 text-sm leading-relaxed text-foreground/80">
						We provide cleaning services with reasonable care and skill. To the extent permitted by law,
						we are not liable for indirect or incidental damages arising from the use of this site or
						our services beyond the value of the service booked.
					</p>

					<h2 className="mt-10 text-xl font-semibold tracking-tight text-foreground">Changes to these terms</h2>
					<p className="mt-3 text-sm leading-relaxed text-foreground/80">
						We may update these Terms from time to time. Continued use of this site after changes are
						posted means you accept the updated Terms.
					</p>

					<h2 className="mt-10 text-xl font-semibold tracking-tight text-foreground">Contact us</h2>
					<p className="mt-3 text-sm leading-relaxed text-foreground/80">
						If you have questions about these Terms, contact us at{' '}
						<a href="mailto:aliancicleaning@gmail.com" className="text-baltic-blue hover:underline">
							aliancicleaning@gmail.com
						</a>
						.
					</p>
				</div>
			</main>
			<Footer />
		</>
	);
}
