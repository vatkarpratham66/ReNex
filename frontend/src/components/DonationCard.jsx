// src/components/DonationCard.jsx
import React from "react";
import { MapPin, Edit3, Trash2, HandHeart } from "lucide-react";

const Badge = ({ children, className = "" }) => (
  <span className={`inline-block px-3 py-1 text-xs rounded-full ${className}`}>{children}</span>
);

const DonationCard = ({ donation, onEdit, onDelete, onAccept, showActions }) => {
  const statusColor =
    donation?.status === "available"
      ? "bg-green-100 text-green-700"
      : donation?.status === "claimed"
      ? "bg-yellow-100 text-yellow-700"
      : donation?.status === "delivered"
      ? "bg-blue-100 text-blue-700"
      : "bg-gray-100 text-gray-600";

  return (
    <div className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition flex flex-col justify-between">
      <div>
        <h3 className="text-lg font-semibold text-gray-800">{donation?.title}</h3>
        <p className="text-sm text-gray-500">{donation?.category}</p>
        {donation?.pickup_location && (
          <p className="flex items-center gap-1 text-gray-600 mt-2">
            <MapPin size={14} /> {donation.pickup_location}
          </p>
        )}
        {donation?.description && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-3">{donation.description}</p>
        )}

        {/* Status */}
        {donation?.status && (
          <div className="mt-3">
            <Badge className={statusColor}>{String(donation.status).replace("_", " ")}</Badge>
          </div>
        )}
      </div>

      {showActions && (
        <div className="mt-4 flex flex-wrap gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(donation._id)}
              className="flex items-center gap-1 bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700"
            >
              <Edit3 size={16} /> Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(donation._id)}
              className="flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700"
            >
              <Trash2 size={16} /> Delete
            </button>
          )}
          {onAccept && (
            <button
              onClick={() => onAccept(donation._id)}
              className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700"
            >
              <HandHeart size={16} /> Accept
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DonationCard;
