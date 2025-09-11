import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";

const EditDonation = () => {
  const { donationId } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, reset } = useForm();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await API.get("/donations/my");
        const donation = data.find((d) => d._id === donationId);
        if (!donation) {
          toast.error("Donation not found");
          navigate("/donations/my");
          return;
        }
        reset(donation);
      } catch {
        toast.error("Failed to load donation");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [donationId, navigate, reset]);

  const onSubmit = async (values) => {
    try {
      await API.put(`/donations/${donationId}`, values);
      toast.success("✅ Donation updated");
      navigate("/donations/my");
    } catch {
      toast.error("Update failed");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow">
      <h1 className="text-xl font-bold text-sky-600 mb-4">✏️ Edit Donation</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input {...register("title")} placeholder="Title" className="w-full border rounded p-2" />
        <textarea {...register("description")} placeholder="Description" className="w-full border rounded p-2" />
        <input {...register("quantity")} type="number" placeholder="Quantity" className="w-full border rounded p-2" />
        <input {...register("pickup_location")} placeholder="Pickup Location" className="w-full border rounded p-2" />
        <input {...register("pickup_by")} type="date" className="w-full border rounded p-2" />
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg">Save</button>
      </form>
    </div>
  );
};

export default EditDonation;
