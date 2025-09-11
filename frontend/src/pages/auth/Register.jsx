// src/pages/auth/Register.jsx
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation, Link } from "react-router-dom";
import API from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { Loader2 } from "lucide-react";

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
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { role: defaultRole } });

  useEffect(() => {
    setValue("role", defaultRole);
  }, [defaultRole, setValue]);

  const onSubmit = async (values) => {
    try {
      const { data } = await API.post("/auth/register", values);
      login({ token: data.token, user: data.user });
      nav("/dashboard");
    } catch (err) {
      alert(err?.response?.data?.msg || "❌ Registration failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-100 to-blue-100">
      <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-center text-green-600 mb-6">Create Account</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              {...register("name", { required: "Name is required" })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              {...register("email", { required: "Email is required" })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              {...register("password", { required: "Password is required" })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              {...register("role", { required: true })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
            >
              <option value="donor">Donor</option>
              <option value="ngo">NGO</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* NGO extra fields (optional display logic can be added) */}
          {/* <div>...</div> */}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
          >
            {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
            Register
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-green-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
