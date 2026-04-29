
import { useNavigate } from 'react-router-dom'
import { LogOut, ArrowLeft, ShieldAlert } from 'lucide-react' // Using lucide for crisp icons

import { logoutUser } from '../../appwrite/Auth'
const Logout = () => {
  const navigate = useNavigate()
// Inside Logout.tsx
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
    <div className="min-h-[60vh]  flex items-center mt-35 justify-center p-6">
      <div className="w-full max-w-md bg-white border border-light-200/60 rounded-3xl p-8 transition-all duration-500">
        
        {/* Icon Header */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center border border-light-200">
            <ShieldAlert className="text-dark-100 w-8 h-8" strokeWidth={2.5} />
          </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl font-extrabold text-dark-100 tracking-tighter">
            Terminate Session?
          </h2>
          <p className="text-gray-500 text-sm md:text-base leading-relaxed">
            All unsaved changes to your **Nexa Travel** itineraries will be synced to your last local commit.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleLogout}
            className="group flex items-center justify-center gap-2 h-13 w-full bg-dark-100 text-white font-bold rounded-2xl transition-all duration-200 hover:bg-red-600 active:scale-[0.96] cursor-pointer"
          >
            <LogOut size={18} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
            Logout Now
          </button>

          <button
            onClick={() => {
              navigate(-1); // Stay on the dashboard, but replace history to prevent back navigation to logout
            }}
            className="flex items-center justify-center gap-2 h-13 w-full bg-transparent text-gray-500 font-semibold rounded-2xl border border-transparent hover:border-light-200 hover:text-dark-100 transition-all duration-200 active:scale-[0.98] cursor-pointer"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
            Stay Signed In
          </button>
        </div>

        {/* Footer Note */}
        <p className="mt-8 text-center text-xs text-gray-400 font-medium uppercase tracking-widest">
          Secure End-of-Session — Nexa Ecosystem
        </p>
      </div>
    </div>
  )
}

export default Logout