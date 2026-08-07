import { Link } from 'react-router-dom'
import { account } from '../../appwrite/client'
import { loginWithGoogle } from '../../appwrite/Auth'

export const clientLoader = async () => {
    try {
        const user = await account.get();
        if (user.$id) return { user }; // If logged in, go to dashboard
    } catch (error) {
        console.error("Error fetching user session:", error);
    }
};

const SignIn = () => {
  return (
    <main className="relative min-h-screen w-full flex items-center justify-center bg-slate-50/80 p-6 overflow-hidden selection:bg-slate-900 selection:text-white">
      
      {/* Dynamic Ambient Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-40 [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Soft Glow Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[500px] bg-slate-200/50 rounded-full blur-[100px] pointer-events-none" />

      {/* Modern SaaS Glass Card Container */}
      <section className="group relative z-10 w-full max-w-[420px] bg-white/70 backdrop-blur-2xl border border-slate-200/90 rounded-[32px] p-8 md:p-10 shadow-[0_20px_50px_rgba(15,23,42,0.03)] hover:shadow-[0_25px_60px_rgba(15,23,42,0.07)] hover:border-slate-300/80 transition-all duration-300 flex flex-col items-center">
        
        {/* Brand Header */}
        <header className="flex items-center gap-2.5 mb-8">
          <Link to="/" className="transition-transform duration-300 hover:scale-105 active:scale-95"> 
            <img className="size-10 object-contain drop-shadow-xs" src="/assets/icons/logo1.svg" alt="logo" />
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 font-figtree">
            Nexa<span className="text-slate-400 font-normal">Travel</span>
          </h1>
        </header>

        {/* Text Content */}
        <article className="space-y-2 text-center mb-9">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Start Your Travel Journey
          </h2>
          <p className="text-sm text-slate-500 font-medium leading-relaxed px-1">
            Sign in with Google to seamlessly access your itineraries, trips, and live dashboard.
          </p>
        </article>

        {/* Ultra-Smooth SaaS Button Container */}
        <div className="w-full">
          <button
            type="button"
            onClick={loginWithGoogle}
            className="group/btn relative w-full py-[0.85rem] bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-3 cursor-pointer overflow-hidden transition-all duration-300 active:scale-[0.97] hover:shadow-[0_12px_24px_-6px_rgba(15,23,42,0.25)] border border-slate-800"
          >
            {/* 1. Ambient Outer Border Glow on Hover */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-slate-400/0 via-white/20 to-slate-400/0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* 2. Fluid Glass Reflection Sweep */}
            <div className="absolute inset-0 w-[200%] translate-x-[-100%] group-hover/btn:translate-x-[100%] bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-1000 ease-in-out pointer-events-none" />

            {/* 3. Google Logo Badge with Hover Spin/Bounce */}
            <div className="relative z-10 size-6 rounded-full flex items-center justify-center p-1 shadow-sm transition-all duration-300  ">
              <img 
                src="/assets/icons/google.svg" 
                className="size-full object-contain" 
                alt="google" 
              />
            </div>

            {/* 4. Text with subtle hover slide */}
            <span className="relative z-10 text-sm font-semibold tracking-wide text-white transition-transform duration-300 group-hover/btn:translate-x-0.5">
              Continue with Google
            </span>

            {/* 5. Subtle Right Arrow Indicator that slides in on hover */}
            <svg 
              className="relative z-10 size-4 text-slate-400 opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all duration-300 ease-out" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>

        {/* Quiet & Minimal Footer Info */}
        <footer className="mt-9 pt-6 border-t border-slate-100/80 w-full flex items-center justify-between text-[11px] font-medium tracking-tight">
          <div className="flex items-center gap-2 bg-slate-100/70 border border-slate-200/60 px-2.5 py-1 rounded-full text-slate-600">
            
            <span>Ready and Secured</span>
          </div>
          <span className="text-slate-400 tracking-wide font-normal">NexaLabs</span>
        </footer>

      </section>
    </main>
  );
}

export default SignIn;