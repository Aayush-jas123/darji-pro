import { Clock } from 'lucide-react';

interface TimeSlotSelectorProps {
    tailorId: number;
    selectedTime: string | null;
    onTimeSelect: (time: string) => void;
    availableSlots?: string[]; // In real app, this would come from API based on date + tailor
}

export function TimeSlotSelector({ tailorId, selectedTime, onTimeSelect, availableSlots }: TimeSlotSelectorProps) {
    // Mock available slots if not provided
    // In a real implementation, these would be filtered by the backend
    const defaultSlots = [
        "10:00", "10:30", "11:00", "11:30",
        "12:00", "12:30", "14:00", "14:30",
        "15:00", "15:30", "16:00", "16:30",
        "17:00", "17:30", "18:00"
    ];

    const slots = availableSlots || defaultSlots;

    return (
        <div className="w-full">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {slots.map((time) => {
                    const isSelected = selectedTime === time;
                    return (
                        <button
                            key={time}
                            onClick={() => onTimeSelect(time)}
                            className={`
                                flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200
                                ${isSelected
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md transform scale-105'
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-sm'
                                }
                            `}
                        >
                            <Clock className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                            {time}
                        </button>
                    );
                })}
            </div>
            {slots.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    No available time slots for this date.
                </div>
            )}
        </div>
    );
}
