import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

/* Pages */
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Landing from "./pages/Landing";
import DonorDashboard from "./pages/dashboard/DonorDashboard";
import NGODashboard from "./pages/dashboard/NGODashboard"; // ✅ missing before
import HomeDashboard from "./pages/dashboard/HomeDashboard";   // ✅ import added

import CreateDonation from "./pages/donations/CreateDonation";
import MyDonations from "./pages/donations/MyDonations";
import EditDonation from "./pages/donations/EditDonation";
import BrowseDonations from "./pages/ngo/BrowseDonations";
import MyAccepted from "./pages/ngo/MyAccepted";
import DonorProfile from "./pages/profile/DonorProfile";
import NGOProfile from "./pages/profile/NGOProfile";

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

        {/* ✅ Shared Home Dashboard (new default for logged-in users) */}
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

        {/* Role-based dashboards (still accessible, but not the default) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                {user?.role === "donor" && <DonorDashboard />}
                {user?.role === "ngo" && <NGODashboard />}
                {user?.role === "admin" && <AdminDashboard />}
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

        {/* Catch-all */}
        <Route path="*" element={<Navigate to={user ? "/home" : "/"} />} />
      </Routes>

      {/* ✅ Toast works globally */}
      <Toaster position="top-right" toastOptions={{ duration: 2500 }} />
    </>
  );
}

export default App;
