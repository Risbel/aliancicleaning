import Navbar from '@/components/navbar';
import HeroSection from '@/components/hero/HeroSection';
import CapabilitiesSection from '@/components/why-us';
import AboutSection from '@/components/about/AboutSection';
import ServicesSection from '@/components/services';
import BeforeAfterSection from '@/components/before-after';
import FaqSection from '@/components/faq';
import ReviewsSection from '@/components/reviews';
import { LazyServiceAreaMap } from '@/components/service-area-map/LazyServiceAreaMap';
import Footer from '@/components/footer';
import FloatingContactButtons from '@/components/FloatingContactButtons';

export default function LandingPage() {
	return (
		<>
			<FloatingContactButtons />
			<Navbar />
			<main className="relative overflow-x-clip">
				<HeroSection />
				<CapabilitiesSection />
				<AboutSection />
				<ServicesSection />
				<BeforeAfterSection />
				<FaqSection />
				<ReviewsSection />
				<LazyServiceAreaMap />
			</main>
			<Footer />
		</>
	);
}
