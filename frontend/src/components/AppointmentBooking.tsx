import React, { useState } from 'react';
import { User, TimeSlot } from '../types/auth';
import { AppointmentService } from '../services/appointmentService';
import { useToast } from '../contexts/ToastContext';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface AppointmentBookingProps {
  mentor: User;
  onBookingSuccess?: () => void;
  onCancel?: () => void;
}

export const AppointmentBooking: React.FC<AppointmentBookingProps> = ({
  mentor,
  onBookingSuccess,
  onCancel,
}) => {
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { error: showError, success: showSuccess } = useToast();

  const handleBookAppointment = async () => {
    if (!selectedSlot || !selectedDate) {
      showError('Please select a date and time slot');
      return;
    }

    setIsLoading(true);
    try {
      const datetime = `${selectedDate}T${selectedSlot.startTime}:00`;
      await AppointmentService.createAppointment({
        mentorId: mentor.id,
        datetime,
      });
      
      showSuccess('Appointment request sent successfully!');
      onBookingSuccess?.();
    } catch (error: any) {
      showError(error.message || 'Failed to book appointment');
    } finally {
      setIsLoading(false);
    }
  };

  const getNextWeekDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'short', 
          day: 'numeric' 
        }),
        dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
      });
    }
    
    return dates;
  };

  const availableDates = getNextWeekDates();
  const availableSlots = mentor.availabilitySlots || [];

  const getSlotsForSelectedDate = () => {
    if (!selectedDate) return [];
    
    const selectedDateObj = availableDates.find(d => d.value === selectedDate);
    if (!selectedDateObj) return [];
    
    return availableSlots.filter(slot => slot.day === selectedDateObj.dayName);
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Book Appointment with {mentor.name}</h3>
      
      {/* Date Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Date
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {availableDates.map((date) => (
            <button
              key={date.value}
              onClick={() => {
                setSelectedDate(date.value);
                setSelectedSlot(null); // Reset slot selection when date changes
              }}
              className={`p-3 text-sm border rounded-lg transition-colors ${
                selectedDate === date.value
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
              }`}
            >
              {date.label}
            </button>
          ))}
        </div>
      </div>

      {/* Time Slot Selection */}
      {selectedDate && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Time Slot
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {getSlotsForSelectedDate().map((slot, index) => (
              <button
                key={index}
                onClick={() => setSelectedSlot(slot)}
                className={`p-3 text-sm border rounded-lg transition-colors ${
                  selectedSlot === slot
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                }`}
              >
                {slot.startTime} - {slot.endTime}
              </button>
            ))}
          </div>
          
          {getSlotsForSelectedDate().length === 0 && (
            <p className="text-gray-500 text-sm">
              No available slots for this date
            </p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleBookAppointment}
          disabled={!selectedSlot || !selectedDate || isLoading}
          isLoading={isLoading}
          className="flex-1"
        >
          Book Appointment
        </Button>
        {onCancel && (
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}
      </div>
    </Card>
  );
};