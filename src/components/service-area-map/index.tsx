import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Circle, CircleMarker } from 'react-leaflet';
import { AnimatedHeading, Reveal } from '@/components/motion/Reveal';

const SERVICE_AREA_CENTER: [number, number] = [30.4140535, -97.7491735];
const SERVICE_RADIUS_METERS = 40233;

export default function ServiceAreaMapSection() {
	return (
		<section id="service-area" className="bg-[#0f1a24] z-40 relative">
			<div className="mx-auto max-w-7xl px-6 pt-8 pb-8 lg:px-12 xl:px-16">
				<div className="flex flex-col items-center text-center">
					<Reveal className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-1.5 text-[11px] font-semibold tracking-[0.15em] text-fresh-sky">
						<span className="size-1.5 rounded-full bg-mint-leaf shadow-sm shadow-mint-leaf/60" />
						Where We Work
					</Reveal>

					<AnimatedHeading
						text="Proudly Serving Austin, TX & Surrounding Areas"
						className="text-[2rem] font-bold leading-[1.1] tracking-tight text-[#e8edf0] sm:text-[2.4rem] lg:text-[2.6rem] xl:text-[3rem]"
					/>

					<Reveal delay={0.2}>
						<p className="mt-2 max-w-lg text-xs leading-relaxed text-[#e8edf0]/60">
							We travel within roughly 25 miles of downtown Austin — if you're nearby, we've probably already got you covered.
						</p>
					</Reveal>
				</div>
			</div>

			<Reveal>
				<MapContainer
					center={SERVICE_AREA_CENTER}
					zoom={9}
					scrollWheelZoom={false}
					className="h-[400px] w-full sm:h-[480px] lg:h-[400px]"
				>
					<TileLayer
						url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
						attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					/>
					<Circle
						center={SERVICE_AREA_CENTER}
						radius={SERVICE_RADIUS_METERS}
						pathOptions={{ color: '#156390', weight: 2, fillColor: '#5bb286', fillOpacity: 0.15 }}
					/>
					<CircleMarker
						center={SERVICE_AREA_CENTER}
						radius={6}
						pathOptions={{ color: '#156390', fillColor: '#156390', fillOpacity: 1 }}
					/>
				</MapContainer>
			</Reveal>
		</section>
	);
}
