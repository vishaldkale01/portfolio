import { motion, HTMLMotionProps } from 'framer-motion';
import { LoadingSpinner } from './LoadingSpinner';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'className'> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
  loadingText?: string;
  className?: string;
}

export function Button({
  children,
  variant = 'primary',
  isLoading,
  loadingText,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600',
    secondary: 'bg-gray-800 text-gray-300 hover:bg-gray-700',
    danger: 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20'
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseClasses} ${variantClasses[variant]} ${
        disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <LoadingSpinner size="sm" />
          <span>{loadingText || 'Loading...'}</span>
        </>
      ) : (
        children
      )}
    </motion.button>
  );
}