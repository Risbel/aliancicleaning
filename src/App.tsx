import Navbar from "@/components/navbar";
import HeroSection from "@/components/hero/HeroSection";
import CapabilitiesSection from "@/components/capabilities";
import Footer from "@/components/footer";

export default function App() {
  return (
    <>
      <Navbar />
      <main className="relative">
        <HeroSection />
        <CapabilitiesSection />
        <section id="services" className="flex min-h-screen items-center justify-center bg-muted">
          <h2 className="text-3xl font-bold">Our Services</h2>
        </section>
        <section id="booking" className="flex min-h-screen items-center justify-center">
          <h2 className="text-3xl font-bold">Book a Cleaning</h2>
        </section>
        <section id="about" className="flex min-h-screen items-center justify-center bg-muted">
          <h2 className="text-3xl font-bold">About Us</h2>
        </section>
      </main>
      <Footer />
    </>
  );
}
