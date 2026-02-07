'use client';

import { motion } from 'framer-motion';

export default function LiveBackground() {
    return (
        <div className="fixed inset-0 w-full h-full -z-50 overflow-hidden bg-black pointer-events-none">
            {/* Animated Gradient Mesh */}
            <motion.div
                animate={{
                    backgroundPosition: ['0% 0%', '100% 100%'],
                }}
                transition={{
                    duration: 30,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "linear"
                }}
                className="absolute inset-0 opacity-30 w-[200%] h-[200%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-[#0a0a1a] to-black"
            />

            {/* Subtle floating particles orbs */}
            <motion.div
                animate={{
                    y: [0, -50, 0],
                    x: [0, 50, 0],
                    opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-900/20 rounded-full blur-[100px]"
            />

            <motion.div
                animate={{
                    y: [0, 50, 0],
                    x: [0, -50, 0],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                }}
                className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px]"
            />
        </div>
    );
}
