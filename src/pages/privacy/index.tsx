import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { usePageMeta } from '@/hooks/usePageMeta';

export default function PrivacyPage() {
	usePageMeta({
		title: 'Privacy Policy | Alianci Cleaning',
		description: "Read Alianci Cleaning's privacy policy on how we collect and use your information.",
		path: '/privacy',
	});

	return (
		<>
			<Navbar />
			<main className="relative bg-white-smoke pt-32 pb-24">
				<div className="mx-auto max-w-3xl px-6 lg:px-12 xl:px-16">
					<h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Privacy Policy</h1>
					<p className="mt-2 text-sm text-foreground/60">Last updated: September 15, 2026</p>

					<p className="mt-8 text-sm leading-relaxed text-foreground/80">
						This Privacy Policy is a general template describing how Alianci Cleaning Services ("Alianci
						Cleaning", "we", "us") collects and uses information through this website. It has not been
						reviewed by an attorney and should not be treated as a substitute for legal advice tailored
						to your business.
					</p>

					<h2 className="mt-10 text-xl font-semibold tracking-tight text-foreground">Information we collect</h2>
					<p className="mt-3 text-sm leading-relaxed text-foreground/80">
						When you create an account, request a quote, or book a cleaning service, we may collect your
						name, email address, phone number, service address, and details about the requested cleaning
						(plan selected, bedrooms/bathrooms, square footage, preferred date, and any notes you
						provide). If you sign in with Google, we receive your name and email address from Google to
						create and access your account.
					</p>

					<h2 className="mt-10 text-xl font-semibold tracking-tight text-foreground">How we use your information</h2>
					<p className="mt-3 text-sm leading-relaxed text-foreground/80">
						We use this information to create and manage your account, prepare and send you cleaning
						quotes, schedule and fulfill bookings, communicate with you about your service, and respond
						to inquiries. We do not sell your personal information to third parties.
					</p>

					<h2 className="mt-10 text-xl font-semibold tracking-tight text-foreground">Service providers</h2>
					<p className="mt-3 text-sm leading-relaxed text-foreground/80">
						We use third-party providers to operate this site: Supabase for account authentication and
						data storage, Google for optional sign-in, and Resend for sending transactional emails such
						as quote confirmations. These providers process data on our behalf and only to the extent
						necessary to provide their service to us.
					</p>

					<h2 className="mt-10 text-xl font-semibold tracking-tight text-foreground">Data retention</h2>
					<p className="mt-3 text-sm leading-relaxed text-foreground/80">
						We retain account, booking, and quote information for as long as your account is active or
						as needed to provide our services, comply with legal obligations, and resolve disputes.
					</p>

					<h2 className="mt-10 text-xl font-semibold tracking-tight text-foreground">Your choices</h2>
					<p className="mt-3 text-sm leading-relaxed text-foreground/80">
						You may request access to, correction of, or deletion of your personal information by
						contacting us using the details below.
					</p>

					<h2 className="mt-10 text-xl font-semibold tracking-tight text-foreground">Contact us</h2>
					<p className="mt-3 text-sm leading-relaxed text-foreground/80">
						If you have questions about this Privacy Policy, contact us at{' '}
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
