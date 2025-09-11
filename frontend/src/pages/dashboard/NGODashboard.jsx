import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const NGODashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [impact, setImpact] = useState({
    total: 0,
    delivered: 0,
    lives: 0,
    successRate: 0,
  });
  const [active, setActive] = useState([]);
  const [available, setAvailable] = useState([]);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        // ✅ NGO-only safeguard
        if (user?.role !== "ngo") {
          setLoading(false);
          return;
        }

        // Fetch data
        const { data: accepted = [] } = await API.get("/accept/my");
        const { data: availableDonations = [] } = await API.get(
          "/donations?excludeMine=true"
        );

        // Impact stats
        const total = accepted?.length || 0;
        const delivered =
          accepted?.filter((a) => a.status === "delivered")?.length || 0;
        const lives =
          accepted?.reduce(
            (sum, a) => sum + (a?.donation?.quantity || 1),
            0
          ) || 0;
        const successRate = total > 0 ? Math.round((delivered / total) * 100) : 0;

        setImpact({ total, delivered, lives, successRate });

        // Active requests
        setActive(accepted?.filter((a) => a.status !== "delivered") || []);

        // Available nearby
        setAvailable(
          availableDonations?.filter((d) => d.status === "available") || []
        );

        // Recent activity
        setRecent(
          [...(accepted || [])]
            .sort(
              (a, b) =>
                new Date(b.updatedAt).getTime() -
                new Date(a.updatedAt).getTime()
            )
            .slice(0, 3)
        );
      } catch (err) {
        console.error("NGO Dashboard error:", {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message,
        });
        toast.error("Failed to load NGO dashboard");
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
      {/* Header */}
      <h1 className="text-2xl font-bold">NGO Dashboard</h1>
      <p className="text-gray-600">
        Managing {active.length} active request{active.length !== 1 && "s"}
      </p>

      {/* Impact Card */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center">
          <div className="text-center">
            <p className="text-3xl font-bold text-sky-600">{impact.total}</p>
            <p className="text-gray-500">Received</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{impact.lives}</p>
            <p className="text-gray-500">Lives Helped</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-orange-600">
              {impact.successRate}%
            </p>
            <p className="text-gray-500">Success Rate</p>
          </div>
        </div>

        {/* Verified Badge */}
        <div className="mt-4 text-green-700 text-sm bg-green-50 p-2 rounded-lg inline-block">
          ✅ Verified Organization
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link
          to="/requests/create"
          className="bg-blue-500 text-white p-6 rounded-xl shadow hover:opacity-90 transition text-center font-semibold"
        >
          ➕ Create Request
        </Link>
        <Link
          to="/ngo/browse"
          className="bg-green-500 text-white p-6 rounded-xl shadow hover:opacity-90 transition text-center font-semibold"
        >
          🔍 Browse Donations
        </Link>
        <Link
          to="/messages"
          className="bg-orange-500 text-white p-6 rounded-xl shadow hover:opacity-90 transition text-center font-semibold"
        >
          💬 Messages
        </Link>
        <Link
          to="/schedule"
          className="bg-purple-500 text-white p-6 rounded-xl shadow hover:opacity-90 transition text-center font-semibold"
        >
          📅 Schedule
        </Link>
      </div>

      {/* Active Requests */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Active Requests</h2>
        {active.length === 0 ? (
          <p className="text-gray-500">No active requests</p>
        ) : (
          <div className="space-y-3">
            {active.map((a) => (
              <div
                key={a._id}
                className="bg-white rounded-lg shadow p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{a?.donation?.title || "Untitled Donation"}</p>
                  <p className="text-sm text-gray-500">
                    Status: {a?.status?.replace("_", " ") || "unknown"}
                  </p>
                </div>
                <Link
                  to={`/accept/${a._id}`}
                  className="text-sky-600 font-medium"
                >
                  Manage
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Nearby */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Available Nearby</h2>
        {available.length === 0 ? (
          <p className="text-gray-500">No available donations nearby</p>
        ) : (
          <div className="space-y-3">
            {available.slice(0, 3).map((d) => (
              <div
                key={d._id}
                className="bg-white rounded-lg shadow p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{d.title}</p>
                  <p className="text-sm text-gray-500">{d.category}</p>
                </div>
                <Link
                  to={`/donations/${d._id}`}
                  className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition"
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Recent Activity</h2>
        {recent.length === 0 ? (
          <p className="text-gray-500">No recent activity</p>
        ) : (
          <div className="space-y-3">
            {recent.map((a) => (
              <div
                key={a._id}
                className="bg-white rounded-lg shadow p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">
                    Donation received from {a?.donor?.user_name || "Donor"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {a?.donation?.title || "Untitled"} • {a?.status || "unknown"}
                  </p>
                </div>
                <span className="text-xs text-gray-400">
                  {a?.updatedAt
                    ? new Date(a.updatedAt).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NGODashboard;
