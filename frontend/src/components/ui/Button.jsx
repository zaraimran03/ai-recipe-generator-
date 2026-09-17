import React from 'react';

export const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseClasses = "px-6 py-2.5 rounded-full font-label-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";
  
  const variants = {
    primary: "gradient-btn text-on-primary-container shadow-lg shadow-primary/20 hover:shadow-primary/30",
    secondary: "bg-surface-variant text-on-surface hover:bg-surface-variant/80 border border-outline-variant/30",
    outline: "border-2 border-primary text-primary hover:bg-primary/10",
    ghost: "text-on-surface-variant hover:text-primary hover:bg-surface-variant/30"
  };

  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
