import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";

const formatDateForInput = (value) => {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
};

const EditDonation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, reset } = useForm();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await API.get("/donations/my");
        const donation = data.find((d) => d._id === id);
        if (!donation) {
          toast.error("Donation not found");
          navigate("/donor/my");
          return;
        }
        reset({ ...donation, pickup_by: formatDateForInput(donation.pickup_by) });
      } catch {
        toast.error("Failed to load donation");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate, reset]);

  const onSubmit = async (values) => {
    try {
      await API.put(`/donations/${id}`, values);
      toast.success("Donation updated");
      navigate("/donor/my");
    } catch {
      toast.error("Update failed");
    }
  };

  if (loading) {
    return <div className="rounded-[28px] bg-white px-6 py-12 text-center shadow-sm ring-1 ring-sky-100">Loading donation...</div>;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="overflow-hidden rounded-[30px] bg-white shadow-sm ring-1 ring-sky-100">
        <div className="bg-gradient-to-r from-sky-500 to-cyan-500 px-5 py-6 text-white sm:px-8">
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Edit Donation</h1>
          <p className="mt-1 text-sm text-sky-50/90">
            Update the donation details so NGOs always see the latest info.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-5 sm:p-8">
          <input {...register("title")} placeholder="Title" className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100" />
          <textarea {...register("description")} rows={4} placeholder="Description" className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100" />
          <select {...register("category")} className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100">
            <option value="Food">Food</option>
            <option value="Food Surplus">Food Surplus</option>
            <option value="Clothes">Clothes</option>
            <option value="Education">Education</option>
            <option value="Educational Items">Educational Items</option>
            <option value="Medical">Medical</option>
            <option value="Other">Other</option>
          </select>
          <div className="grid gap-4 sm:grid-cols-2">
            <input {...register("quantity")} type="number" placeholder="Quantity" className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100" />
            <input {...register("pickup_by")} type="date" className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100" />
          </div>
          <input {...register("pickup_location")} placeholder="Pickup Location" className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100" />
          <label className="flex items-center gap-3 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-gray-700">
            <input type="checkbox" {...register("urgent")} className="h-4 w-4" />
            Mark as urgent
          </label>
          <button type="submit" className="w-full rounded-2xl bg-sky-600 px-4 py-3 font-semibold text-white transition hover:bg-sky-700">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditDonation;
