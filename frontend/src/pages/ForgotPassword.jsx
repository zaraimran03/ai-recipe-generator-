import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';

export const ForgotPassword = () => {
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: location.state?.email || ''
    }
  });

  const onSubmit = async (data) => {
    try {
      setStatus({ type: '', message: '' });
      setLoading(true);
      const response = await api.post('/auth/forgot-password/', { email: data.email });
      navigate('/verify-otp', { state: { email: data.email, mode: 'reset' } });
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
          <h2 className="font-headline-lg text-headline-lg mb-2">Reset Password</h2>
          <p className="text-on-surface-variant text-body-md">Enter your email and we'll send a reset link.</p>
        </div>

        {status.message && (
          <div className={`p-4 rounded-lg mb-6 text-sm ${status.type === 'error' ? 'bg-error-container text-on-error-container' : 'bg-primary-container text-on-primary-container'}`}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <label className="font-label-md text-label-md text-on-surface-variant block ml-1">Email Address</label>
            <input 
              {...register("email", { required: "Email is required" })}
              className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50" 
              placeholder="chef@example.com" 
              type="email"
            />
            {errors.email && <span className="text-error text-xs ml-1">{errors.email.message}</span>}
          </div>

          <button disabled={loading} className="w-full py-3.5 rounded-lg bg-primary text-on-primary font-label-md flex justify-center items-center disabled:opacity-70">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-primary text-sm font-medium hover:underline">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
