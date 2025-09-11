import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import API from "../../api/axios";
import { Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const DonorProfile = () => {
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

  // Load donor profile
  useEffect(() => {
  const fetchProfile = async () => {
    try {
      const { data } = await API.get("/users/me");
      reset({
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone || "",
      });
      setUser(data.user);
    } catch {
      toast.error("❌ Failed to load donor profile");
    } finally {
      setLoading(false);
    }
  };
  fetchProfile();
}, []);   // ✅ run only once


  // Save donor profile
  const onSubmit = handleSubmit(async (values) => {
    try {
      setSaving(true);
      const { data } = await API.put("/users/me", {
        name: values.name,
        phone: values.phone,
      });

      setUser(data.user); // update context
      reset({
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone || "",
      }); // refresh form values

      toast.success("✅ Donor profile updated");
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
        <span className="text-gray-600">Loading donor profile...</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-md">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <img
          src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || "Donor"}`}
          alt="Avatar"
          className="w-16 h-16 rounded-full shadow"
        />
        <div>
          <h1 className="text-2xl font-bold text-sky-600">🎁 Donor Profile</h1>
          <p className="text-gray-500 text-sm">Manage your donor details</p>
        </div>
      </div>

      {/* Display Mode */}
      {!editMode ? (
        <div className="space-y-4">
          <p><strong>Full Name:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Phone:</strong> {user?.phone || "N/A"}</p>

          <button
            onClick={() => setEditMode(true)}
            className="bg-sky-600 text-white px-5 py-2 rounded-lg hover:bg-sky-700 transition"
          >
            Edit Profile
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              {...register("name", { required: "Name is required" })}
              className="w-full border rounded-lg p-2 focus:ring focus:ring-sky-200"
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
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
                pattern: { value: /^[0-9+\- ]*$/, message: "Invalid phone number" },
              })}
              className="w-full border rounded-lg p-2"
            />
            {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
          </div>

          <div className="flex gap-3">
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
                "Save"
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
  );
};

export default DonorProfile;
