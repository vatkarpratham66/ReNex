import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  BadgeCheck,
  Clock3,
  Edit3,
  FileText,
  Loader2,
  ShieldX,
  Upload,
} from "lucide-react";
import API, { getBackendAssetUrl } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const getStatusMeta = (status) => {
  if (status === "verified") {
    return {
      label: "Verified",
      tone: "bg-green-100 text-green-700",
      icon: BadgeCheck,
    };
  }

  if (status === "rejected") {
    return {
      label: "Rejected",
      tone: "bg-red-100 text-red-700",
      icon: ShieldX,
    };
  }

  return {
    label: "Pending Verification",
    tone: "bg-yellow-100 text-yellow-700",
    icon: Clock3,
  };
};

const NGOProfileMobile = () => {
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
        toast.error("Failed to load NGO profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [reset, setUser]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      setSaving(true);
      const needsCategory = values.needs_category_csv
        ? values.needs_category_csv
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [];

      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("phone", values.phone);
      formData.append("ngo_name", values.ngo_name);
      formData.append("registration_no", values.registration_no);
      needsCategory.forEach((item) => formData.append("needs_category[]", item));
      if (certificate) {
        formData.append("certificate", certificate);
      }

      const { data } = await API.put("/users/me", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUser(data.user, data.profile);
      setProfileData(data.profile);
      setCertificate(null);
      reset({
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone || "",
        ngo_name: data.profile?.ngo_name || "",
        registration_no: data.profile?.registration_no || "",
        needs_category_csv: (data.profile?.needs_category || []).join(", "),
      });

      toast.success("NGO profile updated and submitted for verification.");
      setEditMode(false);
    } catch {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  });

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-[28px] bg-white p-6 text-gray-600 shadow-sm ring-1 ring-gray-100">
        <Loader2 className="h-5 w-5 animate-spin text-sky-600" />
        Loading NGO profile...
      </div>
    );
  }

  const verificationStatus =
    profileData?.status || (profileData?.verified ? "verified" : "pending");
  const statusMeta = getStatusMeta(verificationStatus);
  const StatusIcon = statusMeta.icon;
  const certificateUrl = profileData?.certificateUrl
    ? getBackendAssetUrl(profileData.certificateUrl)
    : null;

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-[30px] bg-gradient-to-r from-sky-600 via-cyan-500 to-emerald-400 px-5 py-6 text-white shadow-lg shadow-sky-100 sm:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-start gap-4">
            <img
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || "NGO"}`}
              alt="Avatar"
              className="h-16 w-16 rounded-full bg-white/90 p-2 shadow"
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-50/90">
                Organization Setup
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight">
                NGO Profile
              </h1>
              <p className="mt-2 max-w-xl text-sm text-sky-50/90">
                Manage your organization details, verification documents, and
                contact information from one place.
              </p>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${statusMeta.tone}`}
          >
            <StatusIcon className="h-4 w-4" />
            {statusMeta.label}
          </span>
        </div>
      </div>

      {!editMode ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Contact Details
              </h2>
              <div className="mt-4 space-y-3 text-sm text-gray-700">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-gray-400">
                    Full Name
                  </p>
                  <p className="mt-1 font-medium text-gray-900">
                    {user?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-gray-400">
                    Email
                  </p>
                  <p className="mt-1 font-medium text-gray-900">
                    {user?.email || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-gray-400">
                    Phone
                  </p>
                  <p className="mt-1 font-medium text-gray-900">
                    {user?.phone || "Not added yet"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Organization Details
              </h2>
              <div className="mt-4 space-y-3 text-sm text-gray-700">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-gray-400">
                    NGO Name
                  </p>
                  <p className="mt-1 font-medium text-gray-900">
                    {profileData?.ngo_name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-gray-400">
                    Registration Number
                  </p>
                  <p className="mt-1 font-medium text-gray-900">
                    {profileData?.registration_no || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              Need Categories
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {(profileData?.needs_category || []).length > 0 ? (
                profileData.needs_category.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-sky-50 px-3 py-1.5 text-sm font-medium text-sky-700"
                  >
                    {item}
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  No need categories added yet.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              Verification Certificate
            </h2>
            {certificateUrl ? (
              <a
                href={certificateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-sky-200 px-4 py-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-50"
              >
                <FileText className="h-4 w-4" />
                View Certificate
              </a>
            ) : (
              <p className="mt-4 text-sm text-gray-500">
                No certificate uploaded yet.
              </p>
            )}
          </div>

          <button
            onClick={() => setEditMode(true)}
            className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 font-semibold text-white transition hover:bg-sky-700"
          >
            <Edit3 size={16} /> Edit Profile
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              Basic Information
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  {...register("name", { required: "Name is required" })}
                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  {...register("email")}
                  disabled
                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  {...register("phone", {
                    pattern: {
                      value: /^[0-9+\- ]*$/,
                      message: "Invalid phone number",
                    },
                  })}
                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              NGO Information
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  NGO Name
                </label>
                <input
                  {...register("ngo_name", { required: "NGO name is required" })}
                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                />
                {errors.ngo_name && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.ngo_name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Registration No
                </label>
                <input
                  {...register("registration_no", {
                    required: "Registration number is required",
                  })}
                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                />
                {errors.registration_no && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.registration_no.message}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                Needs Categories
              </label>
              <input
                {...register("needs_category_csv")}
                placeholder="food, clothes, books"
                className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
              />
              <p className="mt-1 text-xs text-gray-500">
                Separate categories with commas, for example: food, clothes,
                books.
              </p>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                Upload Registration Certificate
              </label>
              <label className="mt-2 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-[24px] border border-dashed border-sky-300 bg-sky-50 px-4 py-5 text-center transition hover:bg-sky-100">
                <Upload className="h-5 w-5 text-sky-600" />
                <span className="mt-2 text-sm font-medium text-sky-700">
                  Choose PDF, JPG, JPEG, or PNG
                </span>
                <span className="mt-1 text-xs text-sky-600">
                  Max recommended size: 5 MB
                </span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setCertificate(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
              {certificate && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected file:{" "}
                  <span className="font-medium text-gray-800">
                    {certificate.name}
                  </span>
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save and Submit"
              )}
            </button>
            <button
              type="button"
              onClick={() => setEditMode(false)}
              className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-gray-200 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default NGOProfileMobile;
