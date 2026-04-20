import { Outlet, useLoaderData, useNavigation, redirect } from 'react-router-dom'
import { SidebarComponent } from "@syncfusion/ej2-react-navigations"
import UserNavitems from '../../components/UserNavItems'
import { UserMobileSidebar } from '../../components/UserMobileSideBar'
import StatsSkeleton from '../../components/StatsSkeleton' // Import your skeleton

import { getExistingUser, getUser, storeUserData } from '../../appwrite/Auth'

// loader remains the same
export const UserClientLoader = async () => {
    const user = await getUser();
    if (!user) return redirect('/sign-in');

    const existingUser = await getExistingUser();

    // If they are an admin, they can stay here or you can 
    // force them back to the root if you want them strictly in Admin mode.
    return existingUser;
};

const UserLayout = () => {
  const user = useLoaderData()
  const navigation = useNavigation()

  // This detects if any sub-route (Dashboard, Users, etc.) is currently loading
  const isLoading = navigation.state === "loading"

  return (
    <div className='admin-layout'>
      <UserMobileSidebar />

      <aside className='w-full max-w-[270px] hidden lg:block'>
        <SidebarComponent width={270} enableGestures={false}>
          <UserNavitems handleClick={() => {}} />
        </SidebarComponent>
      </aside>

      <aside className='children xl:mt-10'>
        {/* SOFT UI TRANSITION: 
          If loading, show the skeleton. 
          If idle, show the actual page (Outlet).
        */}
        {isLoading ? (
          <div className="animate-in fade-in duration-500">
            <StatsSkeleton />
          </div>
        ) : (
          <Outlet context={user} />
        )}
      </aside>
    </div>
  )
}

export default UserLayout