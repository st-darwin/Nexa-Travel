import { useState, useEffect } from 'react';
import { UserSideBarItems } from "../constants";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";
import { Menu, X, ChevronRight } from "lucide-react"; 

export const UserMobileSidebar = () => {
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Lock scroll when menu is open for that "App" feel
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
  }, [isOpen]);

  const mainItems = UserSideBarItems.slice(0, 3);
  const remainingItems = UserSideBarItems.slice(3);

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
             <p className="text-[11px] font-bold text-indigo-500 uppercase tracking-[0.2em] mb-6">Explore Nexa</p>
            
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
                <p className="text-sm font-bold text-slate-900">Premium Member</p>
                <p className="text-xs text-indigo-600 font-medium">View Profile</p>
             </div>
          </div>
        </div>
      </div>
    </>
  );
};