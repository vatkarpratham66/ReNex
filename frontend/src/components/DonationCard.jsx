import React from "react";
import {
  MapPin,
  Edit3,
  Trash2,
  HandHeart,
  MessageCircle,
} from "lucide-react";

const Badge = ({ children, className = "" }) => (
  <span className={`inline-block rounded-full px-3 py-1 text-xs ${className}`}>
    {children}
  </span>
);

const DonationCard = ({
  donation,
  onEdit,
  onDelete,
  onAccept,
  showActions,
}) => {
  const statusColor =
    donation?.status === "available"
      ? "bg-green-100 text-green-700"
      : donation?.status === "claimed"
      ? "bg-yellow-100 text-yellow-700"
      : donation?.status === "completed"
      ? "bg-blue-100 text-blue-700"
      : donation?.status === "delivered"
      ? "bg-blue-100 text-blue-700"
      : "bg-gray-100 text-gray-600";

  const whatsappLink = donation?.donor?.user_phone
    ? `https://wa.me/${donation.donor.user_phone}?text=Hello%20I%20am%20interested%20in%20your%20donation%20(${encodeURIComponent(
        donation.title
      )})`
    : null;

  return (
    <div className="flex h-full flex-col justify-between rounded-[26px] bg-white p-5 shadow-sm ring-1 ring-gray-100 transition hover:-translate-y-0.5 hover:shadow-lg">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {donation?.title}
            </h3>
            <p className="text-sm text-gray-500">{donation?.category}</p>
          </div>
          {donation?.status && (
            <Badge className={statusColor}>
              {String(donation.status).replace("_", " ")}
            </Badge>
          )}
        </div>

        {donation?.pickup_location && (
          <p className="mt-3 flex items-start gap-1 text-sm text-gray-600">
            <MapPin size={14} /> {donation.pickup_location}
          </p>
        )}

        {donation?.description && (
          <p className="mt-3 line-clamp-3 text-sm text-gray-600">
            {donation.description}
          </p>
        )}
      </div>

      {showActions && (
        <div className="mt-5 flex flex-wrap gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(donation._id)}
              className="flex min-h-11 items-center gap-1 rounded-xl bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              <Edit3 size={16} /> Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(donation._id)}
              className="flex min-h-11 items-center gap-1 rounded-xl bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              <Trash2 size={16} /> Delete
            </button>
          )}
          {onAccept && (
            <button
              onClick={() => onAccept(donation._id)}
              className="flex min-h-11 items-center gap-1 rounded-xl bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              <HandHeart size={16} /> Accept
            </button>
          )}

          {whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-11 items-center gap-1 rounded-xl bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600"
            >
              <MessageCircle size={16} /> Message Donor
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default DonationCard;
