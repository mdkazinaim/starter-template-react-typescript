import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import { adminRoutes } from "./AdminRoutes";
import { publicRoutes } from "./PublicRoutes";
import { routesGenerator } from "@/utils/Generator/RoutesGenerator";
import DashboardLayout from "@/Layout/DashboardLayout/DashboardLayout";

const App = lazy(() => import("../App"));
const Login = lazy(() => import("@/pages/Auth/Login"));
const Signup = lazy(() => import("@/pages/Auth/Signup"));
const Form = lazy(() => import("@/pages/Form"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const AdminDashboard = lazy(() => import("@/pages/Admin/Dashboard/AdminDashboard"));

const routes = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <App />
      </Suspense>
    ),
    children: [
      ...routesGenerator(publicRoutes),
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
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default routes;
