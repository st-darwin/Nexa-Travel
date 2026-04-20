import { Outlet, useLoaderData, useNavigation, redirect } from 'react-router-dom'

import UserNavitems from '../../components/UserNavItems'
import { UserMobileSidebar } from '../../components/UserMobileSideBar'
import StatsSkeleton from '../../components/StatsSkeleton' // Import your skeleton

import { getExistingUser, getUser, storeUserData } from '../../appwrite/Auth'

// loader remains the same
export const UserClientLoader = async () => {
    const user = await getUser();
    if (!user) return redirect('/sign-in');

    const existingUser = await getExistingUser();
    if(!existingUser) {
      await storeUserData()
    }

    // If they are an admin, they can stay here or you can 
    // force them back to the root if you want them strictly in Admin mode.
    return existingUser;
};

const UserLayout = () => {
  const user = useLoaderData()
  const navigation = useNavigation()

  // This detects if any sub-route (Dashboard, Users, etc.) is currently loading
  const isLoading = navigation.state === "loading"

  // Inside UserLayout.tsx
return (
  <div className="flex h-screen bg-slate-50 overflow-hidden">
    {/* Floating Mobile Dock */}
    <UserMobileSidebar />

    {/* Desktop Sidebar */}
    <aside className="hidden lg:flex h-full">
      <UserNavitems handleClick={() => {}} />
    </aside>

    {/* Main Content Area */}
    <main className="flex-1 overflow-y-auto px-4 pt-8 pb-32 lg:pb-8 xl:px-12">
      {isLoading ? (
        <div className="max-w-7xl mx-auto animate-pulse">
          <StatsSkeleton />
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
          <Outlet context={user} />
        </div>
      )}
    </main>
  </div>
);
}

export default UserLayout
