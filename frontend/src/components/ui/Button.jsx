import React from 'react';
import { cn } from '../../lib/utils';

const Button = React.forwardRef(
  ({ className, variant = 'default', size = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'btn-primary',
      glass: 'glass-button',
      outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
      ghost: 'hover:bg-white/10 text-white',
      destructive: 'bg-red-500 text-white hover:bg-red-600',
    };

    const sizes = {
      default: 'px-6 py-2',
      sm: 'px-4 py-1.5 text-sm',
      lg: 'px-8 py-3 text-lg',
      icon: 'p-2',
    };

    return (
      <button
        className={cn(
          'rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
