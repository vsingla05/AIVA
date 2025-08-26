import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.jsx";
import Login from "./pages/auth/login.jsx";
import Signup from "./pages/emplyees/Signup.jsx";
import { Provider } from "react-redux";
import store from "./store/store.js";
import Logout from "./components/auth/Logout.jsx";
import AuthLayout from "./components/auth/authLayout.jsx";
import Home from "./pages/auth/Home.jsx";

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
        element: <AuthLayout roles={["EMPLOYEE", "HR", "ADMIN"]} />,
        children: [
          {
            path: "auth/logout",
            element: <Logout />,
          },
        ],
      },
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
