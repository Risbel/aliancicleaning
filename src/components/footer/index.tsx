import { HugeiconsIcon } from '@hugeicons/react';
import {
	Mail01Icon,
	Call02Icon,
	Facebook01Icon,
	InstagramIcon,
	Linkedin01Icon,
	NewTwitterIcon,
	YoutubeIcon,
} from '@hugeicons/core-free-icons';

const socialLinks = [
	{ icon: Facebook01Icon, label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61588506428744' },
	{
		icon: InstagramIcon,
		label: 'Instagram',
		href: 'https://l.facebook.com/l.php?u=https%3A%2F%2Fwww.instagram.com%2Faliancicleaningservices%3Ffbclid%3DIwZXh0bgNhZW0CMTAAYnJpZBExallCT3VHMVBUYUZXQUYwdHNydGMGYXBwX2lkEDIyMjAzOTE3ODgyMDA4OTIAAR5wR3tU4Ubs1y7xK7vXuNJuPjlqvjxWZk77mZtfLV8LY3dyxCPKpT-gMWO0wQ_aem_lo6pyJ7brI_jn7lIrBVC6Q&h=AUDgsb1kTKGzS3h0g4HRmRSUruF6ccUoLEGnc-5tdS22jO1RgeFj23OifXTW3R60CGQzya9b5j8m3QVpgTmLB8oG6UGmstfjOb3eoirIf5YSrb7OACBCJJkstX2uTnGy971C',
	},
	{ icon: Linkedin01Icon, label: 'LinkedIn', href: '#' },
	{ icon: NewTwitterIcon, label: 'X', href: '#' },
	{ icon: YoutubeIcon, label: 'YouTube', href: '#' },
];

export default function Footer() {
	return (
		<footer className="bg-[#0f1a24] text-[#e8edf0]">
			<div className="mx-auto max-w-7xl px-6 py-16 lg:px-12 xl:px-16">
				<div className="grid grid-cols-1 gap-12 sm:grid-cols-2">
					<div className="flex flex-col gap-6">
						<div>
							<p className="text-lg font-semibold tracking-tight text-white">Alianci Cleaning</p>
							<p className="mt-1 text-sm text-[#e8edf0]/60">Professional cleaning services you can trust.</p>
						</div>
						<div className="flex items-center gap-4">
							{socialLinks.map(({ icon, label, href }) => (
								<a
									key={label}
									href={href}
									aria-label={label}
									className="text-[#e8edf0]/50 transition-colors duration-200 hover:text-white"
								>
									<HugeiconsIcon icon={icon} size={20} strokeWidth={1.5} />
								</a>
							))}
						</div>
					</div>

					<div className="flex flex-col gap-4">
						<p className="text-xs font-semibold tracking-[0.15em] text-[#e8edf0]/40 uppercase">Contact</p>
						<a
							href="mailto:aliancicleaning@gmail.com"
							className="flex items-center gap-3 text-sm text-[#e8edf0]/70 transition-colors duration-200 hover:text-white"
						>
							<HugeiconsIcon icon={Mail01Icon} size={18} strokeWidth={1.5} />
							aliancicleaning@gmail.com
						</a>
						<a
							href="tel:+15129028518"
							className="flex items-center gap-3 text-sm text-[#e8edf0]/70 transition-colors duration-200 hover:text-white"
						>
							<HugeiconsIcon icon={Call02Icon} size={18} strokeWidth={1.5} />
							512-902-8518
						</a>
					</div>
				</div>

				<hr className="mt-12 border-white/10" />

				<div className="mt-6 flex flex-col gap-3">
					<p className="text-xs text-[#e8edf0]/40">© 2026 Alianci Cleaning Services. Todos los derechos reservados.</p>
					<div className="text-xs text-[#e8edf0]/50 flex gap-2">
						<p className="mb-2">Dev contact:</p>
						<div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
							<a href="mailto:risbel961019@gmail.com" className="hover:text-white transition-colors duration-200">
								risbel961019@gmail.com
							</a>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}
