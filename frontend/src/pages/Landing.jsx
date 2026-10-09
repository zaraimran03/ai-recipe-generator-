import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import GlassCard from '../components/ui/GlassCard';

export const Landing = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen sparkle-bg overflow-x-hidden">
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 bg-surface/80 backdrop-blur-lg border-b border-border-subtle/10 shadow-sm shadow-primary/5">
        <Link to="/" className="font-headline-md text-headline-md font-bold text-primary">
          AI Recipe Generator
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/dashboard" className="text-label-md font-label-md text-on-surface-variant hover:text-primary transition-colors">Dashboard</Link>
              <button onClick={handleLogout} className="px-4 py-2 rounded-full border border-border-subtle/20 text-on-surface-variant font-label-md text-label-md shadow-sm hover:bg-surface-container transition-colors">Log Out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 rounded-full border border-primary text-primary font-label-md text-label-md hover:bg-primary/5 transition-colors">Sign In</Link>
            </>
          )}
        </div>
      </header>
      
      <main className="pt-16">
        {/* Clean Modern Hero Section */}
        <section className="relative min-h-[85vh] flex items-center px-margin-mobile md:px-margin-desktop overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-primary/10 to-secondary/10 rounded-full blur-[120px] -z-10"></div>
          
          <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 z-10 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-primary/20 shadow-sm">
                <span className="material-symbols-outlined text-primary text-[18px]" style={{fontVariationSettings: "'FILL' 1"}}>auto_awesome</span>
                <span className="text-label-md font-label-md text-primary font-medium">Now powered by GPT-Kitchen v2</span>
              </div>
              
              <h1 className="font-headline-xl text-5xl lg:text-7xl font-extrabold text-heading leading-[1.1] tracking-tight">
                Cook Smart <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">with AI</span>
              </h1>
              
              <p className="text-body-lg font-body-lg text-on-surface-variant max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Generate personalized recipes instantly using ingredients you already have. Reduce food waste and discover new flavors with your intelligent culinary companion.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                <Link to="/signup">
                  <Button variant="primary" className="w-full sm:w-auto px-10 py-4 !text-label-md !rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all">Get Started Free</Button>
                </Link>
                <Link to="/generate">
                  <Button variant="secondary" className="w-full sm:w-auto px-10 py-4 !text-label-md !rounded-full !bg-surface-container-highest hover:!bg-surface-variant border border-outline-variant/20 text-on-surface transition-all">Try as Guest</Button>
                </Link>
              </div>
              
              <div className="flex items-center justify-center lg:justify-start gap-4 pt-6">
                <div className="flex -space-x-3">
                  <img alt="user" className="w-10 h-10 rounded-full border-2 border-background object-cover shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOEQPFn2R8qFJrDQ5XxkTupMIpsAXHuMz25Z2TAoiDRGzfA_Mf8X55Ob8_zMW1xLR1SObXHRR-5GUNnhrHSOipOZh6IsECGrhooYdFXmO6pHY1YngSXECVqOYgSEoTty8PwkKw-rb03LslrCT7VRzisEtLbMGogA18w48ayCgN0fXA0i3i_Oknrh2DUbMIm-vM03BMkvMLLSMp2bPkyMd2DZwAB-7gIprVWf_QDevrfVUKOY6MAYg_O4ZUtAu2MZE8YK235wrM0hdw"/>
                  <img alt="user" className="w-10 h-10 rounded-full border-2 border-background object-cover shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAaTbhWiUDk5KS7Hz4sCBX-W2p_8IYLK0SFKPZQtbQ4ClSBJkRLnUjakqBmVDRPfpx3umPxRCHzjhhcmpBlpeWDAF2noVWeOw-q-NpBCccOzaxSpz59YkKLXcoXopSGQNcaLOcm_hNR-95mvddwXsNt2WxbjdzT0fw39px2tTOXMk2qB69S2c6AEx77F9vPeyWV4j4ctDRuZnw1vIoW4e2aE4gckj1gduwisHxC7ZwMEvu0O5t9Jkvqpfpce6sL9A8JXyaaoOU75HNq"/>
                  <img alt="user" className="w-10 h-10 rounded-full border-2 border-background object-cover shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPcNv20PCHYOfPkOGa6fUHWz3aXd3hdBmkKNvh_TAH478x4mmTj1Et0wbXcHp-YXAYLpJnY81GcwpFLoAivwhQNWeZrDPuYwN9mC3t3B44OwjgRvhOOBCxNXy0uNR39uOSB_zkVxz9lh91djClNYXom-kS7l7N0Uskgf0Q8U3VC-Yqb4cekXtyJOOME5l94_rv0EnavtXZqxL2LM8voHjyHA80BYvrEGtmduuPFEDoGVK0VqSIZAp-yrMnBDUIh-vr_0dzFFNDQvH_"/>
                </div>
                <div className="flex flex-col">
                  <div className="flex text-secondary text-sm">
                    <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                    <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                    <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                    <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                    <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                  </div>
                  <p className="text-xs font-medium text-on-surface-variant">Loved by <span className="text-primary font-bold">10,000+</span> cooks</p>
                </div>
              </div>
            </div>
            
            <div className="relative hidden lg:flex justify-center items-center">
              {/* Clean, high-quality showcase image without the messy floating icons */}
              <div className="glass-card rounded-[2.5rem] p-3 relative overflow-hidden group shadow-2xl shadow-primary/10 border border-outline-variant/20 max-w-lg w-full">
                <img alt="Delicious AI-generated recipe" className="rounded-[2rem] w-full aspect-[4/5] object-cover transition-transform duration-1000 group-hover:scale-105" src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2053&auto=format&fit=crop"/>
                <div className="absolute bottom-8 left-8 right-8 glass-card p-5 rounded-2xl border border-white/10 backdrop-blur-xl shadow-lg transform translate-y-2 opacity-90 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-headline-sm text-heading font-bold mb-1">Avocado Salmon Bowl</h3>
                      <p className="text-xs text-on-surface-variant">Generated from 5 ingredients</p>
                    </div>
                    <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">AI Match</span>
                  </div>
                  <div className="flex gap-4 text-on-surface-variant text-xs font-medium">
                    <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-secondary" style={{fontVariationSettings: "'FILL' 1"}}>schedule</span> 15 mins</span>
                    <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-tertiary" style={{fontVariationSettings: "'FILL' 1"}}>local_fire_department</span> 420 kcal</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Clean Bento Features Section */}
        <section className="py-24 px-margin-mobile md:px-margin-desktop bg-surface-container-lowest">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16 space-y-4">
              <h2 className="font-headline-lg text-4xl font-bold text-heading">Culinary Intelligence at Your Fingertips</h2>
              <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto">
                Our AI doesn't just find recipes; it understands your pantry, your health goals, and the planet.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 auto-rows-fr">
              {/* Smart Nutrition */}
              <GlassCard className="md:col-span-1 md:row-span-2 p-8 flex flex-col group border border-outline-variant/20 hover:border-primary/30 transition-colors shadow-sm hover:shadow-md">
                <div className="w-14 h-14 rounded-2xl bg-tertiary/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-tertiary text-2xl">analytics</span>
                </div>
                <h3 className="font-headline-sm text-xl font-bold text-heading mb-3">Smart Nutrition</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed flex-1">Real-time breakdown of macros and micros for every generated recipe. Perfectly aligned with your fitness goals.</p>
                
                <div className="mt-8 bg-surface-container rounded-xl p-5 space-y-4 border border-outline-variant/10">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium"><span className="text-on-surface-variant">Protein</span><span className="text-primary">32g</span></div>
                    <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden"><div className="h-full bg-primary w-3/4 rounded-full"></div></div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium"><span className="text-on-surface-variant">Carbs</span><span className="text-secondary">45g</span></div>
                    <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden"><div className="h-full bg-secondary w-1/2 rounded-full"></div></div>
                  </div>
                </div>
              </GlassCard>
              
              {/* Waste Reduction */}
              <GlassCard className="md:col-span-2 p-8 flex flex-col sm:flex-row gap-8 items-center border border-outline-variant/20 hover:border-primary/30 transition-colors shadow-sm hover:shadow-md overflow-hidden relative">
                <div className="flex-1 z-10">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-primary text-2xl">eco</span>
                  </div>
                  <h3 className="font-headline-sm text-xl font-bold text-heading mb-3">Zero Waste Cooking</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed max-w-md">Input your expiring ingredients and let our AI create the perfect meal. Save money and protect the planet with every dish.</p>
                </div>
                <div className="hidden sm:flex w-1/3 justify-center z-10">
                   <div className="w-32 h-32 rounded-full border-8 border-primary/20 flex items-center justify-center relative">
                     <div className="absolute inset-2 rounded-full border-4 border-dashed border-primary/40 animate-[spin_20s_linear_infinite]"></div>
                     <span className="material-symbols-outlined text-4xl text-primary">psychiatry</span>
                   </div>
                </div>
              </GlassCard>
              
              {/* Instant Generation */}
              <GlassCard className="md:col-span-1 p-8 group border border-outline-variant/20 hover:border-secondary/30 transition-colors shadow-sm hover:shadow-md">
                <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300">
                  <span className="material-symbols-outlined text-secondary text-2xl">bolt</span>
                </div>
                <h3 className="font-headline-sm text-xl font-bold text-heading mb-3">Instant Recipes</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">Get full step-by-step instructions, intelligent ingredient swaps, and shopping lists in under 3 seconds.</p>
              </GlassCard>
              
              {/* Pantry Sync */}
              <GlassCard className="md:col-span-1 p-8 group border border-outline-variant/20 hover:border-primary/30 transition-colors shadow-sm hover:shadow-md">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:-translate-y-1 transition-transform duration-300">
                  <span className="material-symbols-outlined text-primary text-2xl">kitchen</span>
                </div>
                <h3 className="font-headline-sm text-xl font-bold text-heading mb-3">Smart Pantry</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">Keep track of your fridge inventory and never wonder "what's for dinner" again. Completely synced with your account.</p>
              </GlassCard>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Landing;
