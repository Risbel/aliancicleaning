import Navbar from '@/components/navbar';
import HeroSection from '@/components/hero/HeroSection';
import CapabilitiesSection from '@/components/why-us';
import AboutSection from '@/components/about/AboutSection';
import ServicesSection from '@/components/services';
import Footer from '@/components/footer';

export default function LandingPage() {
	return (
		<>
			<Navbar />
			<main className="relative">
				<HeroSection />
				<AboutSection />
				<CapabilitiesSection />
				<ServicesSection />
			</main>
			<Footer />
		</>
	);
}
