import { Clock } from 'lucide-react';

interface AvailabilitySlot {
    start_time: string;
    end_time: string;
    is_available: boolean;
}

interface TimeSlotSelectorProps {
    tailorId: number;
    selectedTime: string | null;
    onTimeSelect: (time: string) => void;
    availableSlots?: AvailabilitySlot[];
}

export function TimeSlotSelector({ tailorId, selectedTime, onTimeSelect, availableSlots }: TimeSlotSelectorProps) {
    // Helper to format time from ISO string or keep as is if already HH:MM
    const formatTime = (isoString: string) => {
        try {
            const date = new Date(isoString);
            if (isNaN(date.getTime())) return isoString; // Fallback if not a date
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        } catch (e) {
            return isoString;
        }
    };

    // If availableSlots is provided, use it. Otherwise use default (for initial loading/fallback)
    // In real app, we should probably show loading state if slots aren't ready
    const slots = availableSlots || [];

    if (availableSlots && availableSlots.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No available time slots for this date.
            </div>
        );
    }

    // Default slots for when no availability data is present yet (or error)
    // checking if we have availability data to render, otherwise render nothing or loading
    if (!availableSlots) {
        return (
            <div className="text-center py-8 text-gray-500">
                Select a date to view available time slots.
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {slots.map((slot, index) => {
                    const timeLabel = formatTime(slot.start_time);
                    const isSelected = selectedTime === timeLabel;
                    const isAvailable = slot.is_available;

                    return (
                        <button
                            key={index}
                            onClick={() => isAvailable && onTimeSelect(timeLabel)}
                            disabled={!isAvailable}
                            className={`
                                flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200
                                ${!isAvailable
                                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed border border-gray-100 dark:border-gray-800'
                                    : isSelected
                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md transform scale-105'
                                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-sm'
                                }
                            `}
                        >
                            <Clock className={`w-4 h-4 ${!isAvailable ? 'text-gray-300' : isSelected ? 'text-white' : 'text-gray-400'}`} />
                            {timeLabel}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
