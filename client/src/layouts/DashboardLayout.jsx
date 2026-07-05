import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar.jsx";
import Topbar from "../components/layout/Topbar.jsx";
import { useState } from "react";

const DashboardLayout = ({ title }) => {
  return (
    <div className="min-h-screen flex bg-neutral-50 dark:bg-neutral-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title={title} />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
