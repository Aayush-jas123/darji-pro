'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Calendar, Ruler, Sparkles, ArrowRight } from 'lucide-react'

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center"
                    >
                        <h1 className="text-6xl md:text-7xl font-display font-bold text-gray-900 mb-6">
                            Your Perfect Fit,
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
                                Powered by AI
                            </span>
                        </h1>

                        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
                            Experience the future of tailoring with AI-powered measurements,
                            smart recommendations, and seamless appointment booking.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/login" className="btn-primary inline-flex items-center gap-2">
                                Login as Customer
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link href="/login?role=tailor" className="btn-outline inline-flex items-center gap-2">
                                Login as Tailor
                                <Ruler className="w-5 h-5" />
                            </Link>
                        </div>
                    </motion.div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                    <div className="absolute top-40 right-10 w-72 h-72 bg-secondary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl font-display font-bold text-gray-900 mb-4">
                            Why Choose Darji Pro?
                        </h2>
                        <p className="text-lg text-gray-600">
                            Modern technology meets traditional craftsmanship
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Sparkles className="w-12 h-12 text-primary-600" />}
                            title="AI-Powered Recommendations"
                            description="Get personalized size predictions and fit suggestions based on your measurements"
                            delay={0.1}
                        />
                        <FeatureCard
                            icon={<Calendar className="w-12 h-12 text-primary-600" />}
                            title="Easy Appointment Booking"
                            description="Schedule your fitting sessions with our expert tailors at your convenience"
                            delay={0.2}
                        />
                        <FeatureCard
                            icon={<Ruler className="w-12 h-12 text-primary-600" />}
                            title="Precise Measurements"
                            description="Digital measurement profiles with version history and anomaly detection"
                            delay={0.3}
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl font-display font-bold text-white mb-6">
                            Ready to Experience Perfect Fit?
                        </h2>
                        <p className="text-xl text-white/90 mb-8">
                            Join thousands of satisfied customers who trust Darji Pro
                        </p>
                        <Link href="/register" className="inline-block bg-white text-primary-600 hover:bg-gray-100 font-medium px-8 py-4 rounded-lg transition-colors duration-200">
                            Get Started Today
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}

function FeatureCard({
    icon,
    title,
    description,
    delay
}: {
    icon: React.ReactNode
    title: string
    description: string
    delay: number
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            viewport={{ once: true }}
            className="card hover:shadow-xl transition-shadow duration-300"
        >
            <div className="mb-4">{icon}</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600">{description}</p>
        </motion.div>
    )
}
