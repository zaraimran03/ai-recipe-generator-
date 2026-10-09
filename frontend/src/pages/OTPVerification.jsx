import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyOTP, resendOTP } from '../services/auth';
import api from '../services/api';

export const OTPVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    if (!email) {
      navigate('/signup');
    }
  }, [email, navigate]);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;
    
    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.nextSibling && element.value) {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // If backspace is pressed on empty input, focus previous
    if (e.key === 'Backspace' && !otp[index] && e.target.previousSibling) {
      e.target.previousSibling.focus();
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) {
      setErrorMsg('Please enter a 6-digit OTP');
      return;
    }
    try {
      setLoading(true);
      setErrorMsg('');
      setSuccessMsg('');
      const isReset = location.state?.mode === 'reset';
      let response;
      if (isReset) {
        response = await api.post('/auth/verify-reset-otp/', { email, otp: enteredOtp });
        setSuccessMsg('OTP verified! Redirecting...');
        setTimeout(() => {
          navigate('/reset-password', { state: { resetToken: response.data.resetToken } });
        }, 1500);
      } else {
        await verifyOTP(email, enteredOtp);
        setSuccessMsg('Email verified successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login', { state: { message: 'Verification successful. Please log in.' } });
        }, 2000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    try {
      setLoading(true);
      setErrorMsg('');
      setSuccessMsg('');
      await resendOTP(email);
      setSuccessMsg('OTP resent successfully.');
      setCooldown(60);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface-container-low p-8 rounded-xl shadow-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-on-primary-container text-3xl">mark_email_unread</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">{location.state?.mode === 'reset' ? 'Reset Password OTP' : 'Verify your email'}</h2>
          <p className="text-on-surface-variant text-sm">
            We've sent a code to <span className="font-semibold">{email}</span>
          </p>
        </div>

        {errorMsg && (
          <div className="bg-error/10 border border-error/20 text-error p-3 rounded-lg mb-6 text-sm">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="bg-primary/10 border border-primary/20 text-primary p-3 rounded-lg mb-6 text-sm">
            {successMsg}
          </div>
        )}

        <form onSubmit={onSubmit}>
          <div className="flex justify-center gap-2 mb-8">
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={data}
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onFocus={(e) => e.target.select()}
                className="w-12 h-14 bg-surface-container-highest border border-outline-variant/30 rounded-lg text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || otp.join('').length !== 6}
            className="gradient-btn w-full py-3.5 rounded-lg text-on-primary font-bold shadow-md disabled:opacity-50 transition-opacity mb-6"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <div className="text-center text-sm text-on-surface-variant">
          Didn't receive the code?{' '}
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || loading}
            className={`font-bold ${cooldown > 0 ? 'text-outline' : 'text-primary hover:underline'}`}
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
