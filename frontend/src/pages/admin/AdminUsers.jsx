import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import { Loader2, Trash2, Lock, Unlock, Search } from "lucide-react";
import toast from "react-hot-toast";
import Layout from "../../components/Layout";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionKey, setActionKey] = useState(null);

  const loadUsers = async () => {
    try {
      const { data } = await API.get("/admin/users");
      setUsers(data);
    } catch (err) {
      console.error("Load users error:", err);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      setActionKey(`${id}:${action}`);
      if (action === "block") {
        await API.put(`/admin/users/${id}/block`, { blocked: true });
        toast.success("User blocked");
      } else if (action === "unblock") {
        await API.put(`/admin/users/${id}/block`, { blocked: false });
        toast.success("User unblocked");
      } else if (action === "delete") {
        if (!window.confirm("Delete this user and related records?")) {
          setActionKey(null);
          return;
        }
        await API.delete(`/admin/users/${id}`);
        toast.success("User deleted");
      }
      loadUsers();
    } catch (err) {
      console.error("Action error:", err);
      toast.error(err.response?.data?.msg || "Action failed");
    } finally {
      setActionKey(null);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-5">
        <div className="rounded-[30px] bg-gradient-to-r from-green-600 to-emerald-500 px-5 py-6 text-white sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight">Manage Users</h1>
              <p className="mt-2 text-sm text-green-50/90">
                View, block, or remove platform users from a cleaner mobile admin screen.
              </p>
            </div>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-green-200" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users..."
                className="w-full rounded-2xl border border-white/20 bg-white/15 py-3 pl-11 pr-4 text-sm text-white placeholder:text-green-100/80 outline-none backdrop-blur focus:bg-white/20"
              />
            </div>
          </div>
        </div>

        <div className="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">User Directory</h2>
            <p className="text-gray-500 text-sm">
              Search across name, email, and role.
            </p>
          </div>
          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
            {filteredUsers.length} results
          </span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin w-10 h-10 text-green-600" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="rounded-[28px] bg-white py-20 text-center text-gray-500 shadow-sm ring-1 ring-gray-100">
            No users found.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredUsers.map((user) => (
              <div
                key={user._id}
                className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold text-lg">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-800">{user.name}</h2>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                      user.role === "admin"
                        ? "bg-purple-100 text-purple-700"
                        : user.role === "ngo"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {user.role}
                  </span>

                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      user.blocked
                        ? "bg-red-100 text-red-700 border border-red-200"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {user.blocked ? "Blocked" : "Active"}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {user.blocked ? (
                    <button
                      onClick={() => handleAction(user._id, "unblock")}
                      disabled={Boolean(actionKey)}
                      className="flex min-h-11 items-center justify-center gap-1 rounded-2xl bg-green-50 px-3 py-2 text-green-600 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {actionKey === `${user._id}:unblock` ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Unlock size={16} />
                      )}
                      {actionKey === `${user._id}:unblock` ? "Unblocking..." : "Unblock"}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAction(user._id, "block")}
                      disabled={Boolean(actionKey)}
                      className="flex min-h-11 items-center justify-center gap-1 rounded-2xl bg-red-50 px-3 py-2 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {actionKey === `${user._id}:block` ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Lock size={16} />
                      )}
                      {actionKey === `${user._id}:block` ? "Blocking..." : "Block"}
                    </button>
                  )}

                  <button
                    onClick={() => handleAction(user._id, "delete")}
                    disabled={Boolean(actionKey)}
                    className="flex min-h-11 items-center justify-center gap-1 rounded-2xl bg-gray-50 px-3 py-2 text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {actionKey === `${user._id}:delete` ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                    {actionKey === `${user._id}:delete` ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminUsers;
