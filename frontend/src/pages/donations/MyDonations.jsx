import React, { useEffect, useState } from "react";
import {
  Package,
  Truck,
  Clock,
  Layers,
  MessageCircle,
  ImageOff,
  X,
  Edit3,
  Trash2,
} from "lucide-react";
import API from "../../api/axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const MyDonations = () => {
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  // ✅ Helper: build full image URL
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `http://localhost:5000/${path.replace(/^\/+/, "")}`;
  };

  useEffect(() => {
    loadDonations();
  }, []);

  const loadDonations = async () => {
    try {
      const res = await API.get("/donations/my/details");
      const { donations = [], accepts = [] } = res.data;

      const merged = donations.map((donation) => {
        const acceptRecord = accepts.find(
          (a) => String(a.donation_id) === String(donation._id)
        );
        return {
          ...donation,
          ngo_name: acceptRecord?.ngo_id?.ngo_name || null,
          ngo_phone: acceptRecord?.ngo_id?.user_phone || null,
          ngo_email: acceptRecord?.ngo_id?.user_email || null,
          accept_status: acceptRecord?.status || null,
        };
      });

      const sorted = merged.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setDonations(sorted);
      setFiltered(sorted);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load your donations");
    }
  };

  const handleDelete = async (donationId) => {
    if (!window.confirm("Delete this donation?")) return;

    try {
      await API.delete(`/donations/${donationId}`);
      toast.success("Donation deleted");
      loadDonations();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to delete donation");
    }
  };

  useEffect(() => {
    let data = [...donations];
    if (filterCategory !== "All")
      data = data.filter((d) => d.category === filterCategory);
    if (filterStatus !== "All")
      data = data.filter((d) => d.status === filterStatus);
    setFiltered(data);
  }, [filterCategory, filterStatus, donations]);

  const statusMap = {
    available: { label: "Available", classes: "bg-gray-100 text-gray-600" },
    claimed: { label: "Picked Up", classes: "bg-blue-100 text-blue-600" },
    pending_pickup: {
      label: "Pending Pickup",
      classes: "bg-yellow-100 text-yellow-600",
    },
    in_transit: {
      label: "In Transit",
      classes: "bg-purple-100 text-purple-600",
    },
    delivered: { label: "Delivered", classes: "bg-green-100 text-green-600" },
    completed: { label: "Completed", classes: "bg-green-100 text-green-600" },
  };

  const categoryMap = {
    Food: "bg-orange-100 text-orange-700 border border-orange-300",
    "Food Surplus": "bg-orange-100 text-orange-700 border border-orange-300",
    Clothes: "bg-pink-100 text-pink-700 border border-pink-300",
    Books: "bg-indigo-100 text-indigo-700 border border-indigo-300",
    "Educational Items":
      "bg-indigo-100 text-indigo-700 border border-indigo-300",
    Medical: "bg-red-100 text-red-700 border border-red-300",
    Other: "bg-gray-100 text-gray-700 border border-gray-300",
  };

  const categories = ["All", ...new Set(donations.map((d) => d.category))];
  const statuses = ["All", ...Object.keys(statusMap)];

  // 🧮 Summary stats
  const total = donations.length;
  const delivered = donations.filter(
    (d) => d.status === "delivered" || d.status === "completed"
  ).length;
  const pending = donations.filter(
    (d) =>
      d.status === "pending_pickup" ||
      d.status === "available" ||
      d.status === "in_transit"
  ).length;
  const categoryCount = new Set(donations.map((d) => d.category)).size;

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-gray-800">
          <Package className="text-yellow-500" />
          My Donations
        </h2>
      </div>

      {/* 🧾 Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5 mb-6">
        <div className="bg-white border border-yellow-100 rounded-xl shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition">
          <Package className="text-yellow-500" size={24} />
          <div>
            <p className="text-xs text-gray-600">Total</p>
            <p className="text-lg sm:text-2xl font-bold text-gray-800">
              {total}
            </p>
          </div>
        </div>

        <div className="bg-white border border-green-100 rounded-xl shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition">
          <Truck className="text-green-500" size={24} />
          <div>
            <p className="text-xs text-gray-600">Delivered</p>
            <p className="text-lg sm:text-2xl font-bold text-gray-800">
              {delivered}
            </p>
          </div>
        </div>

        <div className="bg-white border border-yellow-100 rounded-xl shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition">
          <Clock className="text-yellow-500" size={24} />
          <div>
            <p className="text-xs text-gray-600">Pending</p>
            <p className="text-lg sm:text-2xl font-bold text-gray-800">
              {pending}
            </p>
          </div>
        </div>

        <div className="bg-white border border-blue-100 rounded-xl shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition">
          <Layers className="text-blue-500" size={24} />
          <div>
            <p className="text-xs text-gray-600">Categories</p>
            <p className="text-lg sm:text-2xl font-bold text-gray-800">
              {categoryCount}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm text-gray-600 mb-1">
            Filter by Category
          </label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
          >
            {categories.map((c, idx) => (
              <option key={idx} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm text-gray-600 mb-1">
            Filter by Status
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
          >
            {statuses.map((s, idx) => (
              <option key={idx} value={s}>
                {statusMap[s]?.label || s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 🧺 Donation Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length > 0 ? (
          filtered.map((donation) => {
            const status = statusMap[donation.status] || {
              label: donation.status,
              classes: "bg-gray-100 text-gray-600",
            };
            const categoryClasses =
              categoryMap[donation.category] ||
              "bg-gray-100 text-gray-700 border border-gray-300";
            const photoUrl = getImageUrl(donation.photos?.[0]);
            const whatsappLink = donation.ngo_phone
              ? `https://wa.me/${donation.ngo_phone}?text=Hello%20${encodeURIComponent(
                  donation.ngo_name || "NGO"
                )},%20thanks%20for%20accepting%20my%20donation%20(${encodeURIComponent(
                  donation.title
                )}).`
              : null;

            return (
              <div
                key={donation._id}
                className="bg-white border border-yellow-100 rounded-2xl shadow-sm hover:shadow-lg transition overflow-hidden flex flex-col"
              >
                {/* Image */}
                <div className="relative w-full h-44 sm:h-48 bg-gray-50 overflow-hidden">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={donation.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <ImageOff size={40} />
                      <span className="text-xs mt-1">No Image</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {donation.title}
                  </h3>
                  <div className="flex justify-between items-center mb-2">
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${categoryClasses}`}
                    >
                      {donation.category}
                    </span>
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${status.classes}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600">
                    📦 Quantity: {donation.quantity}
                  </p>
                  <p className="text-sm text-gray-600">
                    📍 {donation.pickup_location}
                  </p>
                  <p className="text-sm text-gray-700 font-medium mt-1">
                    NGO: {donation.ngo_name || "Pending"}
                  </p>

                  <div className="flex items-center justify-between mt-auto pt-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedDonation(donation)}
                        className="px-3 py-1 text-xs border border-yellow-400 text-yellow-600 rounded-full hover:bg-yellow-50"
                      >
                        View Details
                      </button>
                      {donation.status === "available" && (
                        <>
                          <button
                            onClick={() => navigate(`/donor/edit/${donation._id}`)}
                            className="flex items-center gap-1 px-3 py-1 text-xs border border-indigo-400 text-indigo-600 rounded-full hover:bg-indigo-50"
                          >
                            <Edit3 size={12} /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(donation._id)}
                            className="flex items-center gap-1 px-3 py-1 text-xs border border-red-400 text-red-600 rounded-full hover:bg-red-50"
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </>
                      )}
                    </div>
                    {whatsappLink && (
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded-full hover:bg-green-600 text-xs"
                      >
                        <MessageCircle size={14} /> Chat
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-gray-500 text-sm">No donations found.</p>
        )}
      </div>

      {/* Modal */}
      {selectedDonation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-11/12 sm:w-full max-w-lg p-5 relative shadow-lg">
            <button
              onClick={() => setSelectedDonation(null)}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg sm:text-xl font-bold mb-4 text-gray-900">
              {selectedDonation.title}
            </h3>

            {selectedDonation.photos?.length > 0 && (
              <img
                src={getImageUrl(selectedDonation.photos[0])}
                alt="donation"
                className="w-full h-48 sm:h-56 object-cover rounded-xl mb-4"
              />
            )}

            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <strong>Category:</strong> {selectedDonation.category}
              </p>
              <p>
                <strong>Quantity:</strong> {selectedDonation.quantity}
              </p>
              <p>
                <strong>Location:</strong> {selectedDonation.pickup_location}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                {statusMap[selectedDonation.status]?.label ||
                  selectedDonation.status}
              </p>
              <p>
                <strong>NGO:</strong>{" "}
                {selectedDonation.ngo_name || "Not yet assigned"}
              </p>
              {selectedDonation.description && (
                <p>
                  <strong>Description:</strong> {selectedDonation.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyDonations;
