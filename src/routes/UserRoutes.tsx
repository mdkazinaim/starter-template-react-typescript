import { lazy } from "react";
import Loadable from "@/utils/Loadable";
import { UserSkeleton } from "@/common/Skeleton/User/UserSkeleton";
import { 
  LayoutDashboard, 
  User, 
  Settings as SettingsIcon,
  Bell,
  Lock,
  CreditCard
} from "lucide-react";

const UserDashboard = Loadable(
  lazy(() => import("@/pages/UserDashboard/UserDashboard")),
  UserSkeleton
);

export const userRoutes = [
  {
    group: "Dashboard",
    items: [
      {
        icon: <LayoutDashboard />,
        name: "Overview",
        index: true,
        element: <UserDashboard />,
      },
    ],
  },
  {
    group: "Account",
    items: [
      {
        icon: <User />,
        name: "Profile",
        path: "profile",
        element: <UserDashboard />, // Placeholder
      },
      {
        icon: <SettingsIcon />,
        name: "Settings",
        path: "settings",
        element: <UserDashboard />, // Placeholder
      },
    ],
  },
  {
    group: "Security & Billing",
    items: [
      {
        icon: <Lock />,
        name: "Security",
        path: "security",
        element: <UserDashboard />, // Placeholder
      },
      {
        icon: <Bell />,
        name: "Notifications",
        path: "notifications",
        element: <UserDashboard />, // Placeholder
      },
      {
        icon: <CreditCard />,
        name: "Billing",
        path: "billing",
        element: <UserDashboard />, // Placeholder
      },
    ],
  },
];
