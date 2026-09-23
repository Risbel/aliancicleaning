import { HugeiconsIcon } from '@hugeicons/react';
import { ImageAdd01Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/Reveal';
import { useGoToBooking } from '@/hooks/booking/use-go-to-booking';

export default function CustomServiceBanner() {
	const goToBooking = useGoToBooking();

	return (
		<Reveal delay={0.15}>
			<div className="mt-5 flex flex-col items-center gap-6 rounded-3xl border border-pale-sky bg-white p-6 text-center sm:flex-row sm:justify-between sm:gap-8 sm:text-left">
				<div className="flex items-start gap-4">
					<span className="hidden size-11 shrink-0 items-center justify-center rounded-2xl bg-mint-leaf/10 text-mint-leaf sm:flex">
						<HugeiconsIcon icon={ImageAdd01Icon} strokeWidth={1.8} className="size-5" />
					</span>
					<div>
						<h3 className="text-lg font-bold text-[#1a2e3f]">Need something else?</h3>
						<p className="mt-1 max-w-md text-sm leading-relaxed text-[#1a2e3f]/70">
							Describe the job in your own words and attach a few photos. We will review it and send you a price.
						</p>
					</div>
				</div>

				<Button variant="gradient" size="lg" className="w-full shrink-0 sm:w-auto" onClick={() => goToBooking('other')}>
					Request a Custom Quote
				</Button>
			</div>
		</Reveal>
	);
}
