import Calendar from 'react-calendar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
// Using inline styled-jsx for clean single-file component

interface BookingCalendarProps {
    selectedDate: Date | null;
    onDateSelect: (date: Date) => void;
    minDate?: Date;
    maxDate?: Date;
}

export function BookingCalendar({ selectedDate, onDateSelect, minDate, maxDate }: BookingCalendarProps) {
    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <style jsx global>{`
                .react-calendar {
                    width: 100%;
                    background: transparent;
                    border: none;
                    font-family: inherit;
                }
                .react-calendar__navigation {
                    display: flex;
                    margin-bottom: 1rem;
                }
                .react-calendar__navigation button {
                    min-width: 44px;
                    background: none;
                    font-size: 1.1rem;
                    font-weight: 600;
                    margin-top: 8px;
                }
                .react-calendar__navigation button:disabled {
                    background-color: transparent;
                }
                .react-calendar__month-view__weekdays {
                    text-align: center;
                    text-transform: uppercase;
                    font-weight: bold;
                    font-size: 0.75em;
                    color: #9ca3af; /* gray-400 */
                    margin-bottom: 0.5rem;
                }
                .react-calendar__month-view__days__day {
                    padding: 8px;
                    background: transparent;
                    font-size: 0.9rem;
                    font-weight: 500;
                    color: #374151; /* gray-700 */
                }
                .dark .react-calendar__month-view__days__day {
                    color: #d1d5db; /* gray-300 */
                }
                .react-calendar__tile {
                    border-radius: 8px;
                    transition: all 0.2s;
                    height: 48px;
                    display: flex;
                    items-center;
                    justify-content: center;
                }
                .react-calendar__tile:enabled:hover,
                .react-calendar__tile:enabled:focus {
                    background-color: #f3f4f6; /* gray-100 */
                    color: #111827;
                }
                .dark .react-calendar__tile:enabled:hover,
                .dark .react-calendar__tile:enabled:focus {
                    background-color: #374151; /* gray-700 */
                    color: #fff;
                }
                .react-calendar__tile--now {
                    background: transparent;
                    color: #2563eb; /* blue-600 */
                    font-weight: bold;
                    border: 1px solid #2563eb;
                }
                .dark .react-calendar__tile--now {
                    color: #60a5fa; /* blue-400 */
                    border-color: #60a5fa;
                }
                .react-calendar__tile--active {
                    background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%) !important;
                    color: white !important;
                    border: none !important;
                    box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3);
                }
                .react-calendar__tile:disabled {
                    background-color: transparent;
                    color: #d1d5db; /* gray-300 */
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .dark .react-calendar__tile:disabled {
                    color: #4b5563; /* gray-600 */
                }
                /* Hide double arrows */
                .react-calendar__navigation__prev2-button,
                .react-calendar__navigation__next2-button {
                    display: none;
                }
            `}</style>

            <Calendar
                onChange={(value) => onDateSelect(value as Date)}
                value={selectedDate}
                minDate={minDate || new Date()}
                maxDate={maxDate}
                view="month"
                prevLabel={<ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />}
                nextLabel={<ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />}
                formatShortWeekday={(locale, date) => ['S', 'M', 'T', 'W', 'T', 'F', 'S'][date.getDay()]}
            />
        </div>
    );
}
