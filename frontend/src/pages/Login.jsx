import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      setErrorMsg('');
      setLoading(true);
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen sparkle-bg flex flex-col lg:flex-row">
      <section className="hidden lg:flex lg:w-1/2 relative bg-surface-container-lowest items-center justify-center p-margin-desktop overflow-hidden min-h-screen">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary-container/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-5%] left-[-5%] w-80 h-80 bg-secondary-container/20 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 max-w-lg">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary-container rounded-xl flex items-center justify-center shadow-lg shadow-primary-container/20">
                <span className="material-symbols-outlined text-on-primary-container" style={{fontVariationSettings: "'FILL' 1"}}>restaurant</span>
              </div>
              <h1 className="font-headline-lg text-headline-lg font-extrabold tracking-tight">AI Chef</h1>
            </div>
            <h2 className="font-headline-xl text-headline-xl mb-6 leading-tight">Welcome back to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">your kitchen.</span></h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                Log in to access your personalized recipe recommendations, saved favorites, and smart pantry analytics.
            </p>
          </div>
        </div>
      </section>

      <section className="w-full lg:w-1/2 flex flex-col items-center justify-center p-margin-mobile md:p-margin-desktop bg-surface min-h-screen">
        <div className="w-full max-w-md">
          <div className="text-center lg:text-left mb-8 md:mb-10">
            <div className="lg:hidden flex justify-center mb-6">
                <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-primary-container text-sm" style={{fontVariationSettings: "'FILL' 1"}}>restaurant</span>
                </div>
            </div>
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg mb-2 text-heading">Sign in</h2>
            <p className="text-on-surface-variant font-body-md">Continue your culinary journey.</p>
          </div>

          {errorMsg && (
            <div className="bg-error-container text-on-error-container p-3 rounded-lg mb-6 text-sm">
              {errorMsg}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
                <label className="font-label-md text-label-md text-on-surface-variant block ml-1">Email Address</label>
                <div className="relative group">
                    <input 
                      {...register("email", { required: "Email is required" })}
                      className="w-full bg-surface-container-highest/30 border border-outline-variant/30 rounded-lg px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 placeholder:text-outline" 
                      placeholder="chef@example.com" 
                      type="email"
                    />
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">mail</span>
                </div>
                {errors.email && <span className="text-error text-xs ml-1">{errors.email.message}</span>}
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                    <label className="font-label-md text-label-md text-on-surface-variant">Password</label>
                    <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
                </div>
                <div className="relative group">
                    <input 
                      {...register("password", { required: "Password is required" })}
                      className="w-full bg-surface-container-highest/30 border border-outline-variant/30 rounded-lg px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 placeholder:text-outline" 
                      placeholder="••••••••" 
                      type="password"
                    />
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">lock</span>
                </div>
                {errors.password && <span className="text-error text-xs ml-1">{errors.password.message}</span>}
            </div>

            <button disabled={loading} className="gradient-btn w-full py-4 rounded-lg text-on-primary font-label-md text-label-md shadow-xl flex items-center justify-center gap-2 group disabled:opacity-70 mt-4">
                {loading ? 'Signing In...' : 'Sign In'}
                {!loading && <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">arrow_forward</span>}
            </button>
          </form>
          
          <div className="mt-8 text-center">
              <p className="text-label-md font-label-md text-on-surface-variant">
                  Don't have an account? <Link className="text-primary font-bold hover:underline" to="/signup">Create one</Link>
              </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Login;
