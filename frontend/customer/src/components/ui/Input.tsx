import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    suffix?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, suffix, className = '', ...props }, ref) => {
        return (
            <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 transition-colors">
                    {label}
                </label>
                <div className="relative">
                    <input
                        ref={ref}
                        className={`
                            w-full px-4 py-3 bg-white dark:bg-gray-800 border rounded-xl 
                            focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 
                            transition-all duration-200 outline-none 
                            text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                            disabled:opacity-50 disabled:cursor-not-allowed
                            ${error
                                ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }
                            ${suffix ? 'pr-12' : ''} 
                            ${className}
                        `}
                        {...props}
                    />
                    {suffix && (
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                            <span className="text-gray-400 dark:text-gray-500 text-sm font-medium">{suffix}</span>
                        </div>
                    )}
                </div>
                {error && (
                    <p className="mt-1.5 text-sm text-red-500 dark:text-red-400 font-medium animate-slide-down">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
