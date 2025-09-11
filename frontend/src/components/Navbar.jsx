import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-green-600">
            SurplusConnect
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {/* ⬅️ New Home Dashboard link */}
            {user && (
              <Link
                to="/home"
                className="text-gray-700 hover:text-green-600 font-medium"
              >
                Home Dashboard
              </Link>
            )}

            <Link
              to="/ngo/browse"
              className="text-gray-700 hover:text-green-600 font-medium"
            >
              Browse Donations
            </Link>

            {user && (
              <Link
                to="/dashboard"
                className="text-gray-700 hover:text-green-600 font-medium"
              >
                Dashboard
              </Link>
            )}

            {user && (
              <Link
                to="/profile"
                className="text-gray-700 hover:text-green-600 font-medium"
              >
                Profile
              </Link>
            )}

            {!user ? (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg border border-green-600 text-green-600 hover:bg-green-50"
                >
                  Register
                </Link>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
              >
                Logout
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-700 focus:outline-none"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t shadow">
          <div className="flex flex-col px-4 py-3 space-y-2">
            {/* ⬅️ New Home Dashboard link */}
            {user && (
              <Link
                to="/home"
                onClick={() => setIsOpen(false)}
                className="text-gray-700 hover:text-green-600"
              >
                Home Dashboard
              </Link>
            )}

            <Link
              to="/ngo/browse"
              onClick={() => setIsOpen(false)}
              className="text-gray-700 hover:text-green-600"
            >
              Browse Donations
            </Link>

            {user && (
              <Link
                to="/dashboard"
                onClick={() => setIsOpen(false)}
                className="text-gray-700 hover:text-green-600"
              >
                Dashboard
              </Link>
            )}

            {user && (
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="text-gray-700 hover:text-green-600"
              >
                Profile
              </Link>
            )}

            {!user ? (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-lg border border-green-600 text-green-600 hover:bg-green-50"
                >
                  Register
                </Link>
              </>
            ) : (
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
