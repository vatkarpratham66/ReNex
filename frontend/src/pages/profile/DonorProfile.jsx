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
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await API.get("/users/me");
        setProfileData(data.profile || null);
        reset({
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone || "",
          org_name: data.profile?.org_name || "",
        });
        setUser(data.user, data.profile);
      } catch (err) {
        if (err.response?.status === 401) toast.error("Session expired, please log in again");
        else toast.error("Failed to load donor profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [reset, setUser]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      setSaving(true);
      const { data } = await API.put("/users/me", {
        name: values.name,
        phone: values.phone,
        org_name: values.org_name,
      });

      setUser(data.user, data.profile);
      setProfileData(data.profile || null);
      reset({
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone || "",
        org_name: data.profile?.org_name || "",
      });

      toast.success("Donor profile updated successfully");
      setEditMode(false);
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="mr-2 h-6 w-6 animate-spin text-sky-600" />
        <span className="text-gray-600">Loading donor profile...</span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="overflow-hidden rounded-[30px] bg-white shadow-sm ring-1 ring-sky-100">
        <div className="bg-gradient-to-r from-sky-500 to-cyan-500 px-5 py-6 text-white sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <img
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || "Donor"}`}
              alt="Avatar"
              className="h-16 w-16 rounded-full border border-white/40 bg-white shadow"
            />
            <div>
              <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Donor Profile</h1>
              <p className="mt-1 text-sm text-sky-50/90">Manage your personal and organization details.</p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-8">
          {!editMode ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-gray-50 p-4"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Full Name</p><p className="mt-2 font-medium text-gray-900">{user?.name}</p></div>
                <div className="rounded-2xl bg-gray-50 p-4"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Email</p><p className="mt-2 break-all font-medium text-gray-900">{user?.email}</p></div>
                <div className="rounded-2xl bg-gray-50 p-4"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Phone</p><p className="mt-2 font-medium text-gray-900">{user?.phone || "N/A"}</p></div>
                <div className="rounded-2xl bg-gray-50 p-4"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Organization</p><p className="mt-2 font-medium text-gray-900">{profileData?.org_name || "N/A"}</p></div>
              </div>
              <button onClick={() => setEditMode(true)} className="mt-2 w-full rounded-2xl bg-sky-600 px-5 py-3 font-semibold text-white transition hover:bg-sky-700 sm:w-auto">Edit Profile</button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Full Name</label>
                <input {...register("name", { required: "Name is required" })} className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100" />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Email</label>
                <input {...register("email")} className="w-full rounded-2xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-500" disabled />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Phone</label>
                <input {...register("phone", { pattern: { value: /^[0-9+\- ]*$/, message: "Invalid phone number" } })} className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100" />
                {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>}
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Organization Name</label>
                <input {...register("org_name")} placeholder="Optional organization or business name" className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100" />
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button type="submit" disabled={saving} className="flex min-h-12 items-center justify-center rounded-2xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700 disabled:opacity-60">{saving ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Saving...</span> : "Save"}</button>
                <button type="button" onClick={() => setEditMode(false)} className="min-h-12 rounded-2xl bg-gray-200 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-300">Cancel</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonorProfile;
