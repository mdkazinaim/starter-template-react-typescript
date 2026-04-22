/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Power, LayoutDashboard, User, Settings, Activity } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { toast } from "sonner";
import { logOut } from "@/store/features/AuthSlice/authSlice";
import { cn } from "@/lib/utils";

interface UserProfileProps {
  className?: string;
}

export default function UserProfile({ className }: UserProfileProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { user } = useAppSelector((state) => state.auth);
  
  const demoUser = {
    name: "John Doe",
    email: "john@example.com",
    role: "Administrator",
    profileImage: "https://api.dicebear.com/9.x/avataaars/svg?seed=John"
  };

  const displayName = user?.email ? user.email.split('@')[0] : demoUser.name;
  const displayEmail = user?.email || demoUser.email;
  const displayRole = user?.role || demoUser.role;
  const displayImage = demoUser.profileImage;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    try {
      dispatch(logOut());
      toast.success("Logout successful");
      setIsOpen(false);
      navigate("/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      {/* Trigger Button - Using Slate colors for premium look */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1.5 pr-4 rounded-full hover:bg-slate-100 transition-all duration-300 focus:outline-none group border border-gray-200 bg-white shadow-sm"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 shadow-inner">
          <img
            src={displayImage}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="hidden lg:flex flex-col items-start">
          <span className="text-[13px] font-bold text-slate-900 leading-none mb-0.5">
            {displayName}
          </span>
          <span className="text-[9px] text-slate-500 uppercase tracking-wider font-extrabold">
            {displayRole}
          </span>
        </div>
        <ChevronDown 
          className={cn(
            "w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform duration-300",
            isOpen && "rotate-180"
          )} 
        />
      </button>

      {/* Dropdown Menu - Light Theme Aesthetic */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-4 bg-slate-50/50 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-white border border-gray-200 shadow-sm">
                <img src={displayImage} alt={displayName} className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-slate-900 truncate">{displayName}</span>
                <span className="text-xs text-slate-500 truncate">{displayEmail}</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="p-2 space-y-0.5">
            <DropdownLink to="/admin" icon={LayoutDashboard} label="Dashboard" onClick={() => setIsOpen(false)} iconColor="text-blue-600" bgColor="bg-blue-50" />
            <DropdownLink to="/profile" icon={User} label="My Profile" onClick={() => setIsOpen(false)} iconColor="text-slate-600" bgColor="bg-slate-50" />
            <DropdownLink to="/settings" icon={Settings} label="Settings" onClick={() => setIsOpen(false)} iconColor="text-slate-600" bgColor="bg-slate-50" />
            <DropdownLink to="/user-activity-log" icon={Activity} label="Activity Log" onClick={() => setIsOpen(false)} iconColor="text-emerald-600" bgColor="bg-emerald-50" />
          </div>

          {/* Footer / Logout */}
          <div className="p-2 border-t border-gray-100 bg-slate-50/30">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group"
            >
              <div className="w-8 h-8 rounded-lg bg-red-100/50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                <Power className="w-3.5 h-3.5" />
              </div>
              <span className="text-[13px] font-bold">Logout Session</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface DropdownLinkProps {
  to: string;
  icon: any;
  label: string;
  onClick: () => void;
  iconColor?: string;
  bgColor?: string;
}

function DropdownLink({ to, icon: Icon, label, onClick, iconColor, bgColor }: DropdownLinkProps) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all duration-200 group"
    >
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200", bgColor)}>
        <Icon className={cn("w-4 h-4", iconColor)} />
      </div>
      <span className="text-[13px] font-semibold">{label}</span>
      <ChevronDown className="w-3 h-3 ml-auto opacity-0 -rotate-90 group-hover:opacity-40 transition-all duration-200" />
    </Link>
  );
}