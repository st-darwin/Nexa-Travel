import { useState, useEffect } from 'react';
import { UserSideBarItems } from "../constants";
import { Link, useLoaderData, useLocation, useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";
import { Menu, X, ChevronRight } from "lucide-react"; 
import { logoutUser } from '../appwrite/Auth';

export const UserMobileSidebar = () => {
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const user = useLoaderData();

  // Lock scroll when menu is open for that premium native app feel
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
  }, [isOpen]);

  const mainItems = UserSideBarItems.slice(0, 3);
  const remainingItems = UserSideBarItems.slice(3);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/sign-in');
    } catch (error) {
      console.error("Logout failed, moving to sign-in anyway:", error);
      navigate('/sign-in');
    }
  };

  return (
    <>
      {/* 1. THE FLOATING DOCK (Ultra-Sleek, Airy Glassmorphism) */}
      <div className="fixed bottom-6 left-0 right-0 z-[70] flex justify-center px-4 lg:hidden">
        <nav className="relative bg-white/80 backdrop-blur-2xl border border-slate-200/60 ring-1 ring-slate-900/[0.03] shadow-[0_16px_40px_rgba(15,23,42,0.06)] flex justify-between items-center px-2 py-1.5 rounded-[32px] w-full max-w-[390px] transition-all">
          
          {mainItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.label} 
                to={item.href} 
                className={cn(
                  "relative flex flex-col items-center justify-center py-1.5 px-3 rounded-[22px] transition-all duration-300 group",
                  isActive ? "bg-slate-100/80 shadow-[0_2px_12px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/60 text-slate-900 scale-[1.02]" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50/80"
                )}
              >
                <img 
                  src={item.icon} 
                  className={cn("size-5 transition-transform duration-300 group-hover:scale-110", isActive ? "scale-105 opacity-90" : "opacity-40 grayscale")} 
                />
                <span className={cn(
                  "text-[9px] font-medium mt-1 tracking-tight truncate max-w-[64px] text-center transition-colors",
                  isActive ? "text-slate-900 font-bold" : "text-slate-400"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* REFINED HAMBURGER TRIGGER (Soft Cool SaaS Glow) */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "flex flex-col cursor-pointer items-center justify-center py-2 px-3.5 rounded-[22px] transition-all duration-300 group",
              isOpen ? "bg-slate-900 text-white shadow-md shadow-slate-900/10 scale-95" : "text-slate-400 hover:text-slate-900 hover:bg-slate-100/60"
            )}
          >
            {isOpen ? <X size={20} strokeWidth={2.5} className="transition-transform group-hover:rotate-90" /> : <Menu size={20} strokeWidth={2.2} className="transition-transform group-hover:scale-110 opacity-70 group-hover:opacity-100" />}
          </button>
        </nav>
      </div>

      {/* 2. THE OVERLAY MENU (Soft Silk Backdrop & Cool Motion) */}
      <div className={cn(
        "fixed inset-0 z-[65] transition-all duration-500 ease-out lg:hidden",
        isOpen ? "bg-slate-950/20 backdrop-blur-md opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <div className={cn(
          "absolute inset-x-4 bottom-28 bg-white/95 backdrop-blur-3xl rounded-[36px] border border-slate-200/60 shadow-[0_25px_60px_rgba(15,23,42,0.1)] overflow-hidden transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1)",
          isOpen ? "translate-y-0 scale-100 opacity-100" : "translate-y-12 scale-95 opacity-0"
        )}>
          <div className="p-5 pt-7">
            <div className="w-10 h-1 bg-slate-200/70 rounded-full mx-auto mb-5" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] mb-4 px-2 text-center">Quick Navigation</p>
            
            <div className="grid grid-cols-1 gap-1.5 max-h-[46vh] overflow-y-auto pr-1">
              {remainingItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between p-3.5 rounded-[20px] bg-slate-50/60 hover:bg-slate-100/80 active:scale-[0.98] transition-all group border border-slate-100/80 hover:border-slate-200/60"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="size-10 bg-white rounded-2xl flex items-center justify-center shadow-xs group-hover:shadow-sm transition-all border border-slate-100">
                      <img src={item.icon} className="size-4 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-950 tracking-tight transition-colors">{item.label}</span>
                  </div>
                  <div className="size-7 rounded-full bg-slate-100/80 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-xs">
                    <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>

            {/* User Profile Card - Ultra Refined SaaS Vibe */}
            <div className="mt-4 p-3.5 bg-slate-50/80 backdrop-blur-md rounded-[22px] flex items-center justify-between border border-slate-200/50">
              <div className="flex items-center gap-3">
                 <div className="size-10 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-700 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                    {user?.name?.charAt(0) || "U"}
                 </div>
                 <div className="leading-tight">
                    <p className="text-xs font-bold text-slate-900">{user?.name || "User"}</p>
                    <p className="text-[10px] text-slate-400 font-medium">Standard Plan</p>
                 </div>
              </div>
              <button 
                onClick={handleLogout}
                className="size-9 cursor-pointer bg-white hover:bg-rose-50 rounded-xl shadow-xs border border-slate-200/70 flex items-center justify-center text-rose-500 hover:text-rose-600 active:scale-95 transition-all"
                title="Logout"
              >
                <img src="/assets/icons/logout.svg" className="size-3.5 opacity-80" alt="Logout" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};