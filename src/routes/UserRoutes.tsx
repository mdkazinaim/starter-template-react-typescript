import { lazy } from "react";

const UserDashboard = lazy(() => import("@/pages/UserDashboard/UserDashboard"));

export const userRoutes = [
  {
    index: true,
    element: <UserDashboard />,
  },
  // Add more user-specific routes here
];
