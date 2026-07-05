import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext.jsx";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async ({ email, password }) => {
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name.split(" ")[0]}!`);
      navigate(`/${user.role}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 px-4 relative overflow-hidden">
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary-500/20 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card w-full max-w-md p-8 relative z-10"
      >
        <div className="flex items-center gap-2 mb-6">
          <div className="h-10 w-10 rounded-xl bg-brand-gradient flex items-center justify-center text-white font-display font-bold">C</div>
          <div>
            <p className="font-display font-bold text-lg text-neutral-900 dark:text-white leading-tight">CampusConnect AI</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Smart Complaint Management</p>
          </div>
        </div>

        <h2 className="font-display text-2xl font-bold text-neutral-900 dark:text-white mb-1">Welcome back</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">Sign in to track and manage complaints.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1 block">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="email"
                placeholder="you@university.edu"
                className="input-field pl-10"
                {...register("email", { required: "Email is required" })}
              />
            </div>
            {errors.email && <p className="text-xs text-danger mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1 block">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="input-field pl-10 pr-10"
                {...register("password", { required: "Password is required" })}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-danger mt-1">{errors.password.message}</p>}
          </div>

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-xs font-medium text-primary-600 hover:underline">
              Forgot password?
            </Link>
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-xs text-center text-neutral-500 dark:text-neutral-400 mt-6 flex items-center justify-center gap-1">
          <ShieldCheck size={14} /> Secured with JWT & role-based access
        </p>

        <p className="text-sm text-center text-neutral-600 dark:text-neutral-300 mt-4">
          New student?{" "}
          <Link to="/register" className="text-primary-600 font-semibold hover:underline">
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
