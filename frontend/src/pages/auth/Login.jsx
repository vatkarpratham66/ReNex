import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import API from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { Loader2 } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";

const Login = () => {
  const { login, user } = useAuth();
  const nav = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    if (user?.role === "admin") nav("/admin/dashboard");
    else if (["donor", "ngo"].includes(user?.role)) nav("/dashboard");
    else if (user) nav("/home");
  }, [user, nav]);

  const onSubmit = async (values) => {
    try {
      const { data } = await API.post("/auth/login", values);
      if (!data.user?.role) throw new Error("User role missing");
      login({ token: data.token, user: data.user });

      if (data.user.role === "admin") nav("/admin/dashboard");
      else if (["donor", "ngo"].includes(data.user.role)) nav("/dashboard");
      else nav("/home");
    } catch (err) {
      toast.error(err?.response?.data?.msg || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-white to-emerald-50 px-4 py-8 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[32px] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)] lg:grid-cols-[1.05fr_0.95fr]">
          <div className="hidden bg-gradient-to-br from-green-700 via-emerald-600 to-lime-500 p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-green-50/80">
                Needo Access
              </p>
              <h1 className="mt-4 text-4xl font-black tracking-tight">
                Welcome back to your donation network.
              </h1>
              <p className="mt-4 max-w-md text-sm text-green-50/90">
                Log in to manage donations, respond faster, and stay connected with your community.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
                <p className="text-2xl font-bold">Fast</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-green-50/80">
                  Mobile first
                </p>
              </div>
              <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
                <p className="text-2xl font-bold">Safe</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-green-50/80">
                  Verified access
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-8 lg:p-10">
            <div className="mx-auto w-full max-w-md">
              <div className="mb-8">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-green-600">
                  Sign in
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-gray-900">
                  Welcome Back
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  Continue where you left off and manage donations from anywhere.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    {...register("email", { required: "Email is required" })}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-green-400 focus:bg-white focus:ring-4 focus:ring-green-100"
                    placeholder="you@example.com"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    {...register("password", { required: "Password is required" })}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-green-400 focus:bg-white focus:ring-4 focus:ring-green-100"
                    placeholder="Enter your password"
                  />
                  {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-700 disabled:opacity-60"
                >
                  {isSubmitting && <Loader2 className="h-5 w-5 animate-spin" />}
                  Login
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
                      const tokenId = credentialResponse.credential;
                      const { data } = await API.post("/auth/google", { tokenId });
                      login({ token: data.token, user: data.user });
                      if (data.user.role === "admin") nav("/admin/dashboard");
                      else if (["donor", "ngo"].includes(data.user.role)) nav("/dashboard");
                      else nav("/home");
                    } catch (err) {
                      toast.error(err?.response?.data?.msg || err.message || "Google login failed");
                    }
                  }}
                  onError={() => toast.error("Google login failed")}
                />
              </div>

              <p className="mt-6 text-center text-sm text-gray-600">
                Don&apos;t have an account?{" "}
                <Link to="/register" className="font-semibold text-green-600 hover:underline">
                  Register
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
