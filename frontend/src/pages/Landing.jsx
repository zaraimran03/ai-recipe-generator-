import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Button from '../components/ui/Button';
import GlassCard from '../components/ui/GlassCard';

export const Landing = () => {
  return (
    <div className="bg-background text-on-background font-body-md min-h-screen sparkle-bg overflow-x-hidden">
      <Navbar />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative min-h-[921px] flex items-center px-margin-mobile md:px-margin-desktop overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -z-10"></div>
          <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-gutter items-center">
            <div className="space-y-8 z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-primary/20">
                <span className="material-symbols-outlined text-primary text-[18px]" style={{fontVariationSettings: "'FILL' 1"}}>auto_awesome</span>
                <span className="text-label-md font-label-md text-primary">Now powered by GPT-Kitchen v2</span>
              </div>
              
              <h1 className="font-headline-xl text-headline-xl text-heading leading-tight">
                Cook Smart <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">with AI</span>
              </h1>
              
              <p className="text-body-lg font-body-lg text-on-surface-variant max-w-lg">
                Generate recipes instantly using ingredients you already have. Reduce food waste and discover new flavors with your intelligent culinary companion.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link to="/signup">
                  <Button variant="primary" className="px-8 py-4 !text-label-md">Get Started Free</Button>
                </Link>
                <Link to="/login">
                  <Button variant="secondary" className="px-8 py-4 !text-label-md !bg-transparent hover:!bg-border-subtle/5 border-border-subtle/20 !text-heading">View Recipes</Button>
                </Link>
              </div>
              
              <div className="flex items-center gap-4 pt-4">
                <div className="flex -space-x-3">
                  <img alt="user" className="w-8 h-8 rounded-full border-2 border-background object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOEQPFn2R8qFJrDQ5XxkTupMIpsAXHuMz25Z2TAoiDRGzfA_Mf8X55Ob8_zMW1xLR1SObXHRR-5GUNnhrHSOipOZh6IsECGrhooYdFXmO6pHY1YngSXECVqOYgSEoTty8PwkKw-rb03LslrCT7VRzisEtLbMGogA18w48ayCgN0fXA0i3i_Oknrh2DUbMIm-vM03BMkvMLLSMp2bPkyMd2DZwAB-7gIprVWf_QDevrfVUKOY6MAYg_O4ZUtAu2MZE8YK235wrM0hdw"/>
                  <img alt="user" className="w-8 h-8 rounded-full border-2 border-background object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAaTbhWiUDk5KS7Hz4sCBX-W2p_8IYLK0SFKPZQtbQ4ClSBJkRLnUjakqBmVDRPfpx3umPxRCHzjhhcmpBlpeWDAF2noVWeOw-q-NpBCccOzaxSpz59YkKLXcoXopSGQNcaLOcm_hNR-95mvddwXsNt2WxbjdzT0fw39px2tTOXMk2qB69S2c6AEx77F9vPeyWV4j4ctDRuZnw1vIoW4e2aE4gckj1gduwisHxC7ZwMEvu0O5t9Jkvqpfpce6sL9A8JXyaaoOU75HNq"/>
                  <img alt="user" className="w-8 h-8 rounded-full border-2 border-background object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPcNv20PCHYOfPkOGa6fUHWz3aXd3hdBmkKNvh_TAH478x4mmTj1Et0wbXcHp-YXAYLpJnY81GcwpFLoAivwhQNWeZrDPuYwN9mC3t3B44OwjgRvhOOBCxNXy0uNR39uOSB_zkVxz9lh91djClNYXom-kS7l7N0Uskgf0Q8U3VC-Yqb4cekXtyJOOME5l94_rv0EnavtXZqxL2LM8voHjyHA80BYvrEGtmduuPFEDoGVK0VqSIZAp-yrMnBDUIh-vr_0dzFFNDQvH_"/>
                </div>
                <p className="text-label-sm font-label-sm text-on-surface-variant">Joined by <span className="text-primary font-bold">10k+</span> home cooks today</p>
              </div>
            </div>
            
            <div className="relative hidden lg:block">
              {/* Floating Ingredient Icons */}
              <div className="absolute top-10 right-10 floating-icon text-primary/40 text-[48px] material-symbols-outlined">restaurant</div>
              <div className="absolute bottom-20 left-0 floating-icon text-secondary/40 text-[40px] material-symbols-outlined" style={{animationDelay: '1s'}}>nutrition</div>
              <div className="absolute top-1/2 right-0 floating-icon text-tertiary/40 text-[32px] material-symbols-outlined" style={{animationDelay: '2s'}}>skillet</div>
              
              <div className="glass-card rounded-[2.5rem] p-4 relative overflow-hidden group">
                <img alt="Delicious AI-generated recipe" className="rounded-[2rem] w-full aspect-square object-cover transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuADRudaaMzOiKpFBJ_jlKDdLpkB4m9QpOCukVUS9kX2tGHSMxgrEEz2nnTpLjigQGZz_C1B9WkDbYPDZdCBZxK5YGMqkXUvmFAA4xB1cAfFy9CFFBFEwJuYPLITg2m9kn9BZ1qG4WQLlBK4FTvaQTvx33ezNxCUKz-GreopkGd3RecT_0lhfxwFf3H0Xs_qsFp7atYqv_G1OKkA62AX22WOJxSjBHnLPkcdLV0OCQNg-g-f74GdUSeSc583cakoVrcXoUZXpiBHDXlW"/>
                <div className="absolute bottom-10 left-10 right-10 glass-card p-6 rounded-xl border-border-subtle/20">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-headline-md text-headline-md text-heading">Grilled Salmon Bowl</h3>
                    <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-label-sm">AI Choice</span>
                  </div>
                  <div className="flex gap-4 text-on-surface-variant text-label-sm">
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">schedule</span> 15 mins</span>
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">bolt</span> 420 kcal</span>
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">star</span> 4.9</span>
                  </div>
                </div>
              </div>
              
              {/* Sparkle effects */}
              <span className="material-symbols-outlined sparkle-ai text-primary top-0 left-1/4" style={{fontSize: '24px'}}>colors_spark</span>
              <span className="material-symbols-outlined sparkle-ai text-secondary bottom-1/4 right-0" style={{fontSize: '32px', animationDelay: '1.5s'}}>colors_spark</span>
            </div>
          </div>
        </section>

        {/* Bento Features Section */}
        <section className="py-24 px-margin-mobile md:px-margin-desktop">
          <div className="container mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="font-headline-lg text-headline-lg text-heading">Culinary Intelligence at Your Fingertips</h2>
              <p className="text-body-md font-body-md text-on-surface-variant max-w-2xl mx-auto">
                Our AI doesn't just find recipes; it understands your pantry, your health goals, and the planet.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 h-auto md:h-[600px]">
              {/* Smart Nutrition */}
              <GlassCard className="md:col-span-1 md:row-span-2 p-8 flex flex-col justify-between group">
                <div>
                  <div className="w-12 h-12 rounded-lg bg-tertiary/10 flex items-center justify-center mb-6 group-hover:bg-tertiary/20 transition-colors">
                    <span className="material-symbols-outlined text-tertiary">analytics</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-heading mb-4">Smart Nutrition</h3>
                  <p className="text-on-surface-variant font-body-md">Real-time breakdown of macros and micros for every generated recipe. Perfectly aligned with your fitness trackers.</p>
                </div>
                <div className="mt-8 bg-surface-container rounded-lg p-4 space-y-3">
                  <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-3/4 rounded-full"></div>
                  </div>
                  <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden">
                    <div className="h-full bg-secondary w-1/2 rounded-full"></div>
                  </div>
                  <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden">
                    <div className="h-full bg-tertiary w-2/3 rounded-full"></div>
                  </div>
                </div>
              </GlassCard>
              
              {/* Waste Reduction */}
              <GlassCard className="md:col-span-2 p-8 flex gap-8 items-center overflow-hidden">
                <div className="flex-1">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-primary">eco</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-heading mb-4">Zero Waste Cooking</h3>
                  <p className="text-on-surface-variant font-body-md">Input your expiring ingredients and let our AI create the perfect meal. Save money and save the planet.</p>
                </div>
                <div className="hidden sm:block w-1/3 relative">
                  <span className="material-symbols-outlined text-[120px] text-primary/10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">potted_plant</span>
                </div>
              </GlassCard>
              
              {/* Micro-interactions Card */}
              <GlassCard className="md:col-span-1 p-8 group">
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform">
                  <span className="material-symbols-outlined text-secondary">bolt</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-heading mb-4">Instant Generation</h3>
                <p className="text-on-surface-variant font-body-md">Get full instructions, ingredient swaps, and shopping lists in under 3 seconds.</p>
              </GlassCard>
              
              {/* Pantry Sync */}
              <GlassCard className="md:col-span-1 p-8 group">
                <div className="w-12 h-12 rounded-lg bg-on-primary-container/10 flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-primary">kitchen</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-heading mb-4">Pantry Sync</h3>
                <p className="text-on-surface-variant font-body-md">Keep track of your fridge inventory and never wonder "what's for dinner" again.</p>
              </GlassCard>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Landing;
