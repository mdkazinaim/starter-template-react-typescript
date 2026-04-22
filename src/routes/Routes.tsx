import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import { routesGenerator } from "@/utils/Generator/RoutesGenerator";

// [ADMIN_MODULE_START]
import { adminRoutes } from "./AdminRoutes";
import DashboardLayout from "@/Layout/DashboardLayout/DashboardLayout";
const AdminDashboard = lazy(() => import("@/pages/Admin/Dashboard/AdminDashboard"));
// [ADMIN_MODULE_END]

// [USER_MODULE_START]
import { userRoutes } from "./UserRoutes";
const UserDashboard = lazy(() => import("@/pages/UserDashboard/UserDashboard"));
// [USER_MODULE_END]

// [PUBLIC_MODULE_START]
import { publicRoutes } from "./PublicRoutes";
// [PUBLIC_MODULE_END]

// CORE COMPONENTS (Always included)
const App = lazy(() => import("../App"));
const Login = lazy(() => import("@/pages/Auth/Login"));
const Signup = lazy(() => import("@/pages/Auth/Signup"));
const Form = lazy(() => import("@/pages/Form"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const routes = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <App />
      </Suspense>
    ),
    children: [
      // [PUBLIC_ROUTES_START]
      ...routesGenerator(publicRoutes),
      // [PUBLIC_ROUTES_END]
      {
        path: "/form",
        element: <Form />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/signup",
        element: <Signup />,
      },
    ],
  },

  // [ADMIN_ROUTES_START]
  {
    path: "/admin",
    element: (
      <Suspense fallback={<div>Loading Dashboard...</div>}>
        <DashboardLayout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
      ...routesGenerator(adminRoutes),
    ],
  },
  // [ADMIN_ROUTES_END]

  // [USER_ROUTES_START]
  {
    path: "/user",
    element: (
      <Suspense fallback={<div>Loading Dashboard...</div>}>
        <DashboardLayout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: <UserDashboard />,
      },
      ...routesGenerator(userRoutes),
    ],
  },
  // [USER_ROUTES_END]

  {
    path: "*",
    element: <NotFound />,
  },
]);

export default routes;
