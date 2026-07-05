import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Mail } from "lucide-react";
import { authService } from "../services/authService.js";

const ForgotPassword = () => {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();

  const onSubmit = async ({ email }) => {
    try {
      const res = await authService.forgotPassword(email);
      toast.success(res.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 px-4">
      <div className="glass-card w-full max-w-md p-8">
        <h2 className="font-display text-2xl font-bold text-neutral-900 dark:text-white mb-1">Reset your password</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
          Enter your account email and we'll send a reset link.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input type="email" placeholder="you@university.edu" className="input-field pl-10" {...register("email", { required: true })} />
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
        <p className="text-sm text-center text-neutral-600 dark:text-neutral-300 mt-6">
          <Link to="/login" className="text-primary-600 font-semibold hover:underline">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
