// src/components/RoleRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RoleRoute = ({ roles = [], children }) => {
  const { token, user } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (roles.length && !roles.includes(user?.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

export default RoleRoute;
