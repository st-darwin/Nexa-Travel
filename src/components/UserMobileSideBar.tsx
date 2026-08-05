import { useState, useEffect } from 'react';
import {  UserSideBarItems } from "../constants";
import { Link, useLoaderData, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";
import { Menu, X, ChevronRight } from "lucide-react"; 

import { logoutUser } from '../appwrite/Auth';
import { useNavigate } from 'react-router-dom';


export const UserMobileSidebar =  () => {
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate()
   const user = useLoaderData()


  // Lock scroll when menu is open for that "App" feel
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
  }, [isOpen]);


  const mainItems = UserSideBarItems.slice(0, 3);
  const remainingItems = UserSideBarItems.slice(3);
const handleLogout = async () => {
  try {
    // Replace 'current' with your session ID if you're tracking specific ones
    await logoutUser(); // This should log out the current session
    navigate('/sign-in');
  } catch (error) {
    console.error("Logout failed, moving to sign-in anyway:", error);
    navigate('/sign-in');
  }

 

  



};

return (
  <>
    {/* 1. THE FLOATING DOCK (Soft Glass Architecture) */}
    <div className="fixed bottom-10 left-0 right-0 z-[70] flex justify-center px-6 lg:hidden">
      <nav className="relative bg-white/40 backdrop-blur-md border border-white/40 ring-1 ring-black/5 shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex justify-between items-center px-1 py-1 rounded-[40px] w-full md:w-[370px] max-w-[330px]  md:max-w-[400px]  ">
        
        {/* Active Indicator Background (Animated Slide) */}
        <div className="absolute inset-0 p-1.5 flex pointer-events-none">
             {/* This would require a calculated 'left' value based on index to truly slide, 
                 but for now, we'll keep the individual active states below. */}
        </div>

        {mainItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.label} 
              to={item.href} 
              className={cn(
                "relative flex flex-col items-center justify-center size-14 rounded-[32px] transition-all duration-300",
                isActive ? "bg-white shadow-sm ring-1 ring-black/5" : "text-slate-500 hover:bg-white/50"
              )}
            >
              <img 
                src={item.icon} 
                className={cn("size-5 transition-transform duration-300", isActive ? "scale-110" : "opacity-50 grayscale")} 
              />
              {/* Optional: Tiny label for PURE SaaS feel */}
              {isActive && (
                <span className="text-[9px] font-bold mt-1 text-slate-900 tracking-tight animate-in fade-in slide-in-from-bottom-1">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}

        {/* REFINED HAMBURGER TRIGGER */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex cursor-pointer items-center justify-center size-14 rounded-[32px] transition-all duration-500",
            isOpen ? "bg-slate-950 text-white scale-90" : "bg-white/60 text-slate-600 shadow-sm"
          )}
        >
          {isOpen ? <X size={20} strokeWidth={2.5} /> : <Menu size={20} strokeWidth={2.5} />}
        </button>
      </nav>
    </div>

    {/* 2. THE OVERLAY MENU (The "Silk" Veil) */}
    <div className={cn(
      "fixed inset-0 z-[65] transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] lg:hidden",
      isOpen ? "bg-slate-950/20 backdrop-blur-xl opacity-100" : "opacity-0 pointer-events-none"
    )}>
      <div className={cn(
        "absolute inset-x-4 bottom-32 bg-white/90 backdrop-blur-2xl rounded-[48px] border border-white/60 shadow-2xl overflow-hidden transition-all duration-700 delay-75",
        isOpen ? "translate-y-0 scale-100 opacity-100" : "translate-y-20 scale-95 opacity-0"
      )}>
        <div className="p-8 pt-10">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 px-2 text-center">Navigation</p>
          
          <div className="grid grid-cols-1 gap-2">
            {remainingItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between p-4 rounded-[24px] hover:bg-slate-50 active:scale-[0.98] transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="size-10 bg-slate-100/50 rounded-2xl flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                    <img src={item.icon} className="size-5 opacity-70 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-base font-semibold text-slate-800 tracking-tight">{item.label}</span>
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
          </div>

          {/* User Profile - Compact & Pro */}
          <div className="mt-6 p-4 bg-slate-50/80 rounded-[32px] flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="size-10 rounded-[14px] bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                  {user.name.charAt(0)}
               </div>
               <div className="leading-tight">
                  <p className="text-sm font-bold text-slate-900">{user.name}</p>
                  <p className="text-[11px] text-slate-500 font-medium">Standard Account</p>
               </div>
            </div>
            <button 
              onClick={handleLogout}
              className="size-10  cursor-pointer bg-white rounded-[14px] shadow-sm flex items-center justify-center text-red-500 active:scale-90 transition-transform"
            >
              <img src="/assets/icons/logout.svg" className="size-4 opacity-70" alt="Logout" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </>
);
};