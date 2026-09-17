import React, { useState } from 'react';

export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal content */}
      <div className="relative z-10 w-full max-w-lg bg-surface-container-low/95 backdrop-blur-[30px] border border-border-subtle/10 rounded-2xl shadow-[0_40px_80px_rgba(255,126,95,0.1)] p-8 animate-[float_0.3s_ease-out]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-headline-md text-on-surface">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-all"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
