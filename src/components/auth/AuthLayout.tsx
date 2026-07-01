import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import GradientText from '@/components/ui/GradientText';
import FloatingBubble from '@/components/decorative/FloatingBubble';
import { Card, CardContent } from '@/components/ui/card';

export function AuthLayout({ title, children }: { title: string; children: ReactNode }) {
	return (
		<>
			<style>{`
				@keyframes bubble-float {
					from { transform: translateY(0px) scale(1); }
					to   { transform: translateY(-18px) scale(1.04); }
				}
			`}</style>

			<div
				className="relative flex min-h-dvh items-center justify-center overflow-hidden px-6 py-16"
				style={{
					background: 'linear-gradient(135deg, #156390 0%, #54a8d0 55%, #cbe0ea 100%)',
				}}
			>
				<FloatingBubble
					size={220}
					color="#ffffff"
					variant="filled"
					opacity={0.06}
					top="-60px"
					left="-60px"
					animationDuration="7s"
				/>
				<FloatingBubble
					size={140}
					color="#5bb286"
					variant="filled"
					opacity={0.12}
					top="10%"
					right="8%"
					animationDelay="1.2s"
					animationDuration="5.5s"
				/>
				<FloatingBubble
					size={100}
					color="#ffffff"
					variant="outline"
					opacity={0.15}
					bottom="15%"
					right="20%"
					animationDelay="1.5s"
					animationDuration="7.5s"
				/>
				<FloatingBubble
					size={55}
					color="#cde2d7"
					variant="filled"
					opacity={0.18}
					bottom="10%"
					left="12%"
					animationDelay="2s"
					animationDuration="8s"
				/>

				<div className="relative z-10 w-full max-w-md">
					<Link to="/" className="mb-8 flex items-center justify-center gap-2">
						<img
							src="/favicon/web-app-manifest-512x512.png"
							alt="Alianci Cleaning"
							className="h-10 w-10 rounded-full object-cover"
						/>
						<span className="text-lg font-semibold tracking-tight text-white">AlianciCleaning</span>
					</Link>

					<Card>
						<CardContent>
							<GradientText
								colors={['#156390', '#54a8d0', '#5bb286', '#54a8d0', '#156390']}
								animationSpeed={4}
								className="mx-0! max-w-none! justify-start! rounded-none! text-left text-2xl font-bold"
							>
								{title}
							</GradientText>

							<div className="mt-6">{children}</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</>
	);
}
