import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import { AlertTriangle, Heart } from "lucide-react";
import DonationCard from "../../components/DonationCard";
import toast from "react-hot-toast";

const HomeDashboard = () => {
  const [donations, setDonations] = useState([]);
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState({
    activeDonations: 0,
    urgent: 0,
    canServe: 0,
    activeDonors: 0,
  });
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await API.get("/donations");
        setDonations(data);

        const active = data.filter((d) => d.status === "available").length;
        const urgent = data.filter((d) => d.urgent).length;
        const people = data.reduce((sum, d) => sum + (d.quantity || 0), 0);
        const donors = new Set(data.map((d) => d.donor?.donor_id)).size;

        setStats({
          activeDonations: active,
          urgent,
          canServe: people,
          activeDonors: donors,
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to load dashboard data");
      }
    };

    load();
  }, []);

  const filteredDonations = donations.filter((donation) => {
    const matchesCategory = filter === "All" || donation.category === filter;
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      donation.title?.toLowerCase().includes(query) ||
      donation.description?.toLowerCase().includes(query) ||
      donation.pickup_location?.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  const categories = [
    "All",
    ...new Set(donations.map((d) => d.category).filter(Boolean)),
  ];

  const handleDonateMoney = () => {
    toast.success("Money donation feature coming soon.");
  };

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-[28px] bg-gradient-to-br from-green-600 via-emerald-500 to-lime-400 p-5 text-white shadow-lg shadow-emerald-100">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-green-50/90">
              Needo Community
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              Home Dashboard
            </h1>
            <p className="mt-3 max-w-xl text-sm text-green-50/95 sm:text-base">
              Find active donations fast, track urgent requests, and stay
              connected with the people who need help most.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:max-w-sm sm:grid-cols-2">
            <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur">
              <p className="text-2xl font-bold">{stats.activeDonations}</p>
              <p className="text-xs uppercase tracking-[0.16em] text-green-50/85">
                Active
              </p>
            </div>
            <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur">
              <p className="text-2xl font-bold">{stats.urgent}</p>
              <p className="text-xs uppercase tracking-[0.16em] text-green-50/85">
                Urgent
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-gray-100 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Discover donations
            </h2>
            <p className="text-sm text-gray-500">
              Search by item, description, or pickup location.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="text"
              placeholder="Search donations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-green-400 focus:bg-white focus:ring-4 focus:ring-green-100 sm:min-w-[220px]"
            />
            <select
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-green-400 focus:bg-white focus:ring-4 focus:ring-green-100 sm:w-56"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "All" ? "All Categories" : category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <div className="rounded-[24px] bg-white p-4 text-center shadow-sm ring-1 ring-gray-100">
          <p className="text-2xl font-bold">{stats.activeDonations}</p>
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-gray-500">
            Active Donations
          </p>
        </div>
        <div className="rounded-[24px] bg-white p-4 text-center shadow-sm ring-1 ring-gray-100">
          <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
          <p className="mt-1 flex items-center justify-center gap-1 text-xs font-medium uppercase tracking-[0.16em] text-gray-500">
            <AlertTriangle size={14} /> Urgent Items
          </p>
        </div>
        <div className="rounded-[24px] bg-white p-4 text-center shadow-sm ring-1 ring-gray-100">
          <p className="text-2xl font-bold text-green-600">{stats.canServe}+</p>
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-gray-500">
            Can Serve People
          </p>
        </div>
        <div className="rounded-[24px] bg-white p-4 text-center shadow-sm ring-1 ring-gray-100">
          <p className="text-2xl font-bold">{stats.activeDonors}</p>
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-gray-500">
            Active Donors
          </p>
        </div>
        <div className="rounded-[24px] bg-white p-4 text-center shadow-sm ring-1 ring-gray-100">
          <p className="text-2xl font-bold text-purple-600">
            {donations.length}
          </p>
          <p className="mt-1 flex items-center justify-center gap-1 text-xs font-medium uppercase tracking-[0.16em] text-gray-500">
            <Heart size={14} /> Community Listings
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-[28px] bg-gradient-to-r from-pink-100 via-rose-50 to-orange-100 p-5 shadow-sm ring-1 ring-pink-100 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-xl font-bold text-pink-700">
            Support Beyond Items
          </h2>
          <p className="mt-2 text-sm text-gray-700 sm:text-base">
            Help us serve more by donating money. Your contribution will provide
            essentials to those in need.
          </p>
          <p className="mt-3 text-sm text-gray-700">
            Need help? Call{" "}
            <a
              href="tel:8767087776"
              className="font-semibold text-pink-700 hover:underline"
            >
              8767087776
            </a>
          </p>
        </div>
        <button
          onClick={handleDonateMoney}
          className="w-full rounded-2xl bg-pink-600 px-6 py-3 font-semibold text-white shadow transition hover:bg-pink-700 sm:w-auto"
        >
          Donate Money
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredDonations.map((d) => (
          <DonationCard key={d._id} donation={d} showActions={false} />
        ))}
      </div>

      {filteredDonations.length === 0 && (
        <div className="rounded-[28px] border border-dashed border-gray-300 bg-white px-6 py-10 text-center text-gray-500">
          No donations match your search right now.
        </div>
      )}
    </div>
  );
};

export default HomeDashboard;
