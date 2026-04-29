import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";

/* Pages */
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Landing from "./pages/Landing";
import DonorDashboard from "./pages/dashboard/DonorDashboard";
import NGODashboard from "./pages/dashboard/NGODashboard";
import HomeDashboard from "./pages/dashboard/HomeDashboard";

import CreateDonation from "./pages/donations/CreateDonation";
import MyDonations from "./pages/donations/MyDonations";
import EditDonation from "./pages/donations/EditDonation";
import BrowseDonations from "./pages/ngo/BrowseDonationsMobile";
import MyAccepted from "./pages/ngo/MyAccepted";
import DonorProfile from "./pages/profile/DonorProfile";
import NGOProfile from "./pages/profile/NGOProfileMobile";

/* Admin Pages */
import AdminDashboardMobile from "./pages/admin/AdminDashboardMobile";
import NGOVerificationMobile from "./pages/admin/AdminNGOsMobile";
import UserManagement from "./pages/admin/AdminUsers";        // ✅ FIXED
import NGOVerification from "./pages/admin/AdminNGOs";       // ✅ FIXED
import DonationManagement from "./pages/admin/AdminDonations"; // ✅ FIXED

import { useAuth } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";

function App() {
  const { user } = useAuth();

  return (
    <>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Shared Home Dashboard */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Layout>
                <HomeDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Role-based dashboards */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                {user?.role === "donor" && <DonorDashboard />}
                {user?.role === "ngo" && <NGODashboard />}
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Donor */}
        <Route
          path="/donor/create"
          element={
            <ProtectedRoute>
              <Layout>
                <CreateDonation />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/donor/my"
          element={
            <ProtectedRoute>
              <Layout>
                <MyDonations />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/donor/edit/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <EditDonation />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* NGO */}
        <Route
          path="/ngo/browse"
          element={
            <ProtectedRoute>
              <Layout>
                <BrowseDonations />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/ngo/my"
          element={
            <ProtectedRoute>
              <Layout>
                <MyAccepted />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Profiles */}
        <Route
          path="/profile/donor"
          element={
            <ProtectedRoute>
              <Layout>
                <DonorProfile />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/ngo"
          element={
            <ProtectedRoute>
              <Layout>
                <NGOProfile />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Admin (only role=admin) */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <RoleRoute role="admin">
                <AdminDashboardMobile />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <RoleRoute role="admin">
                <UserManagement /> {/* ✅ FIXED */}
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/ngos"
          element={
            <ProtectedRoute>
              <RoleRoute role="admin">
                <NGOVerificationMobile /> {/* ✅ FIXED */}
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/donations"
          element={
            <ProtectedRoute>
              <RoleRoute role="admin">
                <DonationManagement /> {/* ✅ FIXED */}
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to={user ? "/home" : "/"} />} />
      </Routes>

      {/* Global toaster */}
      <Toaster position="top-right" toastOptions={{ duration: 2500 }} />
    </>
  );
}

export default App;

