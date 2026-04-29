import React, { useRef, useState } from "react";
import { PlusCircle, MapPin, X, UploadCloud } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../../api/axios";

const MAX_FILES = 4;

const CreateDonation = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    quantity: "",
    pickup_location: "",
    pickup_by: "",
    urgent: false,
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const categories = ["Food Surplus", "Clothes", "Educational Items", "Medical", "Other"];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleFiles = (newFiles) => {
    const images = Array.from(newFiles).filter((f) => f.type.startsWith("image/"));
    if (files.length + images.length > MAX_FILES) {
      toast.error(`You can upload up to ${MAX_FILES} photos.`);
      return;
    }
    setFiles((prev) => [...prev, ...images]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.category || !form.pickup_location) {
      toast.error("Please fill all required fields.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, typeof value === "boolean" ? value.toString() : value);
      });
      files.forEach((file) => formData.append("photos", file));

      await API.post("/donations", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Donation added successfully!");
      setTimeout(() => navigate("/donor/my"), 900);
    } catch (err) {
      console.error("Error adding donation:", err);
      toast.error(err?.response?.data?.msg || "Error adding donation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="overflow-hidden rounded-[30px] bg-white shadow-sm ring-1 ring-yellow-100">
        <div className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 px-5 py-6 text-gray-900 sm:px-8">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-white/70 p-3 shadow-sm">
              <PlusCircle className="text-amber-700" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Create Donation</h2>
              <p className="mt-1 text-sm text-amber-950/80">
                Add clear details so NGOs can respond quickly on mobile.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-5 sm:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Category *</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-yellow-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-yellow-400 focus:bg-white focus:ring-4 focus:ring-yellow-100"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Quantity</label>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                min="1"
                placeholder="How many units?"
                className="w-full rounded-2xl border border-yellow-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-yellow-400 focus:bg-white focus:ring-4 focus:ring-yellow-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Title *</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Short donation title"
              required
              className="w-full rounded-2xl border border-yellow-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-yellow-400 focus:bg-white focus:ring-4 focus:ring-yellow-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe the items, condition, and anything NGOs should know."
              className="w-full rounded-2xl border border-yellow-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-yellow-400 focus:bg-white focus:ring-4 focus:ring-yellow-100"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Pickup Location *</label>
              <div className="flex items-center gap-3 rounded-2xl border border-yellow-200 bg-gray-50 px-4 py-3 transition focus-within:border-yellow-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-yellow-100">
                <MapPin className="h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  name="pickup_location"
                  value={form.pickup_location}
                  onChange={handleChange}
                  placeholder="Enter pickup address"
                  required
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Pickup By</label>
              <input
                type="date"
                name="pickup_by"
                value={form.pickup_by}
                onChange={handleChange}
                className="w-full rounded-2xl border border-yellow-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-yellow-400 focus:bg-white focus:ring-4 focus:ring-yellow-100"
              />
            </div>
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-yellow-100 bg-yellow-50 px-4 py-3 text-sm text-gray-700">
            <input type="checkbox" name="urgent" checked={form.urgent} onChange={handleChange} className="h-4 w-4" />
            <span>Mark this donation as urgent</span>
          </label>

          <div
            className={`cursor-pointer rounded-[26px] border-2 p-5 text-center transition ${
              dragOver ? "border-yellow-400 bg-yellow-50" : "border-dashed border-yellow-200 bg-white"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setDragOver(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud className="mx-auto mb-3 h-9 w-9 text-yellow-500" />
            <p className="text-sm font-medium text-gray-700">Drag, drop, or tap to upload photos</p>
            <p className="mt-1 text-xs text-gray-500">Up to {MAX_FILES} images for faster pickup decisions</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />

            {files.length > 0 && (
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {files.map((file, i) => (
                  <div key={i} className="relative h-24 overflow-hidden rounded-2xl border">
                    <img src={URL.createObjectURL(file)} alt="Preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        removeFile(i);
                      }}
                      className="absolute right-2 top-2 rounded-full bg-red-600 p-1 text-white"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-yellow-500 px-4 py-3 font-semibold text-white transition hover:bg-yellow-600 disabled:opacity-60"
          >
            {loading ? "Submitting..." : "Create Donation"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateDonation;
