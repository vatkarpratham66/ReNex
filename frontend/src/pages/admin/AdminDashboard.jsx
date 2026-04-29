import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import {
  Loader2,
  Users,
  Building2,
  CheckCircle2,
  Gift,
  Activity,
  ClipboardList,
  Crown,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import Layout from "../../components/Layout";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const StatCard = ({ label, value, icon: Icon }) => (
  <div className="relative bg-gradient-to-br from-white/80 to-green-50 border border-green-100 rounded-2xl p-6 flex items-center gap-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
    <div className={`p-3 rounded-full bg-green-100 text-green-700`}>
      <Icon className="w-7 h-7" />
    </div>
    <div>
      <h3 className="text-3xl font-extrabold text-gray-800">{value ?? 0}</h3>
      <p className="text-sm font-medium text-gray-500">{label}</p>
    </div>
  </div>
);

const COLORS = ["#16a34a", "#60a5fa", "#facc15", "#f87171", "#a78bfa"];

const getActivityBadge = (type) => {
  switch (type.toLowerCase()) {
    case "user signup":
      return "bg-green-100 text-green-700";
    case "ngo verified":
      return "bg-yellow-100 text-yellow-700";
    case "donation added":
      return "bg-blue-100 text-blue-700";
    case "donation deleted":
    case "user blocked":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [topDonors, setTopDonors] = useState([]);
  const [activity, setActivity] = useState([]);
  const [donationsTrend, setDonationsTrend] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  const loadStats = async () => {
    try {
      const { data } = await API.get("/admin/stats");
      setStats(data);
    } catch {
      toast.error("Failed to load admin stats");
    } finally {
      setLoading(false);
    }
  };

  const loadTopDonors = async () => {
    try {
      const { data } = await API.get("/admin/top-donors");
      setTopDonors(data);
    } catch {
      console.error("Top donors fetch failed");
    }
  };

  const loadActivity = async () => {
    try {
      const { data } = await API.get("/admin/recent-activity");
      setActivity(data);
    } catch {
      console.error("Recent activity fetch failed");
    }
  };

  const loadCharts = async () => {
    try {
      const [{ data: publicStats }, { data: donations }] = await Promise.all([
        API.get("/stats"),
        API.get("/admin/donations"),
      ]);

      const trendPoints = (publicStats?.trends?.donations || []).map((item) => ({
        week: `Y${item._id.year}-W${item._id.week}`,
        count: item.count,
      }));
      setDonationsTrend(trendPoints);

      const categoryCounts = donations.reduce((acc, donation) => {
        const key = donation.category || "Other";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

      setCategoryData(
        Object.entries(categoryCounts).map(([name, value]) => ({ name, value }))
      );
    } catch (err) {
      console.error("Dashboard chart data failed", err);
    }
  };

  useEffect(() => {
    loadStats();
    loadTopDonors();
    loadActivity();
    loadCharts();
    const interval = setInterval(loadActivity, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Layout>
      <div className="space-y-10 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1">
              Overview of users, NGOs, and donation performance
            </p>
          </div>
          <span className="mt-3 sm:mt-0 px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full font-medium">
            Administrator
          </span>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin w-10 h-10 text-green-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard label="Total Users" value={stats?.totalUsers} icon={Users} />
            <StatCard label="Total NGOs" value={stats?.totalNGOs} icon={Building2} />
            <StatCard label="Verified NGOs" value={stats?.verifiedNGOs} icon={CheckCircle2} />
            <StatCard label="Total Donations" value={stats?.totalDonations} icon={Gift} />
            <StatCard label="Active Donations" value={stats?.activeDonations} icon={Activity} />
            <StatCard label="Completed Donations" value={stats?.completedDonations} icon={ClipboardList} />
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white border border-green-100 p-6 rounded-2xl shadow-sm">
          <h2 className="text-lg font-semibold mb-5 text-gray-800">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Link to="/admin/users" className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
              Manage Users
            </Link>
            <Link to="/admin/ngos" className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
              Verify NGOs
            </Link>
            <Link to="/admin/donations" className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
              Manage Donations
            </Link>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Line Chart */}
          <div className="bg-white border border-green-100 p-6 rounded-2xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Weekly Donations Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={donationsTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#16a34a" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
            {donationsTrend.length === 0 && (
              <p className="mt-3 text-sm text-gray-500">Not enough donation trend data yet.</p>
            )}
          </div>

          {/* Pie Chart */}
          <div className="bg-white border border-green-100 p-6 rounded-2xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Donations by Category</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {categoryData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            {categoryData.length === 0 && (
              <p className="mt-3 text-sm text-gray-500">No donation categories available yet.</p>
            )}
          </div>
        </div>

        {/* Top Donors + Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 🏆 Top Donors */}
          <div className="bg-white border border-green-100 p-6 rounded-2xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <Crown className="text-yellow-500 w-5 h-5" /> Top Donors
            </h3>
            <ul className="divide-y divide-gray-100">
              {topDonors.length > 0 ? (
                topDonors.map((donor, idx) => (
                  <li key={idx} className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium text-gray-800">{donor.name}</p>
                      <p className="text-xs text-gray-500">{donor.email}</p>
                    </div>
                    <span className="text-green-700 font-semibold text-sm">
                      {donor.totalDonations} donations
                    </span>
                  </li>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No donor data available.</p>
              )}
            </ul>
          </div>

          {/* 🕒 Recent Activity */}
          <div className="bg-white border border-green-100 p-6 rounded-2xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <Clock className="text-blue-500 w-5 h-5" /> Recent Activity
            </h3>
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {activity.length > 0 ? (
                activity.map((item, i) => (
                  <div key={i} className="flex items-start justify-between border-b border-gray-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-semibold ${getActivityBadge(
                          item.type
                        )}`}
                      >
                        {item.type}
                      </span>
                      <p className="text-sm text-gray-700">{item.detail}</p>
                    </div>
                    <p className="text-xs text-gray-400">
                      {new Date(item.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No recent activity yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
