'use client';

import { motion } from 'framer-motion';
import { Ruler, Shield, Sparkles, Zap } from 'lucide-react';

const features = [
    {
        icon: <Ruler className="w-8 h-8 text-yellow-400" />,
        title: "AI-Powered Precision",
        description: "Our algorithms analyze your unique body metrics to guarantee a fit that feels like a second skin."
    },
    {
        icon: <Shield className="w-8 h-8 text-yellow-400" />,
        title: "Master Craftsmanship",
        description: "Every stitch is placed with intention by seasoned artisans who understand the language of fabric."
    },
    {
        icon: <Zap className="w-8 h-8 text-yellow-400" />,
        title: "Seamless Experience",
        description: "From booking to delivery, enjoy a frictionless journey designed for the modern gentleman."
    }
];

export default function FeaturesSection() {
    return (
        <section className="py-24 bg-gray-950 text-white relative overflow-hidden">
            {/* Background Gradient Orbs */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-900/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary-900/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-20"
                >
                    <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Why Settle for Average?
                    </h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        In a world of fast fashion, <span className="text-white font-medium">stand out</span> with bespoke tailoring that commands respect.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.2 }}
                            className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 p-8 rounded-2xl hover:border-yellow-500/30 hover:bg-gray-800/80 transition-all duration-300 group"
                        >
                            <div className="bg-gray-800 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-black/50">
                                {feature.icon}
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-yellow-400 transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
