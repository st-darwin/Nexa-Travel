
import { Link, NavLink, useLoaderData , useNavigate  } from 'react-router-dom'

import { cn } from '../lib/utils'
import { UserSideBarItems } from '../constants'


const UserNavitems = ({ handleClick }: { handleClick: () => void }) => {
const user = useLoaderData()
const navigate = useNavigate();

const HandleLogout = async() =>{
  try{
  
    navigate('/logout')
  }
  catch(error){
    console.error("Logout failed", error);
  }
}


// Inside UserNavitems.tsx
return (
  <section className="h-full flex flex-col bg-slate-50/50 p-4 w-72">
    {/* Floating Container */}
    <div className="flex flex-col h-full bg-white rounded-[24px] border border-slate-200/60 shadow-sm p-4">
      {/* Brand */}
      <Link to="/" className="flex items-center gap-3 px-3 mb-10 mt-2">
        <div className="size-10 flex items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-200">
          <img className="size-6 invert" src="/assets/icons/logo1.svg" alt="logo" />
        </div>
        <span className="font-bold text-lg tracking-tight text-slate-800">Nexa</span>
      </Link>

      {/* Nav List */}
      <nav className="flex-1 space-y-1">
        {UserSideBarItems.map((item) => (
          <NavLink to={item.href} key={item.id}>
            {({ isActive }) => (
              <div className={cn(
                "group flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300",
                isActive 
                  ? "bg-slate-900 text-white shadow-md shadow-slate-200" 
                  : "text-slate-500 hover:bg-white hover:shadow-sm"
              )}>
                <img 
                  src={item.icon} 
                  className={cn("size-5", isActive ? "brightness-200" : "opacity-70")} 
                />
                <span className="text-[14px] font-medium">{item.label}</span>
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Profile Card */}
      <div className="mt-auto bg-slate-50 p-3 rounded-2xl flex items-center gap-3 border border-slate-100">
        <img src={user?.imageUrl} className="size-9 rounded-xl object-cover" alt="pfp" />
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-bold text-slate-900 truncate">{user?.name}</p>
        </div>
        <button onClick={HandleLogout} className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-red-500 transition-colors">
          <img src="assets/icons/logout.svg" className="size-4" />
        </button>
      </div>
    </div>
  </section>
);
}

export default UserNavitems