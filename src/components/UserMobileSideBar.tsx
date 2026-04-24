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
      {/* 1. THE FLOATING DOCK (Soft Glass) */}
      <div className="fixed bottom-8 left-0 right-0 z-[70] flex justify-center px-6 lg:hidden">
        <nav className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08)] flex justify-around items-center p-2 rounded-[32px] w-full max-w-[340px]">
          {mainItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.id} 
                to={item.href} 
                className={cn(
                  "relative flex items-center justify-center size-12 rounded-2xl transition-all duration-500",
                  isActive ? "bg-indigo-600 shadow-lg shadow-indigo-200" : "text-slate-400 hover:bg-slate-50"
                )}
              >
                <img 
                  src={item.icon} 
                  className={cn("size-6 transition-all", isActive ? "brightness-200 scale-110" : "opacity-60")} 
                />
                {isActive && (
                  <span className="absolute -bottom-1 size-1 bg-indigo-600 rounded-full animate-pulse" />
                )}
              </Link>
            );
          })}

          {/* HAMBURGER TRIGGER */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "flex items-center justify-center size-12 rounded-2xl transition-all duration-500",
              isOpen ? "bg-slate-900 text-white rotate-90" : "bg-slate-50 text-slate-500"
            )}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>
      </div>

      {/* 2. THE OVERLAY MENU (Silk Effect) */}
      <div className={cn(
        "fixed inset-0 z-[65] bg-white/60 backdrop-blur-2xl transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] lg:hidden",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <div className={cn(
          "flex flex-col h-full pt-24 pb-40 px-10 transition-all duration-700 delay-100",
          isOpen ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
        )}>
          <div className="space-y-1">
             <p className="text-[11px] font-bold text-indigo-500 uppercase tracking-[0.2em] mb-6">Explore More</p>
            
            {remainingItems.map((item) => (
              <Link
                key={item.id}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between py-4 group active:scale-95 transition-transform"
              >
                <div className="flex items-center gap-5">
                  <div className="size-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
                     <img src={item.icon} className="size-5 opacity-80" />
                  </div>
                  <span className="text-lg font-medium text-slate-900">{item.label}</span>
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
              </Link>
            ))}
          </div>

          {/* User Preview in Menu */}
          <div className="mt-auto p-6 bg-indigo-50/50 rounded-[32px] border border-indigo-100/50 flex items-center gap-4">
             <div className="size-12 rounded-2xl bg-white p-1">
                <div className="size-full bg-slate-200 rounded-xl animate-pulse" /> {/* Replace with actual avatar */}
             </div>
             <div>
                <p className="text-sm font-bold text-slate-900">{user.name}</p>
                <p className="text-xs text-indigo-600 font-medium">View Profile</p>
             </div>
          </div>

         <div className='my-3 mt-6'>
           <button 
              onClick={() => handleLogout()}
              className="w-full p-6 bg-red-50/40 rounded-[32px] border border-red-100/30 flex items-center justify-between group active:scale-95 transition-all"
            >
              <div className="flex items-center gap-5">
                <div className="size-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-red-50">
                   <img src="/assets/icons/logout.svg" className="size-5 text-red-500 opacity-80" alt="Logout" />
                </div>
                <span className="text-lg font-medium text-red-600">Sign Out</span>
              </div>
              <ChevronRight size={18} className="text-red-200 group-hover:text-red-500 transition-colors" />
            </button>
         </div>
        </div>
        
      </div>
    </>
  );
};
