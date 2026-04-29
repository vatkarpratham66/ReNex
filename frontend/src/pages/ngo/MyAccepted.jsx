import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import { Loader2, MessageCircle, Truck, ClipboardCheck } from "lucide-react";
import toast from "react-hot-toast";

const MyAccepted = () => {
  const [items, setItems] = useState(null);
  const [filter, setFilter] = useState("All"); // 🟠 new filter state
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
      toast.success("✅ Status updated successfully!");
      load();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Update failed");
    }
  };

  const openWhatsApp = (phone, name, title) => {
    if (!phone) return toast.error("Donor phone not available");
    const msg = `Hello ${name || "Donor"}, I'm following up regarding your donation (${title}).`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  useEffect(() => {
    load();
  }, []);

  if (!items) {
    return (
      <div className="flex items-center gap-2 rounded-[28px] bg-white p-6 text-gray-600 shadow-sm ring-1 ring-gray-100">
        <Loader2 className="animate-spin" /> Loading accepted donations...
      </div>
    );
  }

  // 🧠 Filter donations by status
  const filteredItems =
    filter === "All"
      ? items
      : items.filter((a) => {
          if (filter === "Pending Pickup") return a.status === "pending_pickup";
          if (filter === "In Transit") return a.status === "in_transit";
          if (filter === "Delivered") return a.status === "delivered";
          return true;
        });

  return (
    <div className="space-y-5">
      <div className="rounded-[30px] bg-gradient-to-r from-sky-500 to-cyan-500 px-5 py-6 text-white sm:px-8">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-white/15 p-3 backdrop-blur">
            <ClipboardCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
              My Accepted Donations
            </h1>
            <p className="mt-1 text-sm text-sky-50/90">
              Track pickups, update delivery status, and stay in contact with donors.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 rounded-[24px] bg-white p-3 shadow-sm ring-1 ring-gray-100">
        {["All", "Pending Pickup", "In Transit", "Delivered"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
              filter === tab
                ? "bg-orange-500 text-white shadow-sm"
                : "text-gray-700 hover:bg-orange-100"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* No items found */}
      {filteredItems.length === 0 ? (
        <div className="rounded-[28px] bg-white py-14 text-center text-gray-500 shadow-sm ring-1 ring-gray-100">
          <p>No donations found for this status.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((a) => {
            const donation = a.donation || {};
            const donor = a.donor || {};
            const imageUrl = donation.photos?.[0]
              ? `${BASE_URL}${donation.photos[0]}`
              : "/placeholder.jpg";

            return (
              <div
                key={a._id}
                className="overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-gray-100 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative h-44 w-full overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={donation.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">
                    {donation.category || "General"}
                  </span>
                </div>

                <div className="flex flex-grow flex-col p-5">
                  <h3 className="text-lg font-semibold text-gray-900">{donation.title}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {donation.description || "No description provided."}
                  </p>

                  <div className="mt-3 space-y-1 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Donor:</span> {donor.user_name || "Unknown"} (
                      {donor.user_email || "N/A"})
                    </p>
                    <p>
                      <span className="font-medium">📍 Location:</span>{" "}
                      {donation.pickup_location || "Not specified"}
                    </p>
                    <p>
                      <span className="font-medium">📦 Quantity:</span>{" "}
                      {donation.quantity || "N/A"}
                    </p>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Update Status
                    </label>
                    <select
                      value={a.status}
                      onChange={(e) => updateStatus(a._id, e.target.value)}
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                    >
                      <option value="pending_pickup">Pending Pickup</option>
                      <option value="in_transit">In Transit</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </div>

                  {donor.user_phone && (
                    <button
                      onClick={() =>
                        openWhatsApp(donor.user_phone, donor.user_name, donation.title)
                      }
                      className="mt-4 flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-green-500 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-green-600"
                    >
                      <MessageCircle size={16} /> WhatsApp Donor
                    </button>
                  )}

                  {a.status === "in_transit" && (
                    <div className="mt-3 flex items-center gap-2 text-sky-600 text-sm font-medium">
                      <Truck size={16} /> Donation is currently in transit
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyAccepted;
