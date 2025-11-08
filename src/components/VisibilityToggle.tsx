import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface VisibilityToggleProps {
  isVisible: boolean;
  onChange: (isVisible: boolean) => void;
  disabled?: boolean;
}

export function VisibilityToggle({ isVisible, onChange, disabled }: VisibilityToggleProps) {
  const { theme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => onChange(!isVisible)}
      disabled={disabled}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full 
        transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${isVisible ? 'bg-blue-500' : `${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}
      `}
      aria-label={`Toggle visibility: currently ${isVisible ? 'visible' : 'hidden'}`}
    >
      <span
        className={`
          ${isVisible ? 'translate-x-6 bg-white' : 'translate-x-1 bg-gray-300 dark:bg-gray-400'}
          inline-block h-4 w-4 transform rounded-full transition-transform
        `}
      />
    </button>
  );
}