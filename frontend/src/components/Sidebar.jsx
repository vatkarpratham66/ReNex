// src/components/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Item = ({ to, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `block px-4 py-2 rounded-lg transition ${
        isActive ? "bg-green-100 text-green-700" : "text-gray-700 hover:bg-gray-100"
      }`
    }
  >
    {children}
  </NavLink>
);

const Sidebar = () => {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <aside className="w-64 bg-white border-r p-4 hidden md:block">
      <div className="text-xs font-semibold text-gray-500 px-2 mb-2">
        Navigation
      </div>

      {/* 🔹 Common Home Dashboard link for all roles */}
      <nav className="space-y-2 mb-4">
        <Item to="/home">Home Dashboard</Item>
      </nav>

      {user.role === "donor" && (
        <nav className="space-y-2">
          <Item to="/dashboard">Dashboard</Item>
          <Item to="/donor/create">Create Donation</Item>
          <Item to="/donor/my">My Donations</Item>
          <Item to="/profile/donor">My Profile</Item>
        </nav>
      )}

      {user.role === "ngo" && (
        <nav className="space-y-2">
          <Item to="/dashboard">Dashboard</Item>
          <Item to="/ngo/browse">Browse Donations</Item>
          <Item to="/ngo/my">My Accepted</Item>
          <Item to="/profile/ngo">Organization Profile</Item>
        </nav>
      )}

      {user.role === "admin" && (
        <nav className="space-y-2">
          <Item to="/dashboard">Admin Dashboard</Item>
        </nav>
      )}
    </aside>
  );
};

export default Sidebar;
