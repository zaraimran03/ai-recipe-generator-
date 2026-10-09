import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sendWelcomeEmail } from '../services/email';

export const SignUp = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMsg, setErrorMsg] = useState(location.state?.message || '');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const pwd = watch("password", "");

  useEffect(() => {
    let s = 0;
    if (pwd.length >= 6) s++;
    if (pwd.length >= 8 && pwd.match(/[A-Z]/)) s++;
    if (pwd.length >= 8 && (pwd.match(/[0-9]/) || pwd.match(/[^a-zA-Z0-9]/))) s++;
    setPasswordStrength(s);
  }, [pwd]);

  const onSubmit = async (data) => {
    if (data.password !== data.confirm_password) {
      setErrorMsg('Passwords do not match');
      return;
    }
    try {
      setErrorMsg('');
      setLoading(true);
      await registerAuth(data.name, data.email, data.password, data.confirm_password);
      
      // Navigate to OTP page
      navigate('/verify-otp', { state: { email: data.email } });
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen sparkle-bg flex flex-col lg:flex-row">
      {/* Left Side: Brand & Visuals */}
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
            <h2 className="font-headline-xl text-headline-xl mb-6 leading-tight">Master the art of <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">intelligent cooking.</span></h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                Join over 50,000 home cooks using AI to generate personalized recipes based on dietary needs, pantry stock, and taste preferences.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-6 rounded-lg animate-float" style={{animationDelay: '0s'}}>
                <span className="material-symbols-outlined text-primary mb-3" style={{fontVariationSettings: "'FILL' 1"}}>auto_awesome</span>
                <h3 className="font-label-md text-label-md text-on-surface mb-1">AI Generation</h3>
                <p className="text-xs text-on-surface-variant">Instant recipes from any ingredients.</p>
            </div>
            <div className="glass-card p-6 rounded-lg animate-float" style={{animationDelay: '1s'}}>
                <span className="material-symbols-outlined text-secondary mb-3" style={{fontVariationSettings: "'FILL' 1"}}>nutrition</span>
                <h3 className="font-label-md text-label-md text-on-surface mb-1">Smart Analytics</h3>
                <p className="text-xs text-on-surface-variant">Track macros and health scores easily.</p>
            </div>
          </div>
          
          <div className="mt-12 rounded-lg overflow-hidden glass-card p-2 aspect-video relative group">
            <img alt="AI Showcase" className="w-full h-full object-cover rounded-md transition-transform duration-700 group-hover:scale-110" src="/images/showcase.jpg"/>
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex items-end p-6">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm" style={{fontVariationSettings: "'FILL' 1"}}>colors_spark</span>
                    <span className="text-xs font-label-sm uppercase tracking-widest text-on-surface/80">AI Crafted Content</span>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Right Side: Form */}
      <section className="w-full lg:w-1/2 flex flex-col items-center justify-center p-margin-mobile md:p-margin-desktop bg-surface min-h-screen">
        <div className="w-full max-w-md">
          <div className="text-center lg:text-left mb-8 md:mb-10">
            <div className="lg:hidden flex justify-center mb-6">
                <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-primary-container text-sm" style={{fontVariationSettings: "'FILL' 1"}}>restaurant</span>
                </div>
            </div>
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg mb-2 text-heading">Create your account</h2>
            <p className="text-on-surface-variant font-body-md">Experience the future of cooking today.</p>
          </div>

          {errorMsg && (
            <div className="bg-primary/10 border border-primary/20 text-on-surface p-4 rounded-xl mb-6 text-sm flex gap-3 items-start shadow-sm">
              <span className="material-symbols-outlined text-primary">info</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
                <label className="font-label-md text-label-md text-on-surface-variant block ml-1">Full Name</label>
                <div className="relative group">
                    <input 
                      {...register("name", { required: "Name is required" })}
                      className="w-full bg-surface-container-highest/30 border border-outline-variant/30 rounded-lg px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 placeholder:text-outline" 
                      placeholder="John Doe" 
                      type="text"
                    />
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">person</span>
                </div>
                {errors.name && <span className="text-error text-xs ml-1">{errors.name.message}</span>}
            </div>

            <div className="space-y-2">
                <label className="font-label-md text-label-md text-on-surface-variant block ml-1">Email Address</label>
                <div className="relative group">
                    <input 
                      {...register("email", { 
                        required: "Email is required",
                        pattern: { value: /^\S+@\S+$/i, message: "Invalid email" }
                      })}
                      className="w-full bg-surface-container-highest/30 border border-outline-variant/30 rounded-lg px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 placeholder:text-outline" 
                      placeholder="chef@example.com" 
                      type="email"
                    />
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">mail</span>
                </div>
                {errors.email && <span className="text-error text-xs ml-1">{errors.email.message}</span>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="font-label-md text-label-md text-on-surface-variant block ml-1">Password</label>
                    <div className="relative group">
                        <input 
                          {...register("password", { required: "Password required", minLength: { value: 6, message: "Min 6 chars" } })}
                          className="w-full bg-surface-container-highest/30 border border-outline-variant/30 rounded-lg px-4 py-3.5 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 placeholder:text-outline" 
                          placeholder="••••••••" 
                          type={showPassword ? "text" : "password"}
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors focus:outline-none flex items-center justify-center"
                        >
                          <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility' : 'visibility_off'}</span>
                        </button>
                    </div>
                    {errors.password && <span className="text-error text-xs ml-1 block">{errors.password.message}</span>}
                </div>
                <div className="space-y-2">
                    <label className="font-label-md text-label-md text-on-surface-variant block ml-1">Confirm</label>
                    <div className="relative group">
                        <input 
                          {...register("confirm_password", { 
                            required: "Confirm required",
                            validate: val => val === pwd || "Passwords do not match"
                          })}
                          className="w-full bg-surface-container-highest/30 border border-outline-variant/30 rounded-lg px-4 py-3.5 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 placeholder:text-outline" 
                          placeholder="••••••••" 
                          type={showConfirmPassword ? "text" : "password"}
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors focus:outline-none flex items-center justify-center"
                        >
                          <span className="material-symbols-outlined text-[20px]">{showConfirmPassword ? 'visibility' : 'visibility_off'}</span>
                        </button>
                    </div>
                    {errors.confirm_password && <span className="text-error text-xs ml-1 block">{errors.confirm_password.message}</span>}
                </div>
            </div>

            {/* Password Strength */}
            <div className="px-1">
                <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">Security Level</span>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-outline">
                      {passwordStrength === 0 ? 'Weak' : passwordStrength === 1 ? 'Fair' : passwordStrength === 2 ? 'Good' : 'Strong'}
                    </span>
                </div>
                <div className="h-1 w-full bg-surface-container-highest rounded-full overflow-hidden flex gap-1">
                    <div className={`h-full w-1/3 ${passwordStrength >= 1 ? 'bg-primary' : 'bg-surface-variant'}`}></div>
                    <div className={`h-full w-1/3 ${passwordStrength >= 2 ? 'bg-secondary' : 'bg-surface-variant'}`}></div>
                    <div className={`h-full w-1/3 ${passwordStrength >= 3 ? 'bg-tertiary' : 'bg-surface-variant'}`}></div>
                </div>
            </div>

            <div className="px-1 py-1">
                <div className="flex items-start gap-3">
                    <div className="flex items-center h-5">
                        <input 
                          {...register("terms", { required: "You must agree to the Terms & Privacy Policy" })}
                          className="w-5 h-5 rounded border-outline-variant/50 text-primary focus:ring-primary/40 bg-surface-container-highest cursor-pointer" 
                          type="checkbox"
                        />
                    </div>
                    <label className="text-xs text-on-surface-variant leading-tight cursor-pointer">
                        I agree to the <a className="text-primary hover:underline transition-all" href="#">Terms of Service</a> and <a className="text-primary hover:underline transition-all" href="#">Privacy Policy</a>.
                    </label>
                </div>
                {errors.terms && <span className="text-error text-xs mt-1 block">{errors.terms.message}</span>}
            </div>

            <button disabled={loading} className="gradient-btn w-full py-4 rounded-lg text-on-primary font-label-md text-label-md shadow-xl flex items-center justify-center gap-2 group disabled:opacity-70">
                {loading ? 'Creating...' : 'Create Account'}
                {!loading && <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">arrow_forward</span>}
            </button>
          </form>
          
          <div className="mt-8 text-center">
              <p className="text-label-md font-label-md text-on-surface-variant">
                  Already have an account? <Link className="text-primary font-bold hover:underline" to="/login">Sign In</Link>
              </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SignUp;
