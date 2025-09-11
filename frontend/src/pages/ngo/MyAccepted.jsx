import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const MyAccepted = () => {
  const [items, setItems] = useState(null);
  const BASE_URL = "http://localhost:5000"; // later move to .env

  const load = async () => {
    try {
      const { data } = await API.get("/accept/my");
      setItems(data);
    } catch {
      toast.error("Failed to load accepted donations");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/accept/${id}/status`, { status });
      toast.success("✅ Status updated");
      load();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Update failed");
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (!items) {
    return (
      <div className="flex items-center gap-2 text-gray-600 p-6">
        <Loader2 className="animate-spin" /> Loading accepted donations...
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Page Header */}
      <h1 className="text-3xl font-bold text-sky-700 mb-6 flex items-center gap-2">
        📋 My Accepted Donations
      </h1>

      {/* Donation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((a) => {
          const imageUrl = a.donation?.photos?.[0]
            ? `${BASE_URL}${a.donation.photos[0]}`
            : "/placeholder.jpg";

          return (
            <div
              key={a._id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col"
            >
              {/* Image */}
              <div className="h-48 w-full overflow-hidden">
                <img
                  src={imageUrl}
                  alt={a.donation?.title}
                  className="h-full w-full object-cover hover:scale-105 transition-transform"
                />
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-xl font-semibold text-gray-800">
                  {a.donation?.title || "Donation"}
                </h3>
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                  {a.donation?.description || "No description available"}
                </p>

                <div className="mt-3 space-y-1 text-sm text-gray-500">
                  <p>
                    <span className="font-medium">Donor:</span>{" "}
                    {a.donor?.user_name} ({a.donor?.user_email})
                  </p>
                  <p>
                    <span className="font-medium">📍 Location:</span>{" "}
                    {a.donation?.pickup_location}
                  </p>
                  <p>
                    <span className="font-medium">📦 Quantity:</span>{" "}
                    {a.donation?.quantity}
                  </p>
                </div>

                {/* Status Selector */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Update Status
                  </label>
                  <select
                    value={a.status}
                    onChange={(e) => updateStatus(a._id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition"
                  >
                    <option value="pending_pickup">⏳ Pending Pickup</option>
                    <option value="in_transit">🚚 In Transit</option>
                    <option value="delivered">✅ Delivered</option>
                  </select>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyAccepted;
