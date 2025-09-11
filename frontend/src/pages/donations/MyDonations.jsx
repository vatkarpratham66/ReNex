import React, { useEffect, useState } from "react";
import { Package, X } from "lucide-react";
import API from "../../api/axios"; // ✅ fixed import

const MyDonations = () => {
  const [donations, setDonations] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedDonation, setSelectedDonation] = useState(null);

  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const res = await API.get("/donations/my/details");

        const { donations = [], accepts = [] } = res.data;

        // merge donations with NGO info from accepts
        const merged = donations.map((donation) => {
          const acceptRecord = accepts.find(
            (a) => String(a.donation_id) === String(donation._id)
          );
          return {
            ...donation,
            ngo_name: acceptRecord?.ngo_id?.ngo_name || null,
            accept_status: acceptRecord?.status || null,
          };
        });

        setDonations(merged);
        setFiltered(merged);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDonations();
  }, []);

  useEffect(() => {
    let data = [...donations];
    if (filterCategory !== "All") {
      data = data.filter((d) => d.category === filterCategory);
    }
    if (filterStatus !== "All") {
      data = data.filter((d) => d.status === filterStatus);
    }
    setFiltered(data);
  }, [filterCategory, filterStatus, donations]);

  // status → label + Tailwind color
  const statusMap = {
    available: { label: "Available", classes: "bg-gray-100 text-gray-600" },
    claimed: { label: "Picked Up", classes: "bg-blue-100 text-blue-600" },
    pending_pickup: {
      label: "Pending Pickup",
      classes: "bg-yellow-100 text-yellow-600",
    },
    in_transit: { label: "In Transit", classes: "bg-purple-100 text-purple-600" },
    delivered: { label: "Delivered", classes: "bg-green-100 text-green-600" },
    completed: { label: "Completed", classes: "bg-green-100 text-green-600" },
  };

  // category → Tailwind styles
  const categoryMap = {
    Food: "bg-orange-100 text-orange-700 border border-orange-300",
    "Food Surplus": "bg-orange-100 text-orange-700 border border-orange-300",
    Clothes: "bg-pink-100 text-pink-700 border border-pink-300",
    Books: "bg-indigo-100 text-indigo-700 border border-indigo-300",
    "Educational Items": "bg-indigo-100 text-indigo-700 border border-indigo-300",
    Medical: "bg-red-100 text-red-700 border border-red-300",
    Other: "bg-gray-100 text-gray-700 border border-gray-300",
  };

  // unique filter options
  const categories = ["All", ...new Set(donations.map((d) => d.category))];
  const statuses = ["All", ...Object.keys(statusMap)];

  return (
    <div className="p-6">
      {/* Header */}
      <h2 className="flex items-center gap-2 text-2xl font-bold mb-6">
        <Package className="text-yellow-500" />
        My Donations
      </h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-sm text-gray-600">Filter by Category</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          >
            {categories.map((c, idx) => (
              <option key={idx} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-600">Filter by Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          >
            {statuses.map((s, idx) => (
              <option key={idx} value={s}>
                {statusMap[s]?.label || s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Donation List */}
      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((donation) => {
            const status = statusMap[donation.status] || {
              label: donation.status,
              classes: "bg-gray-100 text-gray-600",
            };

            const categoryClasses =
              categoryMap[donation.category] ||
              "bg-gray-100 text-gray-700 border border-gray-300";

            return (
              <div
                key={donation._id}
                className="border border-yellow-300 rounded-lg p-5 flex flex-col md:flex-row justify-between items-start md:items-center shadow-sm"
              >
                {/* Left section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    {donation.title}
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${categoryClasses}`}
                    >
                      {donation.category}
                    </span>
                  </h3>
                  <p className="text-sm text-gray-600">
                    Quantity: {donation.quantity}
                  </p>
                  <p className="text-sm text-gray-600">
                    Location: {donation.pickup_location}
                  </p>
                  <p className="text-sm text-gray-700 font-medium">
                    NGO: {donation.ngo_name || "Pending"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Posted: {new Date(donation.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Right section */}
                <div className="flex gap-3 mt-3 md:mt-0">
                  <span
                    className={`px-3 py-1 text-xs rounded-full self-center ${status.classes}`}
                  >
                    {status.label}
                  </span>
                  <button
                    onClick={() => setSelectedDonation(donation)}
                    className="px-4 py-1 text-sm border border-yellow-400 text-yellow-600 rounded-full hover:bg-yellow-50"
                  >
                    View Details
                  </button>
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
          <div className="bg-white rounded-lg w-full max-w-lg p-6 relative shadow-lg">
            <button
              onClick={() => setSelectedDonation(null)}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold mb-4 text-gray-900">
              {selectedDonation.title}
            </h3>

            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <strong>Category:</strong>{" "}
                <span
                  className={`px-2 py-0.5 text-xs rounded-full ${
                    categoryMap[selectedDonation.category] ||
                    "bg-gray-100 text-gray-700 border border-gray-300"
                  }`}
                >
                  {selectedDonation.category}
                </span>
              </p>
              <p>
                <strong>Quantity:</strong> {selectedDonation.quantity}
              </p>
              <p>
                <strong>Location:</strong> {selectedDonation.pickup_location}
              </p>
              <p>
                <strong>NGO:</strong>{" "}
                {selectedDonation.ngo_name || "Not yet assigned"}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    statusMap[selectedDonation.status]?.classes ||
                    "bg-gray-100 text-gray-600"
                  }`}
                >
                  {statusMap[selectedDonation.status]?.label ||
                    selectedDonation.status}
                </span>
              </p>
              <p>
                <strong>Posted on:</strong>{" "}
                {new Date(selectedDonation.createdAt).toLocaleDateString()}
              </p>
              {selectedDonation.description && (
                <p>
                  <strong>Description:</strong> {selectedDonation.description}
                </p>
              )}
            </div>

            {/* Photos */}
            {selectedDonation.photos?.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-sm mb-2">Photos:</h4>
                <div className="grid grid-cols-2 gap-3">
                  {selectedDonation.photos.map((photo, idx) => (
                    <img
                      key={idx}
                      src={photo}
                      alt="donation"
                      className="w-full h-32 object-cover rounded border"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyDonations;
