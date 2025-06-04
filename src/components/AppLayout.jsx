import React, { useState, useEffect } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

function AppLayout() {
  const location = useLocation();
  const [showSidebar, setShowSidebar] = useState(false);
  
  // Check if user is on admin pages (dashboard or any other admin route)
  const isAdminRoute = (path) => {
    return path.startsWith('/dashboard') || 
           path.includes('/courses') || 
           path.includes('/users') ||
           path.includes('/enrollments') ||
           path.includes('/discussions') ||
           path.includes('/analytics') ||
           path.includes('/announcements') ||
           path.includes('/content') ||
           path.includes('/feedback') ||
           path.includes('/settings') ||
           path.includes('/admin');
  };
  
  // Update sidebar visibility whenever location changes
  useEffect(() => {
    setShowSidebar(isAdminRoute(location.pathname));
  }, [location.pathname]);

  return (
    <div className="flex flex-grow">
      {showSidebar && <Sidebar />}
      <main className={`flex-grow ${showSidebar ? 'ml-0 md:ml-64 p-4' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
