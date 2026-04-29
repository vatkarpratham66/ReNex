import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import {
  Loader2,
  Search,
  Trash2,
  Gift,
  User,
  Mail,
  Image as ImageIcon,
  Filter,
} from "lucide-react";
import toast from "react-hot-toast";
import Layout from "../../components/Layout";

const StatusBadge = ({ status }) => {
  const styles = {
    available: "bg-yellow-100 text-yellow-700",
    claimed: "bg-blue-100 text-blue-700",
    pending_pickup: "bg-orange-100 text-orange-700",
    in_transit: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
    completed: "bg-green-100 text-green-700",
  };
  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
        styles[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status || "Unknown"}
    </span>
  );
};

const AdminDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all"); // ✅ new filter

  const BASE_URL = "http://localhost:5000"; // adjust if needed

  const loadDonations = async () => {
    try {
      const { data } = await API.get("/admin/donations");
      setDonations(data);
    } catch (err) {
      console.error("Error loading donations:", err);
      toast.error("Failed to load donations");
    } finally {
      setLoading(false);
    }
  };

  const deleteDonation = async (id) => {
    if (!window.confirm("Are you sure you want to delete this donation?")) return;
    try {
      await API.delete(`/admin/donations/${id}`);
      toast.success("Donation deleted");
      loadDonations();
    } catch {
      toast.error("Failed to delete donation");
    }
  };

  useEffect(() => {
    loadDonations();
  }, []);

  const categories = ["all", ...new Set(donations.map((d) => d.category).filter(Boolean))];

  // ✅ Filtering logic (search + status + category)
  const filteredDonations = donations.filter((d) => {
    const matchesStatus =
      statusFilter === "all" || d.status === statusFilter;

    const matchesCategory =
      categoryFilter === "all" ||
      d.category?.toLowerCase() === categoryFilter.toLowerCase();

    const matchesSearch =
      d.title?.toLowerCase().includes(search.toLowerCase()) ||
      d.donor?.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      d.donor?.user_email?.toLowerCase().includes(search.toLowerCase());

    return matchesStatus && matchesCategory && matchesSearch;
  });

  return (
    <Layout>
      <div className="space-y-5">
        <div className="rounded-[30px] bg-gradient-to-r from-emerald-600 to-green-500 px-5 py-6 text-white sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Manage Donations</h1>
            <p className="mt-2 text-sm text-green-50/90">
              Review live donation listings, filter quickly, and take action from mobile.
            </p>
          </div>
            <div className="grid w-full gap-3 sm:grid-cols-3 lg:max-w-3xl">
            <div className="relative sm:col-span-3">
              <Search className="absolute left-3 top-3 text-green-200 w-5 h-5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search donations..."
                className="w-full rounded-2xl border border-white/20 bg-white/15 py-3 pl-10 pr-4 text-sm text-white placeholder:text-green-100/80 outline-none backdrop-blur focus:bg-white/20"
              />
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-white/15 px-3 py-3 backdrop-blur">
              <Filter className="w-4 h-4 text-green-100" />
              <select
                className="w-full bg-transparent text-sm text-white outline-none"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </option>
                ))}
              </select>
            </div>
            <select
              className="rounded-2xl bg-white/15 px-3 py-3 text-sm text-white outline-none backdrop-blur"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="claimed">Claimed</option>
              <option value="pending_pickup">Pending Pickup</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin w-10 h-10 text-green-600" />
          </div>
        ) : filteredDonations.length === 0 ? (
          <div className="rounded-[28px] bg-white py-20 text-center text-gray-500 shadow-sm ring-1 ring-gray-100">
            No donations found.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredDonations.map((donation) => {
              const photo =
                donation.photos && donation.photos.length > 0
                  ? `${BASE_URL}${donation.photos[0]}`
                  : null;

              return (
                <div
                  key={donation._id}
                  className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="mb-3 w-full flex justify-center">
                    {photo ? (
                      <img
                        src={photo}
                        alt="Donation"
                        className="w-24 h-24 object-cover rounded-lg border"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 border">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="font-semibold text-gray-800 text-lg truncate">
                        {donation.title || "Unnamed Donation"}
                      </h2>
                      <p className="text-sm text-gray-500">
                        Category:{" "}
                        <span className="font-medium capitalize">
                          {donation.category || "Other"}
                        </span>
                      </p>
                      <p className="text-sm text-gray-500">
                        Qty: {donation.quantity || 1}
                      </p>
                    </div>
                    <StatusBadge status={donation.status} />
                  </div>

                  <div className="mt-3 text-sm text-gray-600">
                    {donation.donor?.user_name && (
                      <p className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        {donation.donor.user_name}
                      </p>
                    )}
                    {donation.donor?.user_email && (
                      <p className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {donation.donor.user_email}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => deleteDonation(donation._id)}
                      className="flex min-h-11 items-center gap-1 rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminDonations;
