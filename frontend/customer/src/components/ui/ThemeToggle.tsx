'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        // Check local storage or system preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            setTheme('dark');
            document.documentElement.classList.add('dark');
        } else {
            setTheme('light');
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const toggleTheme = () => {
        if (theme === 'light') {
            setTheme('dark');
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            setTheme('light');
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Toggle theme"
        >
            {theme === 'light' ? (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
                <Sun className="w-5 h-5 text-yellow-500" />
            )}
        </button>
    );
}
