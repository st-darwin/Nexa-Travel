import React from 'react'
import { Outlet } from 'react-router-dom'
import {SidebarComponent} from "@syncfusion/ej2-react-navigations"
import NavItems from '../../components/NavItems'
import MobileSidebar from '../../components/MobileSidebar'

const AdminLayout = () => {
  return (
    <div className='admin-layout'>
     <MobileSidebar/>


     {/* the aside comp is hidden on mod=bile screens  */}
     <aside className='w-full max-w-[270px] hidden lg:block'>
      
    <SidebarComponent width={270}  enableGestures={false} >
      <NavItems handleClick={()=>{}} />
    </SidebarComponent>
     </aside>
      {/* the aside comp is hidden on mod=bile screens  */}



     <aside className='children'>
       <Outlet/>
     </aside>

    </div>
  )
}

export default AdminLayout
