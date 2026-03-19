import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import { sidebarItems } from '../constants'
import { cn } from '../lib/utils'

const NavItems = ({ handleClick }: { handleClick: () => void }) => {
  const user = {
    name: "Darwin",
    email: "solomon.dev@gmail.com",
    imageUrl: "/assets/images/david.webp" 
  }

  return (
    <section className="flex h-full flex-col bg-white border-r border-slate-100 p-6 w-72">
      {/* Branding Section */}
      <Link to="/" className="flex items-center gap-3 px-2 mb-12 group transition-transform active:scale-95">
        <div className="size-9 flex items-center justify-center  rounded-xl shadow-lg shadow-indigo-200 group-hover:rotate-3 transition-all duration-300">
          <img className="size-8  " src="/assets/icons/logo.svg" alt="logo" />
        </div>
        <h1 className="font-bold text-xl tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
          NexaTravel
        </h1>
      </Link>

      <div className="flex flex-1 flex-col justify-between">
        {/* Navigation */}
        <nav className="flex flex-col gap-1.5">
          {sidebarItems.map((item) => (
            <NavLink to={item.href} key={item.id}>
              {({ isActive }: { isActive: boolean }) => (
                <div 
                  onClick={handleClick} 
                  className={cn(
                    'group flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer',
                    'hover:bg-slate-50 hover:translate-x-1',
                    {
                      'bg-indigo-50/80 text-indigo-600 shadow-sm shadow-indigo-100/50': isActive,
                      'text-slate-500 font-medium': !isActive
                    }
                  )}
                >
                  <div className={cn(
                    'flex items-center justify-center transition-colors',
                    { 'text-indigo-600': isActive, 'text-slate-400 group-hover:text-slate-600': !isActive }
                  )}>
                    {/* Assuming these are SVGs/Icons - applying currentColor if possible */}
                    <img 
                      src={item.icon} 
                      alt={item.label}
                      className={cn(
                        'size-5 transition-all',
                        isActive ? 'opacity-100 scale-110' : 'opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100'
                      )}
                    />
                  </div>
                  <span className="text-[14px] leading-none">{item.label}</span>
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Premium Footer */}
        <footer className="mt-auto">
          <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3 border border-slate-100/50">
            <div className="relative">
              <img 
                src={user?.imageUrl} 
                alt="profile" 
                className="size-10 rounded-xl object-cover ring-2 ring-white shadow-sm" 
              />
              <span className="absolute bottom-0 right-0 size-2.5 bg-green-500 border-2 border-slate-50 rounded-full"></span>
            </div>
            
            <article className="flex flex-col flex-1 min-w-0">
               <h2 className="text-[13px] font-bold text-slate-900 truncate tracking-tight">{user?.name}</h2>
               <p className="text-[11px] text-slate-500 truncate font-medium uppercase tracking-wider">{user?.email}</p>
            </article>

            <button 
              onClick={() => console.log("Logged Out.")}
              className="group p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            >
              <img 
                src="assets/icons/logout.svg" 
                alt="logout" 
                className="size-4 opacity-50 group-hover:opacity-100 transition-opacity" 
              />
            </button>
          </div>
        </footer>
      </div>
    </section>   
  )
}

export default NavItems