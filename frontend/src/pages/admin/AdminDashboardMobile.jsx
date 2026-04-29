import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  Building2,
  CheckCircle2,
  ClipboardList,
  Clock,
  Crown,
  Gift,
  Loader2,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import API from "../../api/axios";
import Layout from "../../components/Layout";

const COLORS = ["#16a34a", "#0ea5e9", "#f59e0b", "#ef4444", "#8b5cf6"];

const getActivityBadge = (type) => {
  const normalized = String(type || "").toLowerCase();

  if (normalized === "user signup") {
    return "bg-green-100 text-green-700";
  }
  if (normalized === "ngo update" || normalized === "ngo verified") {
    return "bg-sky-100 text-sky-700";
  }
  if (normalized === "donation added") {
    return "bg-amber-100 text-amber-700";
  }
  if (normalized === "donation deleted" || normalized === "user blocked") {
    return "bg-red-100 text-red-700";
  }

  return "bg-gray-100 text-gray-600";
};

const StatCard = ({ label, value, icon: Icon, accent }) => (
  <div className="rounded-[26px] bg-white p-5 shadow-sm ring-1 ring-gray-100">
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
          {label}
        </p>
        <h3 className="mt-2 text-3xl font-black tracking-tight text-gray-900">
          {value ?? 0}
        </h3>
      </div>
      <div className={`rounded-2xl p-3 ${accent}`}>
        <Icon className="h-6 w-6" />
      </div>
    </div>
  </div>
);

const AdminDashboardMobile = () => {
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
      setTopDonors(data || []);
    } catch (err) {
      console.error("Top donors fetch failed", err);
    }
  };

  const loadActivity = async () => {
    try {
      const { data } = await API.get("/admin/recent-activity");
      setActivity(data || []);
    } catch (err) {
      console.error("Recent activity fetch failed", err);
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

      const categoryCounts = (donations || []).reduce((acc, donation) => {
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

  const statCards = [
    {
      label: "Total Users",
      value: stats?.totalUsers,
      icon: Users,
      accent: "bg-emerald-100 text-emerald-700",
    },
    {
      label: "Total NGOs",
      value: stats?.totalNGOs,
      icon: Building2,
      accent: "bg-sky-100 text-sky-700",
    },
    {
      label: "Verified NGOs",
      value: stats?.verifiedNGOs,
      icon: CheckCircle2,
      accent: "bg-lime-100 text-lime-700",
    },
    {
      label: "Total Donations",
      value: stats?.totalDonations,
      icon: Gift,
      accent: "bg-amber-100 text-amber-700",
    },
    {
      label: "Active Donations",
      value: stats?.activeDonations,
      icon: Activity,
      accent: "bg-orange-100 text-orange-700",
    },
    {
      label: "Completed Donations",
      value: stats?.completedDonations,
      icon: ClipboardList,
      accent: "bg-violet-100 text-violet-700",
    },
  ];

  return (
    <Layout>
      <div className="space-y-5">
        <div className="overflow-hidden rounded-[30px] bg-gradient-to-r from-gray-900 via-emerald-800 to-green-600 px-5 py-6 text-white shadow-lg shadow-emerald-100 sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-100/90">
                Admin Control
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                Dashboard Overview
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-emerald-50/90">
                Monitor platform activity, track donation trends, and keep core
                admin actions within easy reach on desktop and mobile.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:max-w-sm">
              <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
                <p className="text-2xl font-bold">{stats?.totalUsers ?? 0}</p>
                <p className="text-xs uppercase tracking-[0.16em] text-emerald-50/85">
                  Users
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
                <p className="text-2xl font-bold">{stats?.totalDonations ?? 0}</p>
                <p className="text-xs uppercase tracking-[0.16em] text-emerald-50/85">
                  Donations
                </p>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 rounded-[28px] bg-white p-6 text-gray-600 shadow-sm ring-1 ring-gray-100">
            <Loader2 className="h-5 w-5 animate-spin text-green-600" />
            Loading dashboard stats...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {statCards.map((item) => (
              <StatCard key={item.label} {...item} />
            ))}
          </div>
        )}

        <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          <p className="mt-1 text-sm text-gray-500">
            Jump into the most-used admin areas.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Link
              to="/admin/users"
              className="rounded-[24px] bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
            >
              Manage Users
            </Link>
            <Link
              to="/admin/ngos"
              className="rounded-[24px] bg-sky-50 px-5 py-4 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
            >
              Verify NGOs
            </Link>
            <Link
              to="/admin/donations"
              className="rounded-[24px] bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
            >
              Manage Donations
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">
              Weekly Donations Trend
            </h3>
            <div className="mt-4 h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={donationsTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#16a34a"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {donationsTrend.length === 0 && (
              <p className="mt-3 text-sm text-gray-500">
                Not enough donation trend data yet.
              </p>
            )}
          </div>

          <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">
              Donations by Category
            </h3>
            <div className="mt-4 h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`${entry.name}-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {categoryData.length === 0 && (
              <p className="mt-3 text-sm text-gray-500">
                No donation categories available yet.
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Crown className="h-5 w-5 text-amber-500" />
              Top Donors
            </h3>
            <div className="mt-4 space-y-3">
              {topDonors.length > 0 ? (
                topDonors.map((donor, index) => (
                  <div
                    key={`${donor.email}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-gray-50 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-900">
                        {donor.name}
                      </p>
                      <p className="truncate text-sm text-gray-500">
                        {donor.email}
                      </p>
                    </div>
                    <span className="whitespace-nowrap rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {donor.totalDonations} donations
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No donor data available.</p>
              )}
            </div>
          </div>

          <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Clock className="h-5 w-5 text-sky-500" />
              Recent Activity
            </h3>
            <div className="mt-4 space-y-3">
              {activity.length > 0 ? (
                activity.map((item, index) => (
                  <div
                    key={`${item.type}-${item.timestamp}-${index}`}
                    className="rounded-2xl bg-gray-50 px-4 py-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getActivityBadge(
                          item.type
                        )}`}
                      >
                        {item.type}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-700">{item.detail}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No recent activity yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboardMobile;
