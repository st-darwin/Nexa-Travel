
import { Outlet, useLoaderData } from 'react-router-dom'
import {SidebarComponent} from "@syncfusion/ej2-react-navigations"
import NavItems from '../../components/NavItems'
import MobileSidebar from '../../components/MobileSidebar'

import { redirect } from 'react-router-dom'
import { getExistingUser } from '../../appwrite/Auth'
import { getUser , storeUserData } from '../../appwrite/Auth'

  //loader
export const clientLoader = async () => {
  

    try {
      
        const user = await getUser();
        if (!user) return redirect('/sign-in');

        const existingUser = await getExistingUser();
        
        // Use a path that is OUTSIDE the AdminLayout to avoid the infinite loop
        if (existingUser?.status === "user") {
            return redirect("/");  // user homepage
        }

        // If user exists, return them. If not (first time login), store them.
        return existingUser?.$id ? existingUser : await storeUserData(); // this becomes the new user
    } catch (error) {
        console.error("Error in Client Loader ", error);
        return redirect('/sign-in');
    }
};


const AdminLayout = () => {
  const user = useLoaderData()
  return (
    <div className='admin-layout'>
     <MobileSidebar/>


     {/* the aside comp is hidden on mod=bile screens  */}
     <aside className='w-full  max-w-[270px] hidden lg:block'>
      
    <SidebarComponent width={270} 
   
    enableGestures={false} >
      <NavItems handleClick={()=>{}} />
    </SidebarComponent>
     </aside>
      {/* the aside comp is hidden on mod=bile screens  */}



     <aside className='children xl:mt-10'>
       <Outlet context={user} />
     </aside>

    </div>
  )
}

export default AdminLayout
