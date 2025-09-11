import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const DonorDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    donations: 0,
    livesHelped: 0,
    score: 0,
    completed: 0,
  });
  const [recent, setRecent] = useState([]);
  const [urgent, setUrgent] = useState([]);

  // Fetch dashboard data
  useEffect(() => {
    const load = async () => {
      try {
        // ✅ Only donors should call donor-specific APIs
        if (user?.role !== "donor") {
  console.warn("Not a donor, skipping donor dashboard API calls.");
  setLoading(false);
  return;
}


        const { data: myDonations } = await API.get("/donations/my");
        const { data: details } = await API.get("/donations/my/details");
        const { data: urgentDonations } = await API.get(
          "/donations?excludeMine=true"
        );

        // Stats
        const completed =
          details?.donations?.filter((d) => d.status === "completed")
            ?.length || 0;
        const livesHelped = details?.accepts?.length || 0;
        const score = (myDonations?.length || 0) * 50;

        setStats({
          donations: myDonations?.length || 0,
          livesHelped,
          score,
          completed,
        });

        // Recent donations (latest 3)
        setRecent(myDonations?.slice(-3).reverse() || []);

        // Urgent requests nearby (filter urgent)
        setUrgent(urgentDonations?.filter((d) => d.urgent) || []);
      } catch (err) {
        console.error("Dashboard error:", err.response?.data || err.message);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (loading) {
    return (
      <p className="flex items-center gap-2 p-6">
        <Loader2 className="animate-spin" /> Loading dashboard...
      </p>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Welcome */}
      <h1 className="text-2xl font-bold">
        Welcome back, {user?.name || "Donor"}!
      </h1>
      <p className="text-gray-600">Ready to make a difference today?</p>

      {/* ✅ New Donor Onboarding */}
      {stats.donations === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 shadow text-center">
          <h2 className="text-xl font-bold text-green-700 mb-2">
            🌱 Start Your Journey!
          </h2>
          <p className="text-gray-600 mb-4">
            You haven’t made a donation yet. Create your first donation and begin
            making an impact.
          </p>
          <Link
            to="/donor/create"
            className="px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
          >
            ➕ Create Your First Donation
          </Link>
        </div>
      )}

      {/* Impact Card (only show if donor already has donations) */}
      {stats.donations > 0 && (
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center">
            <div className="text-center">
              <p className="text-3xl font-bold text-sky-600">
                {stats.donations}
              </p>
              <p className="text-gray-500">Donations</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{stats.score}</p>
              <p className="text-gray-500">Impact Score</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">
                {stats.livesHelped}
              </p>
              <p className="text-gray-500">Lives Helped</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 bg-green-500 rounded-full"
                style={{
                  width: `${Math.min((stats.completed / 10) * 100, 100)}%`,
                }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Progress to next level: {stats.completed}/10 completed donations
            </p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link
          to="/donor/create"
          className="bg-green-500 text-white p-6 rounded-xl shadow hover:opacity-90 transition text-center font-semibold"
        >
          ➕ Create Donation
        </Link>
        <Link
          to="/ngo/browse"
          className="bg-blue-500 text-white p-6 rounded-xl shadow hover:opacity-90 transition text-center font-semibold"
        >
          🔍 Browse NGOs
        </Link>
        <Link
          to="/messages"
          className="bg-orange-500 text-white p-6 rounded-xl shadow hover:opacity-90 transition text-center font-semibold"
        >
          💬 Messages
        </Link>
        <Link
          to="/achievements"
          className="bg-purple-500 text-white p-6 rounded-xl shadow hover:opacity-90 transition text-center font-semibold"
        >
          🏆 Achievements
        </Link>
      </div>

      {/* Recent Donations */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Recent Donations</h2>
        {recent.length === 0 ? (
          <p className="text-gray-500">No recent donations</p>
        ) : (
          <div className="space-y-3">
            {recent.map((d) => (
              <div
                key={d._id}
                className="bg-white rounded-lg shadow p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{d.title}</p>
                  <p className="text-sm text-gray-500">{d.category}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    d.status === "available"
                      ? "bg-yellow-100 text-yellow-700"
                      : d.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {d.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Urgent Requests Nearby */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Urgent Requests Nearby</h2>
        {urgent.length === 0 ? (
          <p className="text-gray-500">No urgent requests right now</p>
        ) : (
          <div className="space-y-4">
            {urgent.map((u) => (
              <div
                key={u._id}
                className="border border-red-200 bg-red-50 rounded-xl p-4 flex justify-between items-center"
              >
                <div>
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                    URGENT
                  </span>
                  <h3 className="font-bold mt-1">{u.title}</h3>
                  <p className="text-sm text-gray-600">
                    {u.description || "No description"}
                  </p>
                </div>
                <Link
                  to={`/donations/${u._id}`}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                >
                  Help Now
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DonorDashboard;
