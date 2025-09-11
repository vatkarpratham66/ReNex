import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import { AlertTriangle, Heart } from "lucide-react";
import DonationCard from "../../components/DonationCard";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const HomeDashboard = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState({
    activeDonations: 0,
    urgent: 0,
    canServe: 0,
    activeDonors: 0,
    totalMoney: 45000, // 🔹 Mocked for now
  });
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await API.get("/donations"); // existing backend
        setDonations(data);

        // calculate stats
        const active = data.filter(d => d.status === "available").length;
        const urgent = data.filter(d => d.urgent).length;
        const people = data.reduce((sum, d) => sum + (d.quantity || 0), 0);
        const donors = new Set(data.map(d => d.donor?.donor_id)).size;

        setStats(prev => ({
          ...prev,
          activeDonations: active,
          urgent,
          canServe: people,
          activeDonors: donors,
        }));
      } catch (err) {
        console.error(err);
        toast.error("Failed to load dashboard data");
      }
    };
    load();
  }, []);

  const filteredDonations =
    filter === "All"
      ? donations
      : donations.filter(d => d.category === filter);

  const handleDonateMoney = () => {
    toast.success("💖 Thank you! Money donation feature coming soon.");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">🏠 Home Dashboard</h1>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search donations..."
            className="px-3 py-2 border rounded-lg"
          />
          <select
            className="px-3 py-2 border rounded-lg"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Food">Food</option>
            <option value="Clothes">Clothes</option>
            <option value="Educational">Educational</option>
            <option value="Medical">Medical</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl shadow text-center">
          <p className="text-xl font-bold">{stats.activeDonations}</p>
          <p className="text-sm text-gray-600">Active Donations</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow text-center">
          <p className="text-xl font-bold text-red-600">{stats.urgent}</p>
          <p className="text-sm text-gray-600 flex items-center justify-center gap-1">
            <AlertTriangle size={14} /> Urgent Items
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow text-center">
          <p className="text-xl font-bold text-green-600">{stats.canServe}+</p>
          <p className="text-sm text-gray-600">Can Serve People</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow text-center">
          <p className="text-xl font-bold">{stats.activeDonors}</p>
          <p className="text-sm text-gray-600">Active Donors</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow text-center">
          <p className="text-xl font-bold text-purple-600">₹{stats.totalMoney}</p>
          <p className="text-sm text-gray-600 flex items-center justify-center gap-1">
            <Heart size={14} /> Funds Raised
          </p>
        </div>
      </div>

      {/* Emotional Section */}
      <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-6 rounded-xl shadow flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-pink-700">💖 Support Beyond Items</h2>
          <p className="text-gray-700">
            Help us serve more by donating money. Your contribution will provide
            essentials to those in need.
          </p>
        </div>
        <button
          onClick={handleDonateMoney}
          className="px-6 py-3 bg-pink-600 text-white rounded-lg shadow hover:bg-pink-700"
        >
          Donate Money
        </button>
      </div>

      {/* Donations List */}
      <div className="grid md:grid-cols-3 gap-6">
        {filteredDonations.map(d => (
          <DonationCard key={d._id} donation={d} showActions={false} />
        ))}
      </div>
    </div>
  );
};

export default HomeDashboard;
