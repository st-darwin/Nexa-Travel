import { Link, NavLink, useLoaderData, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { UserSideBarItems } from '../constants';

const UserNavitems = ({ handleClick }: { handleClick: () => void }) => {
  const user: any = useLoaderData();
  const navigate = useNavigate();

  const HandleLogout = () => {
    navigate('/logout');
  };

  return (
    <section className="h-full flex flex-col bg-slate-50/50 p-5 w-72">
      {/* Container with softer shadow and deeper rounding */}
      <div className="flex flex-col h-full bg-white rounded-[32px] border border-slate-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-4">
        
        {/* Brand Section - Cleaned up spacing */}
        <Link to="/" className="flex items-center gap-3 px-3 mb-12 mt-10 transition-opacity hover:opacity-80">
          <div className="size-10 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-100">
            <img className="size-7" src="/assets/icons/logo1.svg" alt="logo" />
          </div>
          <span className="font-bold text-[17px] tracking-tight text-slate-900">Nexa Travel</span>
        </Link>

        {/* Nav List - Improved interaction and weight */}
        <nav className="flex-1 space-y-1 px-1">
  {UserSideBarItems.map((item) => (
    <NavLink to={item.href} key={item.label} onClick={handleClick}>
      {({ isActive }) => (
        <div className={cn(
          "group flex items-center gap-3.5 px-4 my-4 py-3 rounded-2xl transition-all duration-300",
          isActive 
            ? "bg-slate-900 text-white shadow-lg shadow-slate-200" 
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
        )}>
          {/* Icon using CSS Mask for true color control */}
          <div 
            style={{
              maskImage: `url(${item.icon})`,
              WebkitMaskImage: `url(${item.icon})`,
              maskSize: 'contain',
              maskRepeat: 'no-repeat',
              maskPosition: 'center',
            }}
            className={cn(
              "size-5 transition-all duration-300", 
              isActive 
                ? "bg-white scale-110" // Matches white text perfectly
                : "bg-slate-500 opacity-60 group-hover:opacity-100 group-hover:bg-slate-900"
            )} 
          />
          
          <span className="text-[14px] font-semibold tracking-tight">
            {item.label}
          </span>
        </div>
      )}
    </NavLink>
  ))}
</nav>

        {/* Profile Card - Modernized with better layering */}
        <div className="mt-auto bg-slate-50/80 p-3 rounded-[24px] flex items-center gap-3 border border-slate-100/50">
          <div className="relative">
            <img 
              src={user?.imageUrl} 
              className="size-10 rounded-xl object-cover ring-2 ring-white shadow-sm" 
              alt="profile" 
              referrerPolicy="no-referrer"
            />
            <span className="absolute bottom-0 right-0 size-2.5 bg-green-500 border-2 border-slate-50 rounded-full"></span>
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-slate-900 truncate tracking-tight">{user?.name}</p>
            <p className="text-[11px] text-slate-500 truncate font-medium">{user?.email}</p>
          </div>

          <button 
            onClick={HandleLogout} 
            className="p-2.5 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl border border-slate-100 shadow-sm transition-all active:scale-95"
          >
            <img src="assets/icons/logout.svg" className="size-4" alt="logout" />
          </button>
        </div>
      </div>
    </section>
  );
}

export default UserNavitems;
