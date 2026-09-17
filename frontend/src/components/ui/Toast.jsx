import React from 'react';

export const Toast = ({ toasts, removeToast }) => (
  <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
    {toasts.map(t => (
      <div
        key={t.id}
        className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl border text-sm font-medium min-w-[260px] backdrop-blur-lg transition-all duration-300
          ${t.type === 'success' ? 'bg-surface-container-high border-tertiary/30 text-on-surface' :
            t.type === 'error' ? 'bg-error-container border-error/30 text-on-error-container' :
            'bg-surface-container-high border-outline-variant/20 text-on-surface'}`}
      >
        <span className="material-symbols-outlined text-lg">
          {t.type === 'success' ? 'check_circle' : t.type === 'error' ? 'error' : 'info'}
        </span>
        <span className="flex-1">{t.message}</span>
        <button onClick={() => removeToast(t.id)} className="material-symbols-outlined text-base opacity-60 hover:opacity-100">close</button>
      </div>
    ))}
  </div>
);

export const useToast = () => {
  const [toasts, setToasts] = React.useState([]);

  const addToast = React.useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const removeToast = React.useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
};

export default Toast;
