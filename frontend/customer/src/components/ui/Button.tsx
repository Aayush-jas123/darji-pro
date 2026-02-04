import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline';
    isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ children, variant = 'primary', isLoading, className = '', ...props }, ref) => {
        const baseStyles = 'inline-flex items-center justify-center font-medium px-6 py-3 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

        const variants = {
            primary: 'bg-primary-600 hover:bg-primary-700 text-white dark:bg-primary-500 dark:hover:bg-primary-600',
            secondary: 'bg-secondary-600 hover:bg-secondary-700 text-white dark:bg-secondary-500 dark:hover:bg-secondary-600',
            outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-950/50'
        };

        return (
            <button
                ref={ref}
                className={`${baseStyles} ${variants[variant]} ${className}`}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';
