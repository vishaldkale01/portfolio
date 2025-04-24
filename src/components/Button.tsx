import { ButtonHTMLAttributes } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { useTheme } from '../context/ThemeContext';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loadingText?: string;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const { theme } = useTheme();

  const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const variantStyles = {
    primary: `bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 focus:ring-blue-400 ${
      theme === 'dark' ? 'focus:ring-offset-gray-900' : 'focus:ring-offset-white'
    }`,
    secondary: `${
      theme === 'dark'
        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 active:bg-gray-500'
        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 active:bg-gray-400'
    } focus:ring-gray-400`,
    danger: 'bg-red-500/10 text-red-500 hover:bg-red-500/20 active:bg-red-500/30 focus:ring-red-400'
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <LoadingSpinner size="sm" className="mr-2" />
          <span>{loadingText || children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}