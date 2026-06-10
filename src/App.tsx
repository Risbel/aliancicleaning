import Navbar from '@/components/navbar';
import HeroSection from '@/components/hero/HeroSection';
import CapabilitiesSection from '@/components/capabilities';
import AboutSection from '@/components/about/AboutSection';
import Footer from '@/components/footer';

export default function App() {
	return (
		<>
			<Navbar />
			<main className="relative">
				<HeroSection />
				<AboutSection />
				<CapabilitiesSection />
        
			</main>
			<Footer />
		</>
	);
}
