import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navLinks = [
	{ label: 'Home', href: '#home' },
	{ label: 'About', href: '#about' },
	{ label: 'Services', href: '#services' },
	{ label: 'Booking', href: '#booking' },
];

export default function Navbar() {
	const [open, setOpen] = useState(false);

	return (
		<>
			{/* Desktop: floating pill */}
			<header className="fixed top-5 left-1/2 z-50 -translate-x-1/2 hidden md:flex h-13 items-center gap-2 rounded-full px-2 bg-linear-to-r from-blue-950/70 to-baltic-blue/50 backdrop-blur-md border border-white/20 shadow-lg shadow-black/15">
				<a href="/" className="flex items-center gap-2">
					<img
						src="/favicon/web-app-manifest-512x512.png"
						alt="Alianci Cleaning"
						className="h-9 w-9 rounded-full object-cover"
					/>
					<span className="text-md font-semibold tracking-tight text-white">AlianciCleaning</span>
				</a>

				<div className="mx-1 h-5 w-px bg-white/25" />

				<nav className="flex items-center gap-1">
					{navLinks.map((link) => (
						<a
							key={link.href}
							href={link.href}
							className="rounded-full px-3.5 py-1.5 text-[13px] font-medium text-white hover:text-white hover:bg-white/12 transition-all duration-200"
						>
							{link.label}
						</a>
					))}
				</nav>

				<Button asChild variant="gradient" size="sm">
					<a href="#booking">Book Now</a>
				</Button>
			</header>

			{/* Mobile: full-width fixed */}
			<header className="fixed top-0 left-0 right-0 z-50 md:hidden bg-linear-to-r from-baltic-blue/90 to-fresh-sky/80 backdrop-blur-md border-b border-white/15 shadow-lg shadow-black/10">
				<div className="flex h-14 items-center justify-between px-5">
					<a href="/" className="flex items-center gap-2">
						<img
							src="/favicon/web-app-manifest-512x512.png"
							alt="Alianci Cleaning"
							className="h-8 w-8 rounded-full object-cover"
						/>
						<span className="text-[15px] font-bold tracking-tight text-white">AlianciCleaning</span>
					</a>

					<button
						type="button"
						className="flex items-center justify-center w-9 h-9 rounded-full text-white/80 hover:text-white hover:bg-white/12 transition-all duration-200 relative"
						onClick={() => setOpen(!open)}
						aria-label={open ? 'Close menu' : 'Open menu'}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2.2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className={cn(
								'absolute transition-all duration-200',
								open ? 'opacity-0 scale-75' : 'opacity-100 scale-100',
							)}
						>
							<line x1="4" x2="20" y1="8" y2="8" />
							<line x1="4" x2="20" y1="16" y2="16" />
						</svg>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2.2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className={cn(
								'absolute transition-all duration-200',
								open ? 'opacity-100 scale-100' : 'opacity-0 scale-75',
							)}
						>
							<path d="M18 6 6 18" />
							<path d="m6 6 12 12" />
						</svg>
					</button>
				</div>

				<div className={cn('overflow-hidden transition-all duration-300 ease-in-out', open ? 'max-h-80' : 'max-h-0')}>
					<nav className="px-3 pb-4 space-y-0.5">
						{navLinks.map((link) => (
							<a
								key={link.href}
								href={link.href}
								className="block rounded-xl px-4 py-3 text-[15px] font-medium text-white hover:text-white hover:bg-white/10 transition-colors"
								onClick={() => setOpen(false)}
							>
								{link.label}
							</a>
						))}
						<div className="pt-2 px-1">
							<Button asChild variant="gradient" size="lg" className="w-full">
								<a href="#booking" onClick={() => setOpen(false)}>
									Book Now
								</a>
							</Button>
						</div>
					</nav>
				</div>
			</header>
		</>
	);
}
