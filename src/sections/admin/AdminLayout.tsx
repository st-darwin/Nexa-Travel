import { Outlet, useLoaderData, useNavigation, redirect } from 'react-router-dom'
import { SidebarComponent } from "@syncfusion/ej2-react-navigations"
import NavItems from '../../components/NavItems'
import MobileSidebar from '../../components/MobileSidebar'
import StatsSkeleton from '../../components/StatsSkeleton' // Import your skeleton

import { getExistingUser, getUser, storeUserData } from '../../appwrite/Auth'

// loader remains the same
export const clientLoader = async () => {
  const user = await getUser();
    if (!user) return redirect('/sign-in');

    const existingUser = await getExistingUser();

    if(!existingUser) {
      await storeUserData()
    }
    
    // If a standard USER tries to access the root (Admin territory), 
    // send them to /Home
    if (existingUser?.status === "user") {
        return redirect("/Home");
    }

    return existingUser;
  }

const AdminLayout = () => {
  const user = useLoaderData()
  const navigation = useNavigation()

  // This detects if any sub-route (Dashboard, Users, etc.) is currently loading
  const isLoading = navigation.state === "loading"

  return (
    <div className='admin-layout'>
      <MobileSidebar />

      <aside className='w-full max-w-[270px] hidden lg:block'>
        <SidebarComponent width={270} enableGestures={false}>
          <NavItems handleClick={() => {}} />
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

export default AdminLayout
