import Navbar from '@/components/navbar';
import HeroSection from '@/components/hero/HeroSection';
import CapabilitiesSection from '@/components/why-us';
import AboutSection from '@/components/about/AboutSection';
import ServicesSection from '@/components/services';
import ReviewsSection from '@/components/reviews';
import Footer from '@/components/footer';
import FloatingContactButtons from '@/components/FloatingContactButtons';

export default function LandingPage() {
	return (
		<>
			<FloatingContactButtons />
			<Navbar />
			<main className="relative">
				<HeroSection />
				<AboutSection />
				<CapabilitiesSection />
				<ServicesSection />
				<ReviewsSection />
			</main>
			<Footer />
		</>
	);
}
