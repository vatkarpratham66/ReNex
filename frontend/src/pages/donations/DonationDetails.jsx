import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const DonationDetails = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await API.get("/donations/my/details");
        setData(data);
      } catch {
        toast.error("Failed to load details");
      }
    };
    load();
  }, []);

  if (!data) {
    return <p className="flex items-center gap-2"><Loader2 className="animate-spin" /> Loading...</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-sky-600 mb-4">📊 Donation Details</h1>
      <div className="space-y-6">
        {data.donations.map((d) => (
          <div key={d._id} className="bg-white rounded-xl p-4 shadow">
            <h3 className="font-bold">{d.title}</h3>
            <p>Status: {d.status}</p>
          </div>
        ))}

        <h2 className="text-xl font-semibold mt-6">Accepted by NGOs</h2>
        {data.accepts.map((a) => (
          <div key={a._id} className="bg-gray-50 rounded-xl p-3 shadow">
            <p>NGO: {a.ngo_id.ngo_name} ({a.ngo_id.registration_no})</p>
            <p>Status: {a.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonationDetails;
