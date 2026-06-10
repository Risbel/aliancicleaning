import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Service {
	id: string;
	name: string;
	tagline: string;
	imageBg: string;
	popular: boolean;
	features: string[];
	cta: string;
}

interface ServiceCardProps {
	service: Service;
}

export default function ServiceCard({ service }: ServiceCardProps) {
	return (
		<Card
			className={cn(
				'overflow-hidden p-0 transition-all duration-300',
				service.popular
					? 'relative z-10 ring-2 ring-blue-600/80 shadow-xl shadow-baltic-blue/15 lg:scale-[1.045] lg:-translate-y-3'
					: 'hover:shadow-lg shadow-md',
			)}
		>
			<div className="relative">
				<div className="h-44 w-full" style={{ backgroundColor: service.imageBg }}>
					<div className="absolute inset-0 bg-linear-to-b from-transparent to-black/20" />
				</div>

				{service.popular && (
					<div className="absolute top-3 right-3">
						<span className="inline-flex items-center gap-1.5 rounded-full bg-linear-to-tr from-teal-600 to-baltic-blue px-3 py-1 text-[11px] font-semibold tracking-[0.12em] text-white shadow-md">
							<span className="size-1.5 rounded-full bg-white/70" />
							Most Popular
						</span>
					</div>
				)}
			</div>

			<CardHeader>
				<CardTitle className="text-xl font-bold text-[#1a2e3f]">{service.name}</CardTitle>
				<p className="text-sm leading-relaxed text-[#1a2e3f]/60">{service.tagline}</p>
			</CardHeader>

			<CardContent className="flex flex-col gap-4 pb-5">
				<ul className="flex flex-col gap-1">
					{service.features.map((feature) => (
						<li key={feature} className="flex items-start gap-2 text-sm text-[#1a2e3f]/80">
							<span className="mt-0.5 text-mint-leaf shrink-0">&#10003;</span>
							{feature}
						</li>
					))}
				</ul>

				<Button variant={service.popular ? 'gradient' : 'default'} size="lg" className="mt-1 w-full">
					{service.cta}
				</Button>
			</CardContent>
		</Card>
	);
}
