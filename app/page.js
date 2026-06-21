import Hero from "@/components/landing/Hero";
import Stats from "@/components/landing/Stats";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import CTA from "@/components/landing/CTA";
import AboutUs from "@/components/landing/AboutUs";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";
import Testimonials from "@/components/landing/Testimonials";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div id="home">
        <Hero />
      </div>
      <Stats />
      <div id="about">
        <AboutUs />
      </div>
      <div id="features">
        <Features />
      </div>
      <div id="how-it-works">
        <HowItWorks />
      </div>
      <Testimonials />
      <CTA />
      <div id="contact">
        <Footer />
      </div>
    </div>
  );
}
