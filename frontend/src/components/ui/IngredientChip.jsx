import React from 'react';

export const IngredientChip = ({ label, onRemove, active = false, onClick }) => {
  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-label-sm border transition-all cursor-pointer
        ${active
          ? 'bg-primary/20 border-primary text-primary shadow-[0_0_12px_rgba(255,180,163,0.2)]'
          : 'border-outline-variant/30 text-on-surface-variant hover:border-primary/40 hover:text-primary'
        }`}
      onClick={onClick}
    >
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="material-symbols-outlined text-[14px] hover:text-error ml-1"
        >
          close
        </button>
      )}
    </span>
  );
};

export default IngredientChip;
