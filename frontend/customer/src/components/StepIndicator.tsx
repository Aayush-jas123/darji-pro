import { Check } from 'lucide-react';

interface Step {
    id: number;
    label: string;
}

interface StepIndicatorProps {
    steps: Step[];
    currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
    return (
        <div className="w-full py-4">
            <div className="flex items-center justify-between relative">
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 dark:bg-gray-700 -z-10 rounded-full" />
                <div
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-gradient-to-r from-blue-600 to-purple-600 -z-10 rounded-full transition-all duration-500 ease-in-out"
                    style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((step) => {
                    const isCompleted = currentStep > step.id;
                    const isCurrent = currentStep === step.id;
                    const isPending = currentStep < step.id;

                    return (
                        <div key={step.id} className="flex flex-col items-center">
                            <div
                                className={`
                                    w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-4
                                    ${isCompleted
                                        ? 'bg-green-500 border-green-500 text-white scale-100'
                                        : isCurrent
                                            ? 'bg-white dark:bg-gray-800 border-blue-600 text-blue-600 scale-110 shadow-lg'
                                            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400 scale-100'
                                    }
                                `}
                            >
                                {isCompleted ? (
                                    <Check className="w-6 h-6" />
                                ) : (
                                    <span className="text-sm font-bold">{step.id}</span>
                                )}
                            </div>
                            <span
                                className={`
                                    mt-2 text-xs font-semibold uppercase tracking-wider transition-colors duration-300 absolute -bottom-8 w-32 text-center
                                    ${isCompleted ? 'text-green-600 dark:text-green-400' :
                                        isCurrent ? 'text-blue-600 dark:text-blue-400' :
                                            'text-gray-400 dark:text-gray-500'}
                                `}
                            >
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
            <div className="h-8" /> {/* Spacer for labels */}
        </div>
    );
}
