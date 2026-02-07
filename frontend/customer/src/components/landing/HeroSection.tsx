'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function HeroSection() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background Image with Parallax-like effect */}
            <div className="absolute inset-0 z-0">
                {/* Simulated high-end video/image background */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-105"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=2000&auto=format&fit=crop')" }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="flex flex-col items-center"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8 shadow-lg"
                    >
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm font-medium tracking-wide uppercase text-yellow-100/90">
                            The Future of Bespoke Tailoring
                        </span>
                    </motion.div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold mb-6 leading-tight tracking-tight text-white drop-shadow-2xl">
                        Wear Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-100 to-yellow-400 italic">
                            Confidence
                        </span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-200 mb-10 font-light leading-relaxed drop-shadow-md">
                        Experience the perfect fusion of AI precision and master craftsmanship.
                        Your wardrobe deserves nothing less than perfection.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                        <Link href="/login" className="group relative px-8 py-4 bg-white text-black text-lg font-semibold rounded-full overflow-hidden flex items-center justify-center gap-2 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.5)] transition-all transform hover:scale-105 active:scale-95 duration-300">
                            <span className="relative z-10">Start Your Journey</span>
                            <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <Link href="/login?role=tailor" className="group px-8 py-4 bg-transparent border border-white/30 text-white text-lg font-medium rounded-full hover:bg-white/10 backdrop-blur-sm transition-all transform hover:scale-105 active:scale-95 duration-300 flex items-center justify-center gap-2">
                            For Tailors
                        </Link>
                    </div>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60"
            >
                <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-white to-transparent" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-white">Scroll</span>
            </motion.div>
        </section>
    );
}
