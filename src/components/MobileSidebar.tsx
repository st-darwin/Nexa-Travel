import { SidebarComponent } from '@syncfusion/ej2-react-navigations';
import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import NavItems from './NavItems';

const MobileSidebar = () => {
  // 1. Create a persistent reference
  const sidebarRef = useRef(null);

  const toggleSidebar = () => {
    // 2. Access the instance via .current
    if (sidebarRef.current) {
      sidebarRef.current.toggle();
    }
  };

  return (
    <div className='mobile-sidebar wrapper'>
      <header className="flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img
            src="/assets/icons/logo.svg"
            alt="logo"
            className='size-[30px]'
          />
          <h1 className="ml-2">Nexa Travel</h1>
        </Link>

        {/* 3. Use the toggle function */}
        <button onClick={toggleSidebar}>
          <img 
            src="/assets/icons/menu.svg" 
            alt="menu" 
            className='size-7' 
          />
        </button>
      </header>

      {/* 4. Attach the ref to the component */}
      <SidebarComponent 
        width={300} 
        ref={sidebarRef}
        created={() => sidebarRef.current?.hide()}
        closeOnDocumentClick={true}
        showBackdrop={true}
        type='Over' // Note: Syncfusion usually expects 'Over' (capitalized)
      >
            {/* once navbar items is clicked...the sidebar toggles  */}
       <NavItems handleClick={toggleSidebar} />


      </SidebarComponent >
    </div>
  );
};

export default MobileSidebar;