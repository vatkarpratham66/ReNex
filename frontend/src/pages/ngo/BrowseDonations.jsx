import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  MessageCircle,
  MapPin,
  Phone,
  AlertTriangle,
  Info,
} from "lucide-react";
import API, { getBackendAssetUrl } from "../../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

const BrowseDonations = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);

  const [isVerified, setIsVerified] = useState(false);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  // ✅ Load NGO profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (user?.role !== "ngo") return;
        const { data } = await API.get("/users/me");
        const profile = data?.profile;
        if (profile) {
          setHasProfile(!!profile.ngo_name && !!profile.registration_no);
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

  // ✅ Fetch donations
  const fetchDonations = async () => {
    try {
      const res = await API.get("/donations");
      setDonations(res.data || []);
    } catch (err) {
      console.error("Error fetching donations:", err);
      toast.error("Failed to load donations");
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  // ✅ Accept pickup
  const handleAcceptPickup = async (donationId) => {
    if (user?.role === "ngo" && !isVerified) {
      toast.error("Your NGO is not verified yet. Please wait for admin approval.");
      return;
    }
    try {
      await API.post(`/accept/${donationId}`);
      toast.success("Pickup accepted successfully!");
      fetchDonations();
    } catch (err) {
      console.error("Error accepting donation:", err.response?.data || err.message);
      toast.error("Error accepting donation");
    }
  };

  // ✅ Utility functions
  const openCall = (phone) => {
    if (!phone) return toast.error("Phone number not available");
    window.location.href = `tel:${phone}`;
  };

  const openDirections = (location) => {
    const query = encodeURIComponent(location);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
  };

  const openWhatsApp = (phone, name, title) => {
    if (!phone) return toast.error("WhatsApp number not available");
    const msg = `Hello ${name || "Donor"}, I am interested in your donation (${title}).`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  const filteredDonations = donations.filter(
    (donation) => donation.status === "available"
  );

  // ✅ Handle NGO without profile
  if (user?.role === "ngo" && isProfileLoaded && !hasProfile) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-[30px] bg-white px-6 py-12 text-center shadow-sm ring-1 ring-gray-100">
        <Info className="mb-3 h-10 w-10 text-sky-600" />
        <h2 className="text-xl font-semibold text-gray-800">
          Complete Your NGO Profile
        </h2>
        <p className="mt-2 max-w-md text-sm text-gray-600">
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
      <div className="rounded-[30px] bg-gradient-to-r from-orange-500 to-amber-400 px-5 py-6 text-white sm:px-8">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-white/15 p-3 backdrop-blur">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
              Available Donations
            </h2>
            <p className="mt-1 text-sm text-orange-50/90">
              Browse new listings and connect with donors quickly from your phone.
            </p>
          </div>
        </div>
      </div>

      {user?.role === "ngo" && isProfileLoaded && !isVerified && (
        <div className="flex items-start gap-3 rounded-2xl border border-yellow-300 bg-yellow-50 px-4 py-4 text-yellow-800">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
          <p className="text-sm leading-relaxed">
            <strong>Verification Pending:</strong> Your NGO is awaiting admin approval.
            You cannot accept or manage donations until verification is complete.
          </p>
        </div>
      )}

      {filteredDonations.length > 0 ? (
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
                    {donation.category}
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 space-y-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {donation.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    by {donation.donor?.user_name || "Unknown"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {donation.donor?.user_email}
                  </p>
                  <p className="text-sm text-gray-700 mt-2 line-clamp-3">
                    {donation.description || "No description provided."}
                  </p>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-600 mt-2">
                    <span>📦 {donation.quantity}</span>
                    <span>📍 {donation.pickup_location}</span>
                    <span>
                      ⏰ {new Date(donation.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {statusMap[donation.status] === "Pending" && (
                    <button
                      onClick={() => handleAcceptPickup(donation._id)}
                      disabled={!isVerified}
                      className={`flex-1 px-3 py-2 rounded-md text-white text-sm font-medium ${
                        !isVerified
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-orange-500 hover:bg-orange-600"
                      }`}
                    >
                      Accept Pickup
                    </button>
                  )}

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
                        className={`flex items-center justify-center gap-1 flex-1 text-sm px-3 py-2 rounded-md transition ${
                          !isVerified
                            ? "bg-gray-200 cursor-not-allowed text-gray-400"
                            : "bg-green-500 hover:bg-green-600 text-white"
                        }`}
                      >
                        <MessageCircle size={16} /> WhatsApp
                      </button>

                      <button
                        onClick={() => openCall(donation.donor.user_phone)}
                        disabled={!isVerified}
                        className={`flex items-center justify-center gap-1 flex-1 border text-sm px-3 py-2 rounded-md transition ${
                          !isVerified
                            ? "border-gray-200 text-gray-400 cursor-not-allowed"
                            : "border-yellow-400 text-gray-700 hover:bg-yellow-50"
                        }`}
                      >
                        <Phone size={16} /> Call
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => openDirections(donation.pickup_location)}
                    disabled={!isVerified}
                    className={`flex items-center justify-center gap-1 flex-1 border text-sm px-3 py-2 rounded-md transition ${
                      !isVerified
                        ? "border-gray-200 text-gray-400 cursor-not-allowed"
                        : "border-yellow-400 text-gray-700 hover:bg-yellow-50"
                    }`}
                  >
                    <MapPin size={16} /> Directions
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500">
          <img
            src="/empty-box.svg"
            alt="No donations"
            className="w-24 h-24 mx-auto mb-3 opacity-70"
          />
          <p>No donations available at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default BrowseDonations;
