'use client';

import { motion } from 'framer-motion';

export default function AestheticSection() {
    return (
        <section className="relative py-32 overflow-hidden bg-black text-white">
            <div className="absolute inset-0 opacity-30">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556906781-9a412961d289?q=80&w=2000&auto=format&fit=crop')" }}
                />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
                <div className="max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-5xl md:text-7xl font-display font-bold mb-8 leading-none">
                            Tailored to <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-600">
                                Perfection
                            </span>
                        </h2>
                        <p className="text-2xl font-light text-gray-300 mb-10 leading-relaxed border-l-4 border-yellow-500 pl-6">
                            "Style is a way to say who you are without having to speak. Make sure your statement is unforgettable."
                        </p>

                        <div className="grid grid-cols-2 gap-8 mb-12">
                            <div>
                                <h4 className="text-4xl font-bold text-white mb-2">500+</h4>
                                <p className="text-gray-400 text-sm uppercase tracking-wider">Premium Fabrics</p>
                            </div>
                            <div>
                                <h4 className="text-4xl font-bold text-white mb-2">100%</h4>
                                <p className="text-gray-400 text-sm uppercase tracking-wider">Fit Guarantee</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
