import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Clock } from 'lucide-react';

interface TimePickerProps {
    value: string; // datetime-local format: "2024-12-04T14:30"
    onChange: (value: string) => void;
    required?: boolean;
    className?: string;
}

export const TimePicker: React.FC<TimePickerProps> = ({
    value,
    onChange,
    required = false,
    className = ""
}) => {
    // Parse the datetime-local value
    const dateValue = value ? value.split('T')[0] : '';
    const timeValue = value ? value.split('T')[1] || '' : '';

    // Generate time slots (9 AM to 9 PM, 30-minute intervals)
    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 9; hour <= 21; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                const displayTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                });
                slots.push({ value: timeString, label: displayTime });
            }
        }
        return slots;
    };

    const timeSlots = generateTimeSlots();

    const handleDateChange = (newDate: string) => {
        const newDateTime = newDate && timeValue ? `${newDate}T${timeValue}` : newDate;
        onChange(newDateTime);
    };

    const handleTimeChange = (newTime: string) => {
        const newDateTime = dateValue && newTime ? `${dateValue}T${newTime}` : '';
        onChange(newDateTime);
    };

    return (
        <div className={`space-y-3 ${className}`}>
            {/* Date Selection */}
            <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date
                </Label>
                <Input
                    type="date"
                    value={dateValue}
                    onChange={(e) => handleDateChange(e.target.value)}
                    required={required}
                    className="w-fit max-w-[160px]"
                    min={new Date().toISOString().split('T')[0]} // Prevent past dates
                />
            </div>

            {/* Time Selection */}
            <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Time
                </Label>
                <Select value={timeValue} onValueChange={handleTimeChange} required={required}>
                    <SelectTrigger className="w-fit max-w-[140px]">
                        <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                        {timeSlots.map((slot) => (
                            <SelectItem key={slot.value} value={slot.value}>
                                {slot.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
};