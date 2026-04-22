import {
  ChartPie,
  Backpack,
  Users,
  Megaphone,
  Building2,
  Store,
  LayoutGrid,
  BriefcaseBusiness,
  FileChartColumnIncreasing,
  Grid2x2,
  Clipboard,
  Info,
} from "lucide-react";
import { IoExtensionPuzzleOutline, IoSettingsOutline } from "react-icons/io5";

import AdminDashboard from "@/pages/Admin/Dashboard/AdminDashboard";
import Settings from "@/pages/Admin/Settings/Settings";
import { Outlet } from "react-router-dom";

// Import new page components (assuming these exist or will be created)
// For now, I'll use AdminDashboard as a placeholder for new elements if they don't exist.
// You would replace these with actual component imports as needed.
const Overview = AdminDashboard;
const Works = AdminDashboard;
const Employees = AdminDashboard;
const MarketingStrategy = AdminDashboard;
const AlfalaBuilders = AdminDashboard;
const TimosSuperShop = AdminDashboard;
const AllProgram = AdminDashboard;
const ProgramBuilder = AdminDashboard;
const ProgramName = AdminDashboard;
const ProjectReview = AdminDashboard;
const ProjectBuilder = AdminDashboard;
const ActivityLog = AdminDashboard;
const Help = AdminDashboard;

export const adminRoutes = [
  {
    group: "Main Menu",
    items: [
      {
        icon: <ChartPie />,
        name: "Overview",
        path: "overview",
        element: <Outlet />,
        children: [
          {
            icon: <ChartPie />,
            name: "Index",
            index:true,
            element: <Overview />,
          },
          {
            icon: <ChartPie />,
            name: "User Profile1",
            path: "user-profile1",
            element: <Overview />,
          },
          {
            icon: <ChartPie />,
            name: "User Profile 2",
            path: "user-profile2",
            element: <Overview />,
          },
          {
            icon: <ChartPie />,
            name: "User Profile 3",
            path: "user-profile3",
            element: <Overview />,
            children: [
              {
                icon: <ChartPie />,
                name: "User Profile 4",
                path: "user-profile4",
                element: <Overview />,
                children: [
                  {
                    icon: <ChartPie />,
                    name: "User Profile 5",
                    path: "user-profile5",
                    element: <Overview />,
                    children: [
                      {
                        name: "User Profile 6",
                        path: "user-profile6",
                        element: <Overview />,
                      },
                    ],
                  },
                ],
              },
              {
                icon: <ChartPie />,
                name: "User Profile 7",
                path: "user-profile7",
                element: <Overview />,
              },
            ],
          },
        ],
      },
      {
        icon: <Backpack />,
        name: "Works",
        path: "works",
        element: <Works />,
      },
      {
        icon: <Users />,
        name: "Employees",
        path: "employees",
        element: <Employees />,
      },
    ],
  },
  {
    group: "Favorites",
    items: [
      {
        icon: <Megaphone />,
        name: "Marketing Strategy",
        path: "marketing-strategy",
        element: <MarketingStrategy />,
      },
      {
        icon: <Building2 />,
        name: "Alfala Building",
        path: "alfala-building",
        element: <AlfalaBuilders />,
      },
      {
        icon: <Store />,
        name: "Timo's Super Shop",
        path: "timos-super-shop",
        element: <TimosSuperShop />,
      },
    ],
  },
  {
    group: "Programs & Projects",
    items: [
      {
        icon: <LayoutGrid />,
        name: "All Program",
        path: "all-program",
        element: <AllProgram />,
      },
      {
        icon: <IoExtensionPuzzleOutline className="size-6" />,
        name: "Program Builder",
        path: "program-builder",
        element: <ProgramBuilder />,
      },
      {
        icon: <BriefcaseBusiness />,
        name: "Program Name",
        path: "program-name",
        element: <ProgramName />,
      },
      {
        icon: <FileChartColumnIncreasing />,
        name: "Project Review",
        path: "project-review",
        element: <ProjectReview />,
      },
      {
        icon: <Grid2x2 />,
        name: "Project Builder",
        path: "project-builder",
        element: <ProjectBuilder />,
      },
    ],
  },
  {
    group: "Support",
    items: [
      {
        icon: <Clipboard />,
        name: "Activity Log",
        path: "activity-log",
        element: <ActivityLog />,
      },
      {
        icon: <Info />,
        name: "Help",
        path: "help",
        element: <Help />,
      },
      {
        icon: <IoSettingsOutline className="size-6" />,
        name: "Settings",
        path: "settings",
        element: <Settings />,
      },
    ],
  },
];
