import { Outlet } from "react-router-dom";
import ManagerNavbar from "../ui/ManagerNavbar";
import ManagerSidebar from "../ui/ManagerSidebar";

export default function ManagerDashboardLayout() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-white via-gray-100 to-teal-50">
      <ManagerSidebar />
      <div className="flex-1 flex flex-col">
        <ManagerNavbar />
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
