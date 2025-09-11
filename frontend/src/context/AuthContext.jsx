// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({ user: null, token: null });

  useEffect(() => {
    const raw = localStorage.getItem("auth");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setAuth({ user: parsed.user || null, token: parsed.token || null });
      } catch {}
    }
  }, []);

  const login = ({ user, token }) => {
    const next = { user, token };
    setAuth(next);
    localStorage.setItem("auth", JSON.stringify(next));
  };

  const logout = () => {
    setAuth({ user: null, token: null });
    localStorage.removeItem("auth");
  };

  const setUser = (user) => {
    const next = { ...auth, user };
    setAuth(next);
    localStorage.setItem("auth", JSON.stringify(next));
  };

  return (
    <AuthContext.Provider
      value={{
        user: auth.user,
        token: auth.token,
        login,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
