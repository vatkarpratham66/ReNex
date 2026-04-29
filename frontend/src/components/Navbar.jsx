import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const profilePath = user?.role === "ngo" ? "/profile/ngo" : "/profile/donor";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-green-100 bg-white/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-16 items-center justify-between gap-3 py-2">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-100 text-xl font-bold text-green-700 shadow-sm">
              N
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-2xl font-black tracking-tight text-green-700">
                Needo
              </span>
              <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-green-500">
                Give Faster
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            {user && (
              <Link
                to="/home"
                className="text-sm font-medium text-gray-700 hover:text-green-600"
              >
                Home Dashboard
              </Link>
            )}

            {user?.role === "admin" && (
              <>
                <Link
                  to="/admin/dashboard"
                  className="text-sm font-medium text-gray-700 hover:text-green-600"
                >
                  Admin Dashboard
                </Link>
                <Link
                  to="/admin/users"
                  className="text-sm font-medium text-gray-700 hover:text-green-600"
                >
                  Users
                </Link>
                <Link
                  to="/admin/ngos"
                  className="text-sm font-medium text-gray-700 hover:text-green-600"
                >
                  NGOs
                </Link>
                <Link
                  to="/admin/donations"
                  className="text-sm font-medium text-gray-700 hover:text-green-600"
                >
                  Donations
                </Link>
              </>
            )}

            {user && user.role !== "admin" && (
              <>
                <Link
                  to="/dashboard"
                  className="text-sm font-medium text-gray-700 hover:text-green-600"
                >
                  Dashboard
                </Link>
                <Link
                  to={profilePath}
                  className="text-sm font-medium text-gray-700 hover:text-green-600"
                >
                  Profile
                </Link>
              </>
            )}

            {user && (
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                {user.role.toUpperCase()}
              </span>
            )}

            {!user ? (
              <>
                <Link
                  to="/login"
                  className="rounded-full bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                >
                  Login
                </Link>

                <div
                  className="relative"
                  onMouseEnter={() => setShowRegister(true)}
                  onMouseLeave={() => setShowRegister(false)}
                >
                  <button className="flex items-center gap-2 rounded-full border border-green-600 px-4 py-2 text-sm font-medium text-green-600 transition hover:bg-green-50">
                    Register <ChevronDown className="h-4 w-4" />
                  </button>
                  {showRegister && (
                    <div className="absolute right-0 mt-2 w-40 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
                      <Link
                        to="/register?role=donor"
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600"
                      >
                        Donor
                      </Link>
                      <Link
                        to="/register?role=ngo"
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600"
                      >
                        NGO
                      </Link>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="rounded-full bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
              >
                Logout
              </button>
            )}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-50 text-green-700 shadow-sm transition hover:bg-green-100 md:hidden"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-green-100 bg-white px-4 pb-5 pt-4 shadow-sm md:hidden">
          <div className="mb-4 rounded-3xl bg-gradient-to-r from-green-600 to-emerald-500 px-4 py-4 text-white">
            <p className="text-xs uppercase tracking-[0.2em] text-green-50">
              Needo Mobile
            </p>
            <p className="mt-1 text-lg font-semibold">
              {user ? `Signed in as ${user.role}` : "Quick access menu"}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {user && (
              <Link
                to="/home"
                onClick={() => setIsOpen(false)}
                className="rounded-2xl border border-gray-100 px-4 py-3 font-medium text-gray-700 transition hover:border-green-200 hover:bg-green-50 hover:text-green-600"
              >
                Home Dashboard
              </Link>
            )}

            {user?.role === "admin" && (
              <>
                <Link
                  to="/admin/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="rounded-2xl border border-gray-100 px-4 py-3 font-medium text-gray-700 transition hover:border-green-200 hover:bg-green-50 hover:text-green-600"
                >
                  Admin Dashboard
                </Link>
                <Link
                  to="/admin/users"
                  onClick={() => setIsOpen(false)}
                  className="rounded-2xl border border-gray-100 px-4 py-3 font-medium text-gray-700 transition hover:border-green-200 hover:bg-green-50 hover:text-green-600"
                >
                  Users
                </Link>
                <Link
                  to="/admin/ngos"
                  onClick={() => setIsOpen(false)}
                  className="rounded-2xl border border-gray-100 px-4 py-3 font-medium text-gray-700 transition hover:border-green-200 hover:bg-green-50 hover:text-green-600"
                >
                  NGOs
                </Link>
                <Link
                  to="/admin/donations"
                  onClick={() => setIsOpen(false)}
                  className="rounded-2xl border border-gray-100 px-4 py-3 font-medium text-gray-700 transition hover:border-green-200 hover:bg-green-50 hover:text-green-600"
                >
                  Donations
                </Link>
              </>
            )}

            {user && user.role !== "admin" && (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="rounded-2xl border border-gray-100 px-4 py-3 font-medium text-gray-700 transition hover:border-green-200 hover:bg-green-50 hover:text-green-600"
                >
                  Dashboard
                </Link>
                <Link
                  to={profilePath}
                  onClick={() => setIsOpen(false)}
                  className="rounded-2xl border border-gray-100 px-4 py-3 font-medium text-gray-700 transition hover:border-green-200 hover:bg-green-50 hover:text-green-600"
                >
                  Profile
                </Link>
              </>
            )}

            {user && (
              <span className="w-fit rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                {user.role.toUpperCase()}
              </span>
            )}

            {!user ? (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="rounded-2xl bg-green-600 px-4 py-3 text-center font-medium text-white hover:bg-green-700"
                >
                  Login
                </Link>
                <div className="overflow-hidden rounded-2xl border border-green-600">
                  <Link
                    to="/register?role=donor"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600"
                  >
                    Donor
                  </Link>
                  <Link
                    to="/register?role=ngo"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600"
                  >
                    NGO
                  </Link>
                </div>
              </>
            ) : (
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="rounded-2xl bg-red-500 px-4 py-3 font-medium text-white hover:bg-red-600"
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
