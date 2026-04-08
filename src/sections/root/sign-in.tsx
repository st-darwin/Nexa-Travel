import React from 'react'
import { Link, redirect } from 'react-router-dom'
import { ButtonComponent } from '@syncfusion/ej2-react-buttons'
import { account } from '../../appwrite/client'
import { loginWithGoogle } from '../../appwrite/Auth'

// Inside sign-in.tsx
export const clientLoader = async () => {
    try {
        const user = await account.get();

        if (user.$id) return redirect('/'); // If logged in, go to dashboard
      
    } catch (error) {

        console.error("Error fetching user session:", error);
        // If not logged in, account.get() fails. 
        // We catch it here so the red error goes away.
       
    }
};

const SignIn = () => {
  return (
    // Added a subtle radial gradient background to make the glass card "pop"
    <main className="min-h-screen w-full flex items-center justify-center bg-[radial-gradient(circle_at_top_left,_#f8fafc,_#eff6ff)] p-6">
      
      {/* Glassmorphism Card Container */}
      <section className="w-full max-w-[420px] bg-white/70 backdrop-blur-2xl border border-white/80 rounded-[32px] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] flex flex-col items-center">
        
        {/* Header - Minimalist & Centered */}
        <header className="flex items-center items-center mb-8">
          <Link to="/" className="transition-transform duration-300 hover:scale-110"> 
            <img className="h-15 w-15 mr-1  " src="/assets/icons/travelLogo.svg" alt="logo" />
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Nexa<span className='text-blue-500'> Travel</span>✈️</h1>
        </header>

        {/* Text Content - Better Hierarchy */}
        <article className="space-y-3 text-center mb-10">
          <h2 className="text-[26px] font-bold text-slate-900 leading-tight tracking-tight">
            Start Your Travel Journey Now! 🚀
          </h2>
          <p className="text-[15px] text-slate-500 font-medium leading-relaxed px-2">
            Sign in with Google to manage destinations, itineraries and user activity with ease
          </p>
        </article>

        {/* Your Button - Kept exactly as requested */}
        <ButtonComponent
          type="button"
          className="button-class !h-11 !w-full cursor-pointer"
          onClick={loginWithGoogle}
        >
          <img src="/assets/icons/google.svg" className="size-5" alt="google" />
          <span className="p-18-semibold text-white ml-2">Sign in with Google</span>
        </ButtonComponent>

        {/* Soft Footer - For a polished finish */}
        <footer className="mt-8 pt-6 border-t border-slate-100 w-full text-center">
          <p className="text-[12px] text-slate-400 font-medium">
            Protected by Darwin Cloud Encryption 
          </p>
        </footer>

      </section>
    </main>
  );
}
export default SignIn;