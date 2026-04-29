import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import API from "../../api/axios";
import { Loader2, Edit3 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const NGOProfile = () => {
  const { user, setUser } = useAuth();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [certificate, setCertificate] = useState(null);
  const [profileData, setProfileData] = useState(null);

  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // 🔹 Load NGO profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await API.get("/users/me");
        const profile = data.profile || {};
        setProfileData(profile);
        reset({
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone || "",
          ngo_name: profile.ngo_name || "",
          registration_no: profile.registration_no || "",
          needs_category_csv: (profile.needs_category || []).join(", "),
        });
        setUser(data.user, profile);
      } catch {
        toast.error("❌ Failed to load NGO profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // 🔹 Save NGO profile
  const onSubmit = handleSubmit(async (values) => {
    try {
      setSaving(true);
      const needs_category = values.needs_category_csv
        ? values.needs_category_csv.split(",").map((s) => s.trim())
        : [];

      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("phone", values.phone);
      formData.append("ngo_name", values.ngo_name);
      formData.append("registration_no", values.registration_no);
      needs_category.forEach((c) => formData.append("needs_category[]", c));
      if (certificate) formData.append("certificate", certificate);

      const { data } = await API.put("/users/me", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUser(data.user, data.profile);
      setProfileData(data.profile);
      reset({
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone || "",
        ngo_name: data.profile?.ngo_name || "",
        registration_no: data.profile?.registration_no || "",
        needs_category_csv: (data.profile?.needs_category || []).join(", "),
      });

      toast.success("✅ NGO profile updated & submitted for verification");
      setEditMode(false);
    } catch {
      toast.error("⚠️ Update failed");
    } finally {
      setSaving(false);
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin w-6 h-6 text-sky-600 mr-2" />
        <span className="text-gray-600">Loading NGO profile...</span>
      </div>
    );
  }

  const verificationStatus =
    profileData?.status || (profileData?.verified ? "verified" : "pending");

  const getStatusColor = () => {
    switch (verificationStatus) {
      case "verified":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const certificateUrl = profileData?.certificateUrl
    ? profileData.certificateUrl.startsWith("http")
      ? profileData.certificateUrl
      : `${BASE_URL}${profileData.certificateUrl}`
    : null;

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-md relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <img
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || "NGO"}`}
              alt="Avatar"
              className="w-16 h-16 rounded-full shadow"
            />
            <div>
              <h1 className="text-2xl font-bold text-sky-600">NGO Profile</h1>
              <p className="text-gray-500 text-sm">Manage your NGO details</p>
            </div>
          </div>

          {/* Status badge */}
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}
          >
            {verificationStatus === "verified" && "✅ Verified"}
            {verificationStatus === "pending" && "⏳ Pending Verification"}
            {verificationStatus === "rejected" && "❌ Rejected"}
          </span>
        </div>

        {/* Display Mode */}
        {!editMode ? (
          <div className="space-y-3 text-gray-700">
            <p>
              <strong>Full Name:</strong> {user?.name}
            </p>
            <p>
              <strong>Email:</strong> {user?.email}
            </p>
            <p>
              <strong>Phone:</strong> {user?.phone || "N/A"}
            </p>
            <p>
              <strong>NGO Name:</strong> {profileData?.ngo_name || "N/A"}
            </p>
            <p>
              <strong>Registration No:</strong>{" "}
              {profileData?.registration_no || "N/A"}
            </p>
            <p>
              <strong>Needs Categories:</strong>{" "}
              {(profileData?.needs_category || []).join(", ") || "N/A"}
            </p>

            {certificateUrl && (
              <p>
                <strong>Certificate:</strong>{" "}
                <a
                  href={certificateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-600 underline"
                >
                  View Certificate
                </a>
              </p>
            )}

            <button
              onClick={() => setEditMode(true)}
              className="mt-6 flex items-center gap-2 bg-sky-600 text-white px-5 py-2 rounded-lg hover:bg-sky-700 transition"
            >
              <Edit3 size={16} /> Edit Profile
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Basic Info */}
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                Basic Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Full Name
                  </label>
                  <input
                    {...register("name", { required: "Name is required" })}
                    className="w-full border rounded-lg p-2 focus:ring focus:ring-sky-200"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    {...register("email")}
                    className="w-full border rounded-lg p-2 bg-gray-100"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    {...register("phone", {
                      pattern: {
                        value: /^[0-9+\- ]*$/,
                        message: "Invalid phone number",
                      },
                    })}
                    className="w-full border rounded-lg p-2"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* NGO Info */}
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                NGO Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    NGO Name
                  </label>
                  <input
                    {...register("ngo_name", { required: "NGO name is required" })}
                    className="w-full border rounded-lg p-2"
                  />
                  {errors.ngo_name && (
                    <p className="text-red-500 text-sm">
                      {errors.ngo_name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Registration No
                  </label>
                  <input
                    {...register("registration_no", {
                      required: "Registration number is required",
                    })}
                    className="w-full border rounded-lg p-2"
                  />
                  {errors.registration_no && (
                    <p className="text-red-500 text-sm">
                      {errors.registration_no.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium mb-1">
                  Needs Categories
                </label>
                <input
                  {...register("needs_category_csv")}
                  placeholder="food, clothes, books"
                  className="w-full border rounded-lg p-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separate categories with commas (e.g., food, clothes, books)
                </p>
              </div>

              {/* Certificate Upload */}
              <div className="mt-4">
                <label className="block text-sm font-medium mb-1">
                  Upload Registration Certificate
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setCertificate(e.target.files[0])}
                  className="w-full border rounded-lg p-2"
                />
                {certificate && (
                  <p className="text-sm text-gray-600 mt-1">
                    📎 Selected file: <span className="font-medium">{certificate.name}</span>
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Accepted formats: PDF, JPG, PNG (max 5MB)
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin w-4 h-4" /> Saving...
                  </span>
                ) : (
                  "Save & Submit"
                )}
              </button>
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="bg-gray-400 text-white px-5 py-2 rounded-lg hover:bg-gray-500 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default NGOProfile;
