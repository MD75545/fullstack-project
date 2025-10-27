import React, { useState, useMemo } from 'react';

// Generate time slots from 7 AM to 10 PM (slot ends at 11 PM)
const timeSlots = Array.from({ length: 16 }, (_, i) => {
    const hour = i + 7;
    const nextHour = hour + 1;
    const formatHour = (h: number) => h.toString().padStart(2, '0');
    return `${formatHour(hour)}-${formatHour(nextHour)}`;
});

const daysOfWeekHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MyAvailability: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [availability, setAvailability] = useState<{ [date: string]: string[] }>({});

    const toISODateString = (date: Date) => date.toISOString().split('T')[0];

    const getMonthName = (monthIndex: number) => {
        return new Date(0, monthIndex).toLocaleString('default', { month: 'long' });
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleDateClick = (day: Date) => {
        if (!startDate || (startDate && endDate)) {
            setStartDate(day);
            setEndDate(null);
        } else {
            if (day.getTime() < startDate.getTime()) {
                setStartDate(day);
            } else if (day.getTime() === startDate.getTime()) {
                setStartDate(null);
                setEndDate(null);
            } else {
                setEndDate(day);
            }
        }
    };
    
    const generateCalendarDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const days: (Date | null)[] = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    };

    const isSlotSelectedInRange = (slot: string) => {
        if (!startDate) return false;
        const loopEndDate = endDate || startDate;

        for (let d = new Date(startDate.getTime()); d <= loopEndDate; d.setDate(d.getDate() + 1)) {
            const dateStr = toISODateString(new Date(d));
            if (!availability[dateStr] || !availability[dateStr].includes(slot)) {
                return false;
            }
        }
        return true;
    };

    const handleSlotToggle = (slot: string) => {
        if (!startDate) return;

        const shouldAdd = !isSlotSelectedInRange(slot);
        
        setAvailability(prev => {
            const newAvailability = { ...prev };
            const loopEndDate = endDate || startDate;
            
            for (let d = new Date(startDate.getTime()); d <= loopEndDate; d.setDate(d.getDate() + 1)) {
                const dateStr = toISODateString(new Date(d));
                const daySlots = newAvailability[dateStr] ? [...newAvailability[dateStr]] : [];
                const slotIndex = daySlots.indexOf(slot);

                if (shouldAdd) {
                    if (slotIndex === -1) daySlots.push(slot);
                } else {
                    if (slotIndex > -1) daySlots.splice(slotIndex, 1);
                }
                newAvailability[dateStr] = daySlots;
            }
            return newAvailability;
        });
    };

    const isAnySlotSelectedForRange = useMemo(() => {
        if (!startDate) return false;
        const loopEndDate = endDate || startDate;
        for (let d = new Date(startDate.getTime()); d <= loopEndDate; d.setDate(d.getDate() + 1)) {
            const dateStr = toISODateString(new Date(d));
            if (availability[dateStr] && availability[dateStr].length > 0) {
                return true;
            }
        }
        return false;
    }, [startDate, endDate, availability]);

    const handleApplyToAllWeeks = () => {
        if (!startDate) return;

        // 1. Get template schedule from the week of startDate
        const startOfWeek = new Date(startDate);
        startOfWeek.setDate(startDate.getDate() - startDate.getDay()); // Get Sunday
        
        const templateSchedule: (string[] | undefined)[] = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            const dateStr = toISODateString(day);
            templateSchedule.push(availability[dateStr]);
        }

        // 2. Apply to upcoming weeks
        setAvailability(prev => {
            const newAvailability = { ...prev };
            let currentDay = new Date(startOfWeek);
            currentDay.setDate(startOfWeek.getDate() + 7); // Start from next week's Sunday

            for (let week = 0; week < 52; week++) { // Apply for a year
                for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
                    const slots = templateSchedule[dayOfWeek];
                    const dateStr = toISODateString(currentDay);
                    if (slots && slots.length > 0) {
                        newAvailability[dateStr] = [...slots];
                    } else {
                        // If template for a day is empty/undefined, ensure it's also empty in future weeks
                        if (newAvailability[dateStr]) {
                            delete newAvailability[dateStr];
                        }
                    }
                    currentDay.setDate(currentDay.getDate() + 1);
                }
            }
            return newAvailability;
        });
        
        alert('Schedule applied to all upcoming weeks for the next year!');
    };


    const renderSelectedDateInfo = () => {
        if (!startDate) {
            return <p className="text-gray-500">Select a date from the calendar to set availability.</p>;
        }
        if (endDate) {
            return <h3 className="text-lg font-semibold text-gray-800 mb-2">Editing availability for {startDate.toLocaleDateString()} to {endDate.toLocaleDateString()}</h3>;
        }
        return <h3 className="text-lg font-semibold text-gray-800 mb-2">Editing availability for {startDate.toLocaleDateString()}</h3>;
    };
    
    const calendarDays = generateCalendarDays();

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <p className="text-gray-600 mb-6">Select a date or a range from the calendar, then choose your available time slots below.</p>
            
            <div className="flex flex-col md:flex-row gap-8">
                {/* Calendar Section */}
                <div className="w-full md:w-auto md:max-w-sm">
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-100" aria-label="Previous month">&larr;</button>
                        <h3 className="font-semibold text-lg text-gray-800" aria-live="polite">{getMonthName(currentDate.getMonth())} {currentDate.getFullYear()}</h3>
                        <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-100" aria-label="Next month">&rarr;</button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-sm">
                        {daysOfWeekHeaders.map(day => <div key={day} className="font-semibold text-gray-500" aria-hidden="true">{day}</div>)}
                        {calendarDays.map((day, index) => {
                            if (!day) return <div key={`empty-${index}`}></div>;
                            
                            const dateStr = toISODateString(day);
                            const isToday = toISODateString(new Date()) === dateStr;
                            const isSelectedStart = startDate && toISODateString(startDate) === dateStr;
                            const isSelectedEnd = endDate && toISODateString(endDate) === dateStr;
                            const isInRange = startDate && endDate && day > startDate && day < endDate;
                            const hasAvailability = availability[dateStr] && availability[dateStr].length > 0;

                            let dayClasses = 'relative p-2 rounded-full cursor-pointer transition-colors';
                            if (isToday) dayClasses += ' border border-brand-purple';
                            if (isInRange) dayClasses += ' bg-purple-100';
                            if (isSelectedStart || isSelectedEnd) dayClasses += ' bg-brand-purple text-white';
                            else if (!isInRange) dayClasses += ' hover:bg-gray-100';

                            return (
                                <button key={dateStr} onClick={() => handleDateClick(day)} className={dayClasses} aria-label={`Select date ${day.toLocaleDateString()}`}>
                                    {day.getDate()}
                                    {hasAvailability && !(isSelectedStart || isSelectedEnd) && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 bg-brand-purple rounded-full" aria-hidden="true"></div>}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Time Slots Section */}
                <div className="flex-1">
                    {renderSelectedDateInfo()}
                    <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 transition-opacity ${!startDate ? 'opacity-50 pointer-events-none' : ''}`} role="group" aria-label="Time slot selection">
                        {timeSlots.map(slot => {
                            const isSelected = isSlotSelectedInRange(slot);
                            return (
                                <div key={slot}>
                                    <input 
                                        type="checkbox" 
                                        id={slot} 
                                        className="hidden peer"
                                        checked={isSelected}
                                        onChange={() => handleSlotToggle(slot)}
                                        disabled={!startDate}
                                    />
                                    <label 
                                        htmlFor={slot} 
                                        className={`block p-2 text-center text-sm border rounded-md cursor-pointer transition-colors ${
                                            isSelected 
                                            ? 'bg-brand-purple text-white border-brand-purple' 
                                            : 'border-slate-300 hover:bg-slate-100'
                                        }`}
                                    >
                                        {slot.replace('-', ':00 - ') + ':00'}
                                    </label>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="mt-8 flex flex-wrap justify-end gap-4 border-t pt-6">
                <button
                    onClick={handleApplyToAllWeeks}
                    disabled={!isAnySlotSelectedForRange}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
                    title="Apply the selected week's schedule to all future weeks"
                >
                    Same schedule for all weeks
                </button>
                <button className="px-6 py-2 bg-brand-navy text-white rounded-md hover:bg-opacity-90 font-semibold">
                    Save Availability
                </button>
            </div>
        </div>
    );
};

export default MyAvailability;