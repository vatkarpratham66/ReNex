import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Info,
  Loader2,
  MapPin,
  MessageCircle,
  Package,
  Phone,
} from "lucide-react";
import API, { getBackendAssetUrl } from "../../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

const BrowseDonationsMobile = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (user?.role !== "ngo") return;
        const { data } = await API.get("/users/me");
        const profile = data?.profile;
        if (profile) {
          setHasProfile(Boolean(profile.ngo_name && profile.registration_no));
          if (profile.status === "verified" || profile.verified) {
            setIsVerified(true);
          }
        }
      } catch {
        console.warn("Failed to load NGO profile");
      } finally {
        setIsProfileLoaded(true);
      }
    };

    loadProfile();
  }, [user]);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const res = await API.get("/donations");
      setDonations(res.data || []);
    } catch (err) {
      console.error("Error fetching donations:", err);
      toast.error("Failed to load donations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const handleAcceptPickup = async (donationId) => {
    if (user?.role === "ngo" && !isVerified) {
      toast.error("Your NGO is not verified yet. Please wait for admin approval.");
      return;
    }

    try {
      await API.post(`/accept/${donationId}`);
      toast.success("Pickup accepted successfully.");
      fetchDonations();
    } catch (err) {
      console.error("Error accepting donation:", err.response?.data || err.message);
      toast.error(err.response?.data?.msg || "Error accepting donation");
    }
  };

  const openCall = (phone) => {
    if (!phone) {
      toast.error("Phone number not available");
      return;
    }
    window.location.href = `tel:${phone}`;
  };

  const openDirections = (location) => {
    const query = encodeURIComponent(location || "");
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${query}`,
      "_blank"
    );
  };

  const openWhatsApp = (phone, name, title) => {
    if (!phone) {
      toast.error("WhatsApp number not available");
      return;
    }
    const msg = `Hello ${name || "Donor"}, I am interested in your donation (${title}).`;
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`,
      "_blank"
    );
  };

  const filteredDonations = donations.filter(
    (donation) => donation.status === "available"
  );

  if (user?.role === "ngo" && isProfileLoaded && !hasProfile) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-[30px] bg-white px-6 py-12 text-center shadow-sm ring-1 ring-gray-100">
        <Info className="mb-3 h-10 w-10 text-sky-600" />
        <h2 className="text-xl font-semibold text-gray-800">
          Complete Your NGO Profile
        </h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-gray-600">
          Please complete your NGO profile before browsing or accepting donations.
          This helps us verify your organization and maintain transparency.
        </p>
        <Link
          to="/profile/ngo"
          className="mt-5 rounded-2xl bg-sky-600 px-5 py-3 font-semibold text-white transition hover:bg-sky-700"
        >
          Go to Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-[30px] bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 px-5 py-6 text-white shadow-lg shadow-orange-100 sm:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-white/15 p-3 backdrop-blur">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                Browse Donations
              </h2>
              <p className="mt-1 max-w-xl text-sm text-orange-50/90">
                Explore available donations, contact donors quickly, and manage
                pickup from a mobile-friendly view.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:max-w-xs">
            <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur">
              <p className="text-2xl font-bold">{filteredDonations.length}</p>
              <p className="text-xs uppercase tracking-[0.16em] text-orange-50/85">
                Available
              </p>
            </div>
            <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur">
              <p className="text-2xl font-bold">
                {isVerified ? "Yes" : "No"}
              </p>
              <p className="text-xs uppercase tracking-[0.16em] text-orange-50/85">
                Verified
              </p>
            </div>
          </div>
        </div>
      </div>

      {user?.role === "ngo" && isProfileLoaded && !isVerified && (
        <div className="flex items-start gap-3 rounded-[24px] border border-yellow-300 bg-yellow-50 px-4 py-4 text-yellow-800 shadow-sm">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
          <p className="text-sm leading-relaxed">
            <strong>Verification pending.</strong> You can browse donations now,
            but accepting pickups will stay disabled until admin approval is complete.
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-3 rounded-[28px] bg-white p-6 text-gray-600 shadow-sm ring-1 ring-gray-100">
          <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
          Loading available donations...
        </div>
      ) : filteredDonations.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredDonations.map((donation) => {
            const imageUrl = donation.photos?.[0]
              ? getBackendAssetUrl(donation.photos[0])
              : "/placeholder.jpg";

            return (
              <div
                key={donation._id}
                className="overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-gray-100 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={donation.title}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-orange-700 shadow">
                    {donation.category || "General"}
                  </span>
                </div>

                <div className="space-y-4 p-5">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {donation.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      by {donation.donor?.user_name || "Unknown donor"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {donation.donor?.user_email || "Email not available"}
                    </p>
                  </div>

                  <p className="text-sm leading-relaxed text-gray-700 line-clamp-3">
                    {donation.description || "No description provided."}
                  </p>

                  <div className="grid grid-cols-1 gap-3 rounded-2xl bg-gray-50 p-4 text-sm text-gray-600 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-gray-400">
                        Quantity
                      </p>
                      <p className="mt-1 font-medium text-gray-800">
                        {donation.quantity || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-gray-400">
                        Posted
                      </p>
                      <p className="mt-1 font-medium text-gray-800">
                        {new Date(donation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs uppercase tracking-[0.14em] text-gray-400">
                        Pickup Location
                      </p>
                      <p className="mt-1 font-medium text-gray-800">
                        {donation.pickup_location || "Not specified"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <button
                      onClick={() => handleAcceptPickup(donation._id)}
                      disabled={!isVerified}
                      className={`min-h-11 rounded-2xl px-4 py-3 text-sm font-semibold text-white transition ${
                        !isVerified
                          ? "cursor-not-allowed bg-gray-300"
                          : "bg-orange-500 hover:bg-orange-600"
                      }`}
                    >
                      Accept Pickup
                    </button>

                    <button
                      onClick={() => openDirections(donation.pickup_location)}
                      disabled={!isVerified}
                      className={`flex min-h-11 items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                        !isVerified
                          ? "cursor-not-allowed border-gray-200 text-gray-400"
                          : "border-orange-200 text-orange-700 hover:bg-orange-50"
                      }`}
                    >
                      <MapPin size={16} /> Directions
                    </button>

                    {donation.donor?.user_phone && (
                      <>
                        <button
                          onClick={() =>
                            openWhatsApp(
                              donation.donor.user_phone,
                              donation.donor.user_name,
                              donation.title
                            )
                          }
                          disabled={!isVerified}
                          className={`flex min-h-11 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                            !isVerified
                              ? "cursor-not-allowed bg-gray-200 text-gray-400"
                              : "bg-green-500 text-white hover:bg-green-600"
                          }`}
                        >
                          <MessageCircle size={16} /> WhatsApp
                        </button>

                        <button
                          onClick={() => openCall(donation.donor.user_phone)}
                          disabled={!isVerified}
                          className={`flex min-h-11 items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                            !isVerified
                              ? "cursor-not-allowed border-gray-200 text-gray-400"
                              : "border-green-200 text-green-700 hover:bg-green-50"
                          }`}
                        >
                          <Phone size={16} /> Call Donor
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[28px] bg-white px-6 py-14 text-center text-gray-500 shadow-sm ring-1 ring-gray-100">
          <Package className="mx-auto h-10 w-10 text-orange-300" />
          <p className="mt-3 font-medium text-gray-700">
            No donations are available right now.
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Check back soon for new listings from donors.
          </p>
        </div>
      )}
    </div>
  );
};

export default BrowseDonationsMobile;
