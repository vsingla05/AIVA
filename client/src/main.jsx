import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.jsx";
import Login from "./pages/auth/login.jsx";
import Signup from './pages/employees/Signup.jsx'
import { Provider } from "react-redux";
import store from "./store/store.js";
import AuthLayout from "./components/auth/authLayout.jsx";
import Home from "./pages/auth/Home.jsx";
import ChatBot from "./ai/ChatBot.jsx";
import Logout from './components/auth/Logout.jsx'
import Profile from './pages/employees/AddProfile.jsx'
import AllEmployeeTasks from "./pages/employees/allEmployeeTasks.jsx";
import TaskDetailsPage from './pages/employees/taskDetails.jsx'
import HandleFinalTask from "./pages/hr/handleFinalTask.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: '',
        element: <Home/>
      },
      {
        path: "auth/login",
        element: <Login />,
      },
      {
        path: "user/signup",
        element: <Signup />,
      },
      {
        path: 'chatbot',
        element: <ChatBot/>
      },

      {
        element: <AuthLayout roles={["EMPLOYEE", "HR", "ADMIN"]} />,
        children: [
          {
            path: "auth/logout",
            element: <Logout />,
          },
        ],
      },
      {
        element: <AuthLayout roles={['EMPLOYEE']} />,
        children: [
          {
            path: 'employee/addProfile',
            element: <Profile/>
          },
          {
            path: 'employee/tasks',
            element: <AllEmployeeTasks/>
          },
          {
            path: 'employee/task/:id',
            element: <TaskDetailsPage/>
          },
          {
            path: 'hr/tasks-assign',
            element: <HandleFinalTask/>
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
