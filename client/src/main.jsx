import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";

import "./index.css";
import store from "./store/store.js";

import App from "./App.jsx";
import AuthLayout from "./components/auth/authLayout.jsx";
import DashboardLayout from "./layout/DashboardLayout.jsx";

// Auth
import Home from "./pages/auth/Home.jsx";
import Login from "./pages/auth/login.jsx";
import Signup from "./pages/employees/Signup.jsx";
import Logout from "./components/auth/Logout.jsx";

// Employee Pages
import EmployeeDashboard from "./pages/employees/EmployeeDashboard.jsx";
import NotificationsPage from "./pages/employees/Notifications.jsx";
import ChatBot from './pages/Chat.jsx'
import Profile from "./pages/employees/AddProfile.jsx";
import AllEmployeeTasks from "./pages/employees/allEmployeeTasks.jsx";
import TaskDetailsPage from "./pages/employees/TaskOverview.jsx";
import GetAssignedTask from "./components/employees/task/getAssignedTask.jsx";
import EmployeeTaskAction from "./components/employees/task/handleEmployeeAction.jsx";
import ViewTaskProof from "./components/manager/viewTaskProof.jsx";
import NewTasks from "./components/employees/NewTasks.jsx";
import TaskAction from "./components/employees/TakeAction.jsx";
import TaskOverviewCard from "./pages/employees/TaskOverview.jsx";
import EmployeeProfile from "./pages/employees/Profile.jsx";
import ManagerDashboardOverview from "./pages/manager/ManagerDashboardOverview.jsx";

// Manager Pages
import ManagerDashboardLayout from "./layout/ManagerDashboardLayout.jsx";
import Employees from "./pages/manager/Employees.jsx";
import TaskProofs from "./pages/manager/TaskProofs.jsx";
import ProjectDashboard from "./pages/manager/ViewProjects.jsx";
import AnalyticsSection from "./pages/manager/AnalyticsSection.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "", element: <Home /> },
      { path: "auth/login", element: <Login /> },
      { path: "user/signup", element: <Signup /> },

      // 🔐 Logout (protected)
      {
        element: <AuthLayout roles={["EMPLOYEE", "HR", "ADMIN"]} />,
        children: [{ path: "auth/logout", element: <Logout /> }],
      },

      // 👤 Employee Area
      {
        element: <AuthLayout roles={["EMPLOYEE"]} />,
        children: [
          {
            element: <DashboardLayout />, 
            children: [
              { path: "dashboard", element: <EmployeeDashboard /> },
              { path: "chat", element: <ChatBot /> },
              { path: "notifications", element: <NotificationsPage /> },
              { path: "employee/addProfile", element: <Profile /> },
              { path: "employee/tasks", element: <AllEmployeeTasks /> },
              { path: "employee/task/:id", element: <TaskDetailsPage /> },
              { path: "employee/viewTask", element: <GetAssignedTask /> },
              { path: "employee/action", element: <EmployeeTaskAction /> },
              { path: "view-taskProofs", element: <ViewTaskProof /> },
              { path: "task-page", element: <NewTasks/> },
              { path: "task/:id/action", element: <TaskAction/> },
              { path: "employee/details", element: <EmployeeProfile/> }
            ],
          },
        ],
      },

      {
        element: <AuthLayout roles={["HR"]} />,
        children: [
          {
            element: <ManagerDashboardLayout />,
            children: [
              { path: "manager-dashboard", element: <ManagerDashboardOverview/> },
              { path: "manager/chat", element: <ChatBot/> },
              { path: "manager/employees", element: <Employees/> },
              { path: "manager/profile", element: <EmployeeProfile/> },
              { path: "manager/task-proofs", element: <TaskProofs/> },
              { path: "manager/projects", element: <ProjectDashboard/> },
              { path: "manager/analytics", element: <AnalyticsSection/> }
            ]
          }
        ]
      }
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
);
