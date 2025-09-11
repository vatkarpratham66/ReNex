import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const AvailableDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Backend base URL (move to .env in production)
  const BASE_URL = "http://localhost:5000";

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/donations?excludeMine=true");
      setDonations(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load donations");
    } finally {
      setLoading(false);
    }
  };

  const acceptDonation = async (donationId) => {
    try {
      await API.post(`/accept/${donationId}`);
      toast.success("✅ Donation accepted");
      load(); // refresh after accept
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.msg || "Failed to accept donation");
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-6">
        <Loader2 className="animate-spin" /> Loading available donations...
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-sky-600 mb-6">
        🌍 Available Donations
      </h1>

      {donations.length === 0 ? (
        <p className="text-gray-500">No available donations right now.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {donations.map((d) => {
            const imageUrl = d.photos?.[0]
              ? `${BASE_URL}${d.photos[0]}`
              : "/placeholder.jpg";

            return (
              <div
                key={d._id}
                className="bg-white rounded-xl shadow p-4 flex flex-col"
              >
                <img
                  src={imageUrl}
                  alt={d.title}
                  className="h-40 w-full object-cover rounded-lg mb-3"
                />
                <h3 className="text-lg font-semibold">{d.title}</h3>
                <p className="text-gray-600">
                  {d.description || "No description provided"}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Category: {d.category}
                </p>
                <p className="text-sm text-gray-500">
                  Quantity: {d.quantity}
                </p>
                <p className="text-sm text-gray-500">
                  Pickup: {d.pickup_location}
                </p>
                <p className="text-sm text-gray-400">
                  ⏰ {new Date(d.createdAt).toLocaleDateString()}
                </p>
                {d.urgent && (
                  <span className="mt-2 inline-block bg-red-100 text-red-700 text-xs px-2 py-1 rounded">
                    URGENT
                  </span>
                )}

                <button
                  onClick={() => acceptDonation(d._id)}
                  className="mt-auto bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition"
                >
                  Accept Donation
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AvailableDonations;
