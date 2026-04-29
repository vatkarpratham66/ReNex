import React, { useEffect, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Eye,
  Loader2,
  Mail,
  Phone,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import API, { getBackendAssetUrl } from "../../api/axios";
import toast from "react-hot-toast";
import Layout from "../../components/Layout";

const getStatusMeta = (status) => {
  if (status === "verified") {
    return {
      label: "Verified",
      tone: "bg-green-100 text-green-700",
    };
  }

  if (status === "rejected") {
    return {
      label: "Rejected",
      tone: "bg-red-100 text-red-700",
    };
  }

  return {
    label: "Pending",
    tone: "bg-yellow-100 text-yellow-700",
  };
};

const AdminNGOsMobile = () => {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [actionId, setActionId] = useState("");

  const loadNgos = async () => {
    try {
      setLoading(true);
      let url = "/admin/ngos";
      if (filter !== "all") {
        url += `?status=${filter}`;
      }
      const { data } = await API.get(url);
      setNgos(data || []);
    } catch (err) {
      console.error("Error loading NGOs:", err);
      toast.error("Failed to load NGOs");
    } finally {
      setLoading(false);
    }
  };

  const verifyNgo = async (id) => {
    try {
      setActionId(`verify-${id}`);
      await API.put(`/admin/ngos/${id}/verify`);
      toast.success("NGO verified successfully.");
      loadNgos();
    } catch {
      toast.error("Failed to verify NGO");
    } finally {
      setActionId("");
    }
  };

  const rejectNgo = async (id) => {
    if (!window.confirm("Are you sure you want to reject this NGO?")) {
      return;
    }

    try {
      setActionId(`reject-${id}`);
      await API.delete(`/admin/ngos/${id}/reject`);
      toast.success("NGO rejected.");
      loadNgos();
    } catch {
      toast.error("Failed to reject NGO");
    } finally {
      setActionId("");
    }
  };

  useEffect(() => {
    loadNgos();
  }, [filter]);

  const filteredNgos = ngos.filter((ngo) => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return true;
    }

    return (
      ngo.ngo_name?.toLowerCase().includes(query) ||
      ngo.registration_no?.toLowerCase().includes(query) ||
      ngo.user_id?.email?.toLowerCase().includes(query)
    );
  });

  const counts = {
    total: ngos.length,
    pending: ngos.filter((ngo) => ngo.status === "pending").length,
    verified: ngos.filter((ngo) => ngo.status === "verified" || ngo.verified).length,
  };

  return (
    <Layout>
      <div className="space-y-5">
        <div className="overflow-hidden rounded-[30px] bg-gradient-to-r from-emerald-600 via-green-500 to-lime-400 px-5 py-6 text-white shadow-lg shadow-emerald-100 sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-white/15 p-3 backdrop-blur">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight">
                  NGO Verification
                </h1>
                <p className="mt-2 max-w-xl text-sm text-emerald-50/90">
                  Review NGO registrations, inspect uploaded certificates, and
                  approve or reject requests comfortably on mobile.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:max-w-sm">
              <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur">
                <p className="text-2xl font-bold">{counts.total}</p>
                <p className="text-xs uppercase tracking-[0.16em] text-emerald-50/85">
                  Total
                </p>
              </div>
              <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur">
                <p className="text-2xl font-bold">{counts.pending}</p>
                <p className="text-xs uppercase tracking-[0.16em] text-emerald-50/85">
                  Pending
                </p>
              </div>
              <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur">
                <p className="text-2xl font-bold">{counts.verified}</p>
                <p className="text-xs uppercase tracking-[0.16em] text-emerald-50/85">
                  Verified
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-gray-100">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Filter NGOs
              </h2>
              <p className="text-sm text-gray-500">
                Search by name, registration number, or email.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full sm:min-w-[250px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search NGOs..."
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-green-400 focus:bg-white focus:ring-4 focus:ring-green-100"
                />
              </div>

              <select
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-green-400 focus:bg-white focus:ring-4 focus:ring-green-100 sm:w-48"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 rounded-[28px] bg-white p-6 text-gray-600 shadow-sm ring-1 ring-gray-100">
            <Loader2 className="h-5 w-5 animate-spin text-green-600" />
            Loading NGOs...
          </div>
        ) : filteredNgos.length === 0 ? (
          <div className="rounded-[28px] bg-white px-6 py-14 text-center text-gray-500 shadow-sm ring-1 ring-gray-100">
            No NGOs found for the current search or filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredNgos.map((ngo) => {
              const status = ngo.status || (ngo.verified ? "verified" : "pending");
              const statusMeta = getStatusMeta(status);
              const certUrl = ngo.certificateUrl
                ? getBackendAssetUrl(ngo.certificateUrl)
                : "";

              return (
                <div
                  key={ngo._id}
                  className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-gray-100 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="rounded-2xl bg-green-100 p-3 text-green-700">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                          {ngo.ngo_name || "Unnamed NGO"}
                        </h2>
                        <p className="text-sm text-gray-500">
                          Reg. No: {ngo.registration_no || "N/A"}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${statusMeta.tone}`}
                    >
                      {statusMeta.label}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
                    {ngo.user_id?.email && (
                      <p className="flex items-center gap-2 break-all">
                        <Mail className="h-4 w-4 text-gray-400" />
                        {ngo.user_id.email}
                      </p>
                    )}
                    {ngo.user_id?.phone && (
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        {ngo.user_id.phone}
                      </p>
                    )}
                  </div>

                  <div className="mt-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-gray-400">
                      Need Categories
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(ngo.needs_category || []).length > 0 ? (
                        ngo.needs_category.map((item) => (
                          <span
                            key={item}
                            className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700"
                          >
                            {item}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">
                          No categories added
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    {certUrl ? (
                      <a
                        href={certUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-2xl border border-sky-200 px-4 py-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-50"
                      >
                        <Eye className="h-4 w-4" />
                        View Certificate
                      </a>
                    ) : (
                      <p className="text-sm text-gray-500">
                        No certificate uploaded.
                      </p>
                    )}
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {status === "pending" ? (
                      <>
                        <button
                          onClick={() => verifyNgo(ngo._id)}
                          disabled={actionId === `verify-${ngo._id}`}
                          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-60"
                        >
                          {actionId === `verify-${ngo._id}` ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={16} />
                              Verify
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => rejectNgo(ngo._id)}
                          disabled={actionId === `reject-${ngo._id}`}
                          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                        >
                          {actionId === `reject-${ngo._id}` ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Rejecting...
                            </>
                          ) : (
                            <>
                              <XCircle size={16} />
                              Reject
                            </>
                          )}
                        </button>
                      </>
                    ) : (
                      <div className="sm:col-span-2">
                        <div
                          className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold ${statusMeta.tone}`}
                        >
                          {status === "verified" ? (
                            <CheckCircle2 size={16} />
                          ) : (
                            <XCircle size={16} />
                          )}
                          {statusMeta.label}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminNGOsMobile;
