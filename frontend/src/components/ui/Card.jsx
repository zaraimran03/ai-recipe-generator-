import React from 'react';

export const Card = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-surface-container rounded-2xl p-6 border border-outline-variant/10 ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
