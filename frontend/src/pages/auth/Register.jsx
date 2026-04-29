import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation, Link } from "react-router-dom";
import API from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { Loader2 } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";

const Register = () => {
  const { login } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const defaultRole = params.get("role") || "donor";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { role: defaultRole } });

  const selectedRole = watch("role");

  useEffect(() => {
    setValue("role", defaultRole);
  }, [defaultRole, setValue]);

  const onSubmit = async (values) => {
    try {
      const { data } = await API.post("/auth/register", values);
      login({ token: data.token, user: data.user });
      if (data.user.role === "admin") nav("/admin/dashboard");
      else if (["donor", "ngo"].includes(data.user.role)) nav("/dashboard");
      else nav("/home");
    } catch (err) {
      toast.error(err?.response?.data?.msg || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-100 px-4 py-8 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[32px] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)] lg:grid-cols-[0.95fr_1.05fr]">
          <div className="hidden bg-gradient-to-br from-emerald-600 via-green-500 to-lime-400 p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-green-50/80">
                Join Needo
              </p>
              <h1 className="mt-4 text-4xl font-black tracking-tight">
                Start helping in a few simple steps.
              </h1>
              <p className="mt-4 max-w-md text-sm text-green-50/90">
                Create your donor or NGO account and begin sharing, accepting, and managing donations from your phone.
              </p>
            </div>
            <div className="rounded-3xl bg-white/15 p-5 backdrop-blur">
              <p className="text-lg font-semibold">Choose your role first</p>
              <p className="mt-2 text-sm text-green-50/85">
                Donors share items. NGOs discover and coordinate pickups. Admin stays protected for internal use.
              </p>
            </div>
          </div>

          <div className="p-5 sm:p-8 lg:p-10">
            <div className="mx-auto w-full max-w-md">
              <div className="mb-8">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-green-600">
                  Create account
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-gray-900">
                  Register
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  Set up your account and start using Needo on mobile or desktop.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    {...register("name", { required: "Name is required" })}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-green-400 focus:bg-white focus:ring-4 focus:ring-green-100"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    {...register("email", { required: "Email is required" })}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-green-400 focus:bg-white focus:ring-4 focus:ring-green-100"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    {...register("password", { required: "Password is required" })}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-green-400 focus:bg-white focus:ring-4 focus:ring-green-100"
                  />
                  {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Role</label>
                  <select
                    {...register("role", { required: true })}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-green-400 focus:bg-white focus:ring-4 focus:ring-green-100"
                  >
                    <option value="donor">Donor</option>
                    <option value="ngo">NGO</option>
                    <option value="admin">Admin</option>
                  </select>
                  {errors.role && <p className="mt-1 text-sm text-red-500">Please select a role</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-700 disabled:opacity-60"
                >
                  {isSubmitting && <Loader2 className="h-5 w-5 animate-spin" />}
                  Register
                </button>
              </form>

              <div className="my-6 flex items-center">
                <hr className="flex-grow border-gray-200" />
                <span className="mx-3 text-xs font-medium uppercase tracking-[0.18em] text-gray-400">
                  Or continue
                </span>
                <hr className="flex-grow border-gray-200" />
              </div>

              <div className="overflow-hidden rounded-2xl border border-gray-200 p-1">
                <GoogleLogin
                  onSuccess={async (credentialResponse) => {
                    try {
                      if (!selectedRole) {
                        toast.error("Please select a role before Google signup.");
                        return;
                      }
                      const tokenId = credentialResponse.credential;
                      const { data } = await API.post("/auth/google", { tokenId, role: selectedRole });
                      login({ token: data.token, user: data.user });
                      if (data.user.role === "admin") nav("/admin/dashboard");
                      else if (["donor", "ngo"].includes(data.user.role)) nav("/dashboard");
                      else nav("/home");
                    } catch (err) {
                      toast.error(err?.response?.data?.msg || err.message || "Google signup failed");
                    }
                  }}
                  onError={() => toast.error("Google signup failed")}
                />
              </div>

              <p className="mt-6 text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-green-600 hover:underline">
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
