import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';

export const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const resetToken = location.state?.resetToken;
  
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  React.useEffect(() => {
    if (!resetToken) {
      navigate('/login');
    }
  }, [resetToken, navigate]);

  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  
  const newPassword = watch("new_password");

  const onSubmit = async (data) => {
    try {
      setStatus({ type: '', message: '' });
      setLoading(true);
      const response = await api.post('/auth/reset-password/', { 
        resetToken, 
        new_password: data.new_password 
      });
      setStatus({ type: 'success', message: response.data.message });
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Something went wrong.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-surface-container rounded-2xl p-8 shadow-xl border border-outline-variant/10">
        <div className="text-center mb-8">
          <h2 className="font-headline-lg text-headline-lg mb-2">Create New Password</h2>
          <p className="text-on-surface-variant text-body-md">Enter your new password below.</p>
        </div>

        {status.message && (
          <div className={`p-4 rounded-lg mb-6 text-sm ${status.type === 'error' ? 'bg-error-container text-on-error-container' : 'bg-primary-container text-on-primary-container'}`}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <label className="font-label-md text-label-md text-on-surface-variant block ml-1">New Password</label>
            <div className="relative">
              <input 
                {...register("new_password", { 
                  required: "New password is required",
                  minLength: { value: 6, message: "Must be at least 6 characters" }
                })}
                className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50" 
                placeholder="••••••••" 
                type={showPassword ? "text" : "password"}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? 'visibility' : 'visibility_off'}
                </span>
              </button>
            </div>
            {errors.new_password && <span className="text-error text-xs ml-1">{errors.new_password.message}</span>}
          </div>

          <div className="space-y-2">
            <label className="font-label-md text-label-md text-on-surface-variant block ml-1">Confirm New Password</label>
            <div className="relative">
              <input 
                {...register("confirm_password", { 
                  required: "Please confirm your password",
                  validate: value => value === newPassword || "Passwords do not match"
                })}
                className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50" 
                placeholder="••••••••" 
                type={showConfirmPassword ? "text" : "password"}
              />
              <button 
                type="button" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showConfirmPassword ? 'visibility' : 'visibility_off'}
                </span>
              </button>
            </div>
            {errors.confirm_password && <span className="text-error text-xs ml-1">{errors.confirm_password.message}</span>}
          </div>

          <button disabled={loading} className="w-full py-3.5 rounded-lg bg-primary text-on-primary font-label-md flex justify-center items-center disabled:opacity-70 mt-4">
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-primary text-sm font-medium hover:underline">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
