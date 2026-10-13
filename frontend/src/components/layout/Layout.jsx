import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export const Layout = ({ requireAuth = true }) => {
  const { user } = useAuth();
  const showSidebar = requireAuth && Boolean(user);

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen sparkle-bg overflow-x-hidden flex flex-col">
      {/* Fixed Navbar at the top */}
      <Navbar />

      <div className="flex flex-1 pt-16">
        {/* Sidebar for authenticated views */}
        {showSidebar && <Sidebar />}

        {/* Main Content Canvas */}
        <main className={`flex-1 min-h-[calc(100vh-4rem)] ${showSidebar ? 'md:pl-64' : ''}`}>
          <div className="p-6 md:p-10 max-w-[1400px] mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
