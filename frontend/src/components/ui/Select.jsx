import React, { useState, useRef, useEffect } from 'react';

/**
 * Custom modern Dropdown / Select component with glassmorphic aesthetics,
 * custom icons, option descriptions, smooth micro-animations, and full accessibility.
 */
export const Select = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  icon,
  helperText,
  disabled = false,
  className = '',
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Selected option details
  const selectedOption = options.find((opt) =>
    typeof opt === 'object' ? opt.value === value : opt === value
  );

  const selectedLabel = selectedOption
    ? typeof selectedOption === 'object'
      ? selectedOption.label
      : selectedOption
    : '';

  const selectedIcon =
    selectedOption && typeof selectedOption === 'object' ? selectedOption.icon : null;

  const handleSelect = (optionValue) => {
    onChange?.(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`space-y-1.5 ${className}`} ref={containerRef}>
      {label && (
        <label
          htmlFor={id}
          className="font-label-md text-label-md text-on-surface-variant flex items-center justify-between"
        >
          <span>{label}</span>
        </label>
      )}

      <div className="relative">
        {/* Trigger Button */}
        <button
          type="button"
          id={id}
          disabled={disabled}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-200 outline-none select-none ${
            isOpen
              ? 'bg-surface-container-high border-primary ring-2 ring-primary/30 shadow-lg shadow-primary/5'
              : 'bg-surface-container-highest/30 border-outline-variant/30 hover:border-outline-variant hover:bg-surface-container-highest/50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} text-on-surface`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <div className="flex items-center gap-3 min-w-0">
            {icon && (
              <span
                className={`material-symbols-outlined text-[20px] transition-colors shrink-0 ${
                  isOpen ? 'text-primary' : 'text-outline'
                }`}
              >
                {icon}
              </span>
            )}

            <div className="flex items-center gap-2 truncate">
              {selectedIcon && (
                <span className="material-symbols-outlined text-[18px] text-primary/80 shrink-0">
                  {selectedIcon}
                </span>
              )}
              <span
                className={`truncate font-body-md ${
                  selectedLabel ? 'text-on-surface font-medium' : 'text-outline'
                }`}
              >
                {selectedLabel || placeholder}
              </span>
            </div>
          </div>

          <span
            className={`material-symbols-outlined text-[20px] text-outline shrink-0 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-primary' : ''
            }`}
          >
            expand_more
          </span>
        </button>

        {/* Floating Dropdown Menu */}
        {isOpen && (
          <div
            role="listbox"
            className="absolute left-0 right-0 mt-2 z-50 max-h-72 overflow-y-auto rounded-2xl bg-surface-container-high/95 backdrop-blur-xl border border-outline-variant/40 shadow-2xl p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150 origin-top"
          >
            {options.map((opt, idx) => {
              const optVal = typeof opt === 'object' ? opt.value : opt;
              const optLabel = typeof opt === 'object' ? opt.label : opt;
              const optIcon = typeof opt === 'object' ? opt.icon : null;
              const optDesc = typeof opt === 'object' ? opt.description : null;
              const isSelected = optVal === value;

              return (
                <button
                  key={`${optVal}-${idx}`}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(optVal)}
                  className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all duration-150 group cursor-pointer ${
                    isSelected
                      ? 'bg-primary/15 text-primary font-medium'
                      : 'text-on-surface hover:bg-surface-container-highest/70 hover:text-on-surface'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {optIcon && (
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-primary/20 text-primary'
                            : 'bg-surface-container text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {optIcon}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="truncate text-body-md font-medium flex items-center gap-2">
                        <span>{optLabel}</span>
                      </div>
                      {optDesc && (
                        <p
                          className={`text-xs truncate transition-colors ${
                            isSelected
                              ? 'text-primary/70'
                              : 'text-on-surface-variant/70 group-hover:text-on-surface-variant'
                          }`}
                        >
                          {optDesc}
                        </p>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <span className="material-symbols-outlined text-[18px] text-primary shrink-0 animate-in zoom-in-75">
                      check
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {helperText && (
        <p className="text-xs text-on-surface-variant/80 pl-1">{helperText}</p>
      )}
    </div>
  );
};

export default Select;
