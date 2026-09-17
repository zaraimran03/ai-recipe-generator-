import React from 'react';

export const Input = ({ label, icon, error, className = '', ...props }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="font-label-md text-label-md text-on-surface-variant block ml-1">{label}</label>}
      <div className="relative group">
        <input
          className="w-full bg-surface-container-highest/30 border border-outline-variant/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 placeholder:text-outline text-on-surface"
          {...props}
        />
        {icon && (
          <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
            {icon}
          </span>
        )}
      </div>
      {error && <span className="text-error text-xs ml-1 animate-[fadeIn_0.2s_ease-in]">{error}</span>}
    </div>
  );
};

export default Input;
