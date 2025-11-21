import React, { useState, useEffect } from 'react';

interface TimePickerProps {
  setView: (view: string) => void;
  initialValue?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  onInput?: (value: string) => void;
  disabled?: boolean;
}

export const TimePicker = ({ setView, initialValue = '00:00', placeholder = 'Selecionar horário', onChange, onInput, disabled = false }: TimePickerProps) => {
  const [time, setTime] = useState<string>(initialValue);

  useEffect(() => {
    setTime(initialValue);
  }, [initialValue]);

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setTime(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleTimeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setTime(newValue);
    if (onInput) {
      onInput(newValue);
    }
  };

  return (
    <div className="w-full relative">
      <input
        type="time"
        className="w-full p-3 px-4 border-2 border-white/10 rounded-xl bg-white/5 text-white text-base font-medium transition-all duration-200 ease-in-out outline-none appearance-none
                   focus:border-amber-500 focus:bg-white/10 focus:ring-3 focus:ring-amber-500/10
                   disabled:opacity-50 disabled:cursor-not-allowed"
        value={time}
        onChange={handleTimeChange}
        onInput={handleTimeInput}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  );
};
