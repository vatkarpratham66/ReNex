import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Home,
  Users,
  Building2,
  Gift,
  LayoutDashboard,
  PlusCircle,
  List,
  UserCircle,
} from "lucide-react";

const Item = ({ to, icon: Icon, children, mobile = false }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      mobile
        ? `flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium transition ${
            isActive
              ? "bg-green-600 text-white shadow-md shadow-green-200"
              : "text-gray-500 hover:bg-green-50 hover:text-green-700"
          }`
        : `flex items-center gap-2 rounded-xl px-4 py-3 transition ${
            isActive
              ? "bg-green-600 text-white"
              : "text-gray-700 hover:bg-green-100"
          }`
    }
  >
    {Icon && <Icon className="h-4 w-4" />}
    <span className={mobile ? "truncate text-center leading-tight" : ""}>
      {children}
    </span>
  </NavLink>
);

const Sidebar = () => {
  const { user } = useAuth();
  if (!user) return null;

  const mobileItems =
    user.role === "donor"
      ? [
          { to: "/home", icon: Home, label: "Home" },
          { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { to: "/donor/create", icon: PlusCircle, label: "Create" },
          { to: "/donor/my", icon: List, label: "My Items" },
          { to: "/profile/donor", icon: UserCircle, label: "Profile" },
        ]
      : user.role === "ngo"
      ? [
          { to: "/home", icon: Home, label: "Home" },
          { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { to: "/ngo/browse", icon: Gift, label: "Browse" },
          { to: "/ngo/my", icon: List, label: "Accepted" },
          { to: "/profile/ngo", icon: Building2, label: "Profile" },
        ]
      : [
          { to: "/home", icon: Home, label: "Home" },
          { to: "/admin/dashboard", icon: LayoutDashboard, label: "Admin" },
          { to: "/admin/users", icon: Users, label: "Users" },
          { to: "/admin/ngos", icon: Building2, label: "NGOs" },
          { to: "/admin/donations", icon: Gift, label: "Items" },
        ];

  return (
    <>
      <aside className="hidden w-72 border-r border-gray-200 bg-white/90 p-4 md:block">
        <div className="mb-2 px-2 text-xs font-semibold text-gray-500">
          Navigation
        </div>

        <nav className="mb-6 space-y-2">
          <Item to="/home" icon={Home}>
            Home Dashboard
          </Item>
        </nav>

        {user.role === "donor" && (
          <div className="mb-6">
            <h2 className="mb-2 px-2 text-xs font-semibold text-gray-500">
              Donor Panel
            </h2>
            <nav className="space-y-2">
              <Item to="/dashboard" icon={LayoutDashboard}>
                Dashboard
              </Item>
              <Item to="/donor/create" icon={PlusCircle}>
                Create Donation
              </Item>
              <Item to="/donor/my" icon={List}>
                My Donations
              </Item>
              <Item to="/profile/donor" icon={UserCircle}>
                My Profile
              </Item>
            </nav>
          </div>
        )}

        {user.role === "ngo" && (
          <div className="mb-6">
            <h2 className="mb-2 px-2 text-xs font-semibold text-gray-500">
              NGO Panel
            </h2>
            <nav className="space-y-2">
              <Item to="/dashboard" icon={LayoutDashboard}>
                Dashboard
              </Item>
              <Item to="/ngo/browse" icon={Gift}>
                Browse Donations
              </Item>
              <Item to="/ngo/my" icon={List}>
                My Accepted
              </Item>
              <Item to="/profile/ngo" icon={Building2}>
                Organization Profile
              </Item>
            </nav>
          </div>
        )}

        {user.role === "admin" && (
          <div className="mb-6">
            <h2 className="mb-2 px-2 text-xs font-semibold text-gray-500">
              Admin Panel
            </h2>
            <nav className="space-y-2">
              <Item to="/admin/dashboard" icon={LayoutDashboard}>
                Admin Dashboard
              </Item>
              <Item to="/admin/users" icon={Users}>
                User Management
              </Item>
              <Item to="/admin/ngos" icon={Building2}>
                NGO Verification
              </Item>
              <Item to="/admin/donations" icon={Gift}>
                Donation Management
              </Item>
            </nav>
          </div>
        )}
      </aside>

      <div className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-green-100 bg-white/95 px-3 py-2 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur md:hidden">
        <nav className="mx-auto flex max-w-lg items-center gap-2">
          {mobileItems.map((item) => (
            <Item key={item.to} to={item.to} icon={item.icon} mobile>
              {item.label}
            </Item>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
