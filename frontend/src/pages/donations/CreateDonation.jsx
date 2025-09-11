import React, { useState } from "react";
import { PlusCircle, MapPin, Camera, X } from "lucide-react";
import API from "../../api/axios";
import toast from "react-hot-toast";

const CreateDonation = () => {
  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    quantity: "",
    pickup_location: "",
    pickup_by: "",
    urgent: false,
  });
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);

  const categories = [
    "Food Surplus",
    "Clothes",
    "Educational Items",
    "Medical",
    "Other",
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setPhotos((prev) => [...prev, ...files]);
  };

  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });
      photos.forEach((file) => {
        formData.append("photos", file);
      });

      await API.post("/donations", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("✅ Donation added successfully!");
      setForm({
        title: "",
        category: "",
        description: "",
        quantity: "",
        pickup_location: "",
        pickup_by: "",
        urgent: false,
      });
      setPhotos([]);
      document.getElementById("fileUpload").value = "";
    } catch (err) {
      console.error("Error adding donation:", err);
      toast.error(err?.response?.data?.msg || "❌ Error adding donation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <h2 className="flex items-center gap-2 text-2xl font-bold mb-6">
        <PlusCircle className="text-yellow-500" />
        Add New Donation
      </h2>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-5 bg-white p-6 rounded-xl border border-yellow-200 shadow-sm"
      >
        {/* Category + Quantity */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">
              Item Category
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className="w-full border border-yellow-300 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Quantity</label>
            <input
              type="number"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              placeholder="Enter quantity"
              required
              className="w-full border border-yellow-300 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-1">Item Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Brief title for your donation"
            required
            className="w-full border border-yellow-300 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Detailed description of items, condition, expiry dates etc."
            rows="3"
            required
            className="w-full border border-yellow-300 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>

        {/* Pickup Location + Date */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex items-center gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">
                Pickup Location
              </label>
              <input
                type="text"
                name="pickup_location"
                value={form.pickup_location}
                onChange={handleChange}
                placeholder="Enter your address"
                required
                className="w-full border border-yellow-300 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <MapPin className="text-gray-500" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Pickup By</label>
            <input
              type="date"
              name="pickup_by"
              value={form.pickup_by}
              onChange={handleChange}
              className="w-full border border-yellow-300 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
        </div>

        {/* Urgent Checkbox */}
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="urgent"
              checked={form.urgent}
              onChange={handleChange}
            />
            Mark as urgent
          </label>
        </div>

        {/* Upload Photos */}
        <div>
          <label className="block text-sm font-medium mb-2">Upload Photos</label>
          <div className="border-2 border-dashed border-yellow-400 rounded-lg p-6 text-center bg-yellow-50/20">
            <Camera className="mx-auto mb-2 text-orange-500" size={32} />
            <p className="text-gray-600 mb-3">
              Click to upload photos of your items
            </p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
              id="fileUpload"
            />
            <label
              htmlFor="fileUpload"
              className="cursor-pointer bg-white border border-yellow-400 text-gray-700 px-4 py-2 rounded-md hover:bg-yellow-50 inline-flex items-center gap-2"
            >
              ⬆ Choose Files
            </label>

            {/* Preview thumbnails */}
            {photos.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {photos.map((file, index) => (
                  <div
                    key={index}
                    className="relative w-24 h-24 border rounded-lg overflow-hidden"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-yellow-500 text-white font-medium rounded-lg hover:bg-yellow-600 transition disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Add Donation"}
        </button>
      </form>
    </div>
  );
};

export default CreateDonation;
