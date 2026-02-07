'use client';

import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import AestheticSection from '@/components/landing/AestheticSection';
import LiveBackground from '@/components/landing/LiveBackground';

export default function HomePage() {
    return (
        <main className="relative bg-black min-h-screen">
            <LiveBackground />

            <HeroSection />

            <FeaturesSection />

            <AestheticSection />

            {/* Final CTA Strip */}
            <section className="py-20 bg-gradient-to-r from-primary-900 to-black text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                <div className="max-w-4xl mx-auto px-4 relative z-10">
                    <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-8">
                        Ready to Elevate Your Style?
                    </h2>
                    <a
                        href="/login"
                        className="inline-block px-10 py-4 bg-white text-black font-bold text-lg rounded-full shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:shadow-[0_0_40px_rgba(255,255,255,0.6)] hover:scale-105 transition-all duration-300"
                    >
                        Join the Elite
                    </a>
                </div>
            </section>
        </main>
    );
}
