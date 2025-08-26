import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from './App.jsx'
import Login from './pages/auth/login.jsx'
import Signup from './pages/emplyees/Signup.jsx';
import { Provider } from 'react-redux';
import store from './store/store.js' 
import Logout from './components/auth/Logout.jsx'
import AuthLayout from './components/auth/authLayout.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: 'auth/login',
        element: <Login/>
      },

      {
        element: <AuthLayout roles={['EMPLOYEE', 'HR', 'ADMIN']}/>,
        children: [
          {
            path: 'auth/logout',
            element: <Logout/>
          }
        ] 
      },
      {
        element: <AuthLayout roles={['EMPLOYEE']}/>,
        children: [
          {
            path: 'user/signup',
            element: <Signup/>
          }
        ] 
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
