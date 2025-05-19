import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import LoginPage from './pages/login.jsx';
import RegisterPage from './pages/register.jsx';
import UserPage from './pages/user.jsx';
import './styles/global.css';
import ErrorPage from './pages/error.jsx';
import { AuthWrapper } from './components/context/auth.context.jsx';
import PrivateRoute from './pages/private.route.jsx';
import 'nprogress/nprogress.css';
import AppUser from './pages/appUser.jsx';
import Home from './components/home/home.jsx';
import ProductPage from './pages/product.jsx';
import Banking from './pages/banking.jsx';
import ForgotPassword from './pages/forgot-password.jsx';
import ChangePassword from './pages/change-password.jsx';
import Setting from './pages/setting.jsx';
import PersonalInformation from './pages/personal-information.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: "/users",
        element: (
          <PrivateRoute>
            <UserPage />
          </PrivateRoute>
        )
      },

      {
        path: "/app",
        element: (
          <PrivateRoute>
            <AppUser />
          </PrivateRoute>
        )
      },

      {
        path: "/products",
        element: (
          <PrivateRoute>
            <ProductPage />
          </PrivateRoute>
        )
      },

      {
        path: "/banking",
        element: (
          <PrivateRoute>
            <Banking />
          </PrivateRoute>
        )
      },

      {
        path: "/setting",
        element: (
          <PrivateRoute>
            <Setting />
          </PrivateRoute>
        ),
        children: [
          {
            path: "change-password",
            element: <ChangePassword />
          },
          {
            path: "infor",
            element: <PersonalInformation />
          },
        ]
      }

    ]
  },

  {
    path: "/login",
    element: <LoginPage />
  },

  {
    path: "/register",
    element: <RegisterPage />
  },

  {
    path: "/forgot-password",
    element: <ForgotPassword />
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
  < AuthWrapper>
    < RouterProvider router={router} />
  </AuthWrapper>
  // </React.StrictMode>,
)
