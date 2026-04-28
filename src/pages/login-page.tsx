// src/pages/login-page.tsx

/**
 * Modern Login Page with Enhanced UX
 *
 * Features:
 * - Mobile-first responsive design with modern aesthetics
 * - Clear visual hierarchy and user-friendly layout
 * - Comprehensive loading states and error handling
 * - Enhanced accessibility and form validation
 * - Password visibility toggle with smooth animations
 * - Remember me functionality with clear messaging
 * - Seamless navigation and user flow
 * - Consistent design system integration
 */

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaEye,
  FaEyeSlash,
  FaSpinner,
  FaWhatsapp,
  FaUsers,
} from "react-icons/fa";
import {
  Button,
  Input,
  Alert,
} from "../design-system";
import { useAuth } from "../hooks";
import { AuthLayout } from "../layouts/auth-layout";

export const LoginPage = () => {
  const { authState, login, clearErrors } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (authState.isAuthenticated && authState.dashboardUrl && !isSubmitting) {
      navigate(authState.dashboardUrl, { replace: true });
    }
  }, [authState, navigate, isSubmitting]);

  // Set page title
  useEffect(() => {
    document.title = "Caskmaf Datahub - Login";
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);
    clearErrors();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const rememberMe = formData.get("remember_me") === "on";

    try {
      await login(email, password, rememberMe);
    } catch (error) {
      let message = "Login failed";
      if (error instanceof Error) {
        if (error.message.includes("pending approval")) {
          message =
            "Your account is pending approval by a super admin. You will be notified by email once approved.";
        } else if (error.message.includes("rejected")) {
          message =
            "Your account has been rejected. Please contact support for more information.";
        } else if (error.message.includes("Too many login attempts")) {
          message = error.message; // Use the specific rate limiting message
        } else if (
          error.message.includes("429") ||
          error.message.includes("Too Many Requests")
        ) {
          message =
            "Too many login attempts. Please wait a few minutes before trying again.";
        } else {
          message = error.message;
        }
      }
      setLocalError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign into your account to manage your sales, view stats & orders."
      footerText="Don't have an account?"
      footerLinkText="Sign up for free"
      footerLinkTo="/register"
    >
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="space-y-5"
        onSubmit={handleSubmit}
      >
        {/* Error Alert */}
        {(localError || authState.error) && (
          <Alert
            status="error"
            variant="solid"
            className="flex items-start text-sm rounded-xl"
          >
            <div>
              <div className="font-bold">
                {(localError ?? authState.error)?.includes("Too many")
                  ? "Rate Limited"
                  : "Login Failed"}
              </div>
              <div className="mt-0.5 opacity-90 font-medium">
                {localError ?? authState.error}
              </div>
            </div>
          </Alert>
        )}

        {/* Email Field */}
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-[15px] font-bold text-[var(--color-text)]"
          >
            Email address
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="name@company.com"
            className="w-full h-14 rounded-xl text-[16px] px-4"
            disabled={isSubmitting || authState.isLoading}
          />
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-[15px] font-bold text-[var(--color-text)]"
          >
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              placeholder="Enter your password"
              className="w-full pr-12 h-12"
              disabled={isSubmitting || authState.isLoading}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center justify-center w-12 text-[var(--color-muted-text)] hover:text-[var(--color-primary-600)] transition-colors"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isSubmitting || authState.isLoading}
            >
              {showPassword ? (
                <FaEyeSlash size={18} />
              ) : (
                <FaEye size={18} />
              )}
            </button>
          </div>
        </div>

        {/* Remember me and Forgot password */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center cursor-pointer select-none">
            <input
              id="remember_me"
              name="remember_me"
              type="checkbox"
              className="h-5 w-5 text-[var(--color-primary-600)] focus:ring-[var(--color-primary-500)] border-[var(--color-primary-200)] rounded cursor-pointer"
              disabled={isSubmitting || authState.isLoading}
            />
            <span className="ml-2.5 block text-sm text-[var(--color-muted-text)] font-medium">
              Remember me
            </span>
          </label>

          <Link
            to="/forgot-password"
            className="text-sm font-bold text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            className="h-12 w-full font-bold text-[16px] shadow-sm rounded-xl"
            disabled={isSubmitting || authState.isLoading}
            leftIcon={
              isSubmitting || authState.isLoading ? (
                <FaSpinner className="animate-spin" />
              ) : undefined
            }
          >
            {isSubmitting || authState.isLoading
              ? "Signing in..."
              : "Sign in"}
          </Button>
        </div>

        {/* Additional Help */}
        <div className="text-center pt-5 mt-2 border-t border-[var(--color-border)]">
          <p className="text-xs text-[var(--color-muted-text)] mb-3 font-medium">
            Need help? Contact support or join our WhatsApp community.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <a
              href="https://wa.me/233542405901?text=Hello%20support%2C%20I%20need%20help%20with%20my%20account"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-whatsapp)] px-4 py-3 text-sm font-semibold text-[var(--color-whatsapp-text)] shadow-sm transition hover:bg-[var(--color-whatsapp-dark)]"
            >
              <FaWhatsapp className="w-5 h-5 text-[var(--color-whatsapp-text)]" />
              <span className="text-left">
                Contact support
              </span>
            </a>
            <a
              href="https://chat.whatsapp.com/CO5w8bisGsJ3yTA7EkXBBX"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--color-whatsapp-dark)] bg-[var(--color-whatsapp-muted)] px-4 py-3 text-sm font-semibold text-[var(--color-whatsapp-dark)] transition hover:bg-[var(--color-whatsapp)] hover:text-[var(--color-whatsapp-text)]"
            >
              <FaUsers className="w-5 h-5 text-[var(--color-whatsapp-dark)]" />
              Join WhatsApp community
            </a>
          </div>
        </div>
      </motion.form>
    </AuthLayout>
  );
};
