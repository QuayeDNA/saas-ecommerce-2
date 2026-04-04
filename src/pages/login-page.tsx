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
import {
  FaEye,
  FaEyeSlash,
  FaExclamationTriangle,
  FaSpinner,
} from "react-icons/fa";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Input,
  Alert,
} from "../design-system";
import { useAuth } from "../hooks";
import { DirectDataLogo } from "../components/common/DirectDataLogo";

export const LoginPage = () => {
  const { authState, login, clearErrors } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (authState.isAuthenticated && authState.dashboardUrl) {
      navigate(authState.dashboardUrl);
    }
  }, [authState, navigate]);

  // Set page title
  useEffect(() => {
    document.title = "BryteLinks - Login";
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
    <div className="min-h-[100dvh] flex flex-col relative bg-slate-900 sm:bg-gray-100 sm:justify-center sm:items-center">
      {/* Mobile background/header area */}
      <div className="flex flex-col flex-grow items-center justify-center p-6 text-center sm:hidden text-white min-h-[35vh]">
        <div className="flex justify-center items-center mb-6">
          <DirectDataLogo width={100} height={120} />
        </div>
        <h1 className="text-2xl font-bold mb-2">
          Welcome back
        </h1>
        <p className="text-gray-300 text-sm max-w-xs">
          Sign into your account to manage your sales, view stats & orders.
        </p>
      </div>

      {/* Main form container mimicking a bottom sheet on mobile, standard card on desktop */}
      <div className="w-full sm:max-w-md mt-auto sm:mt-0 z-10 transition-transform duration-300 transform translate-y-0">
        <Card variant="bottom-sheet" noPadding>

          {/* Desktop-only header */}
          <CardHeader className="hidden sm:block text-center pt-8 pb-6 bg-slate-900 w-full border-b-0 rounded-t-[24px]">
            <div className="flex justify-center items-center mb-4">
              <DirectDataLogo width={80} height={100} />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Welcome back
            </h1>
            <p className="text-gray-300 text-sm">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-blue-400 hover:text-blue-300 transition-colors"
              >
                Sign up
              </Link>
            </p>
          </CardHeader>

          <CardBody className="p-6 sm:p-8 pt-8 sm:pt-6">
            <div className="sm:hidden mb-6 text-center">
              <p className="text-gray-600 text-[15px]">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-bold text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Sign up for free
                </Link>
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Error Alert */}
              {(localError || authState.error) && (
                <Alert
                  status="error"
                  variant="solid"
                  className="flex items-start text-sm rounded-xl"
                >
                  <FaExclamationTriangle className="mt-0.5 mr-2.5 flex-shrink-0" />
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
                  className="block text-[15px] font-bold text-gray-700"
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
                  className="block text-[15px] font-bold text-gray-700"
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
                    className="absolute inset-y-0 right-0 flex items-center justify-center w-12 text-gray-400 hover:text-primary-600 transition-colors"
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
                    className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
                    disabled={isSubmitting || authState.isLoading}
                  />
                  <span className="ml-2.5 block text-sm text-gray-700 font-medium">
                    Remember me
                  </span>
                </label>

                <Link
                  to="/forgot-password"
                  className="text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors"
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
              <div className="text-center pt-5 mt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-3 font-medium">
                  Need help? Contact our support team
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-sm">
                  <a
                    href="https://wa.me/+233548983019"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-green-600 hover:text-green-700 font-semibold px-3 py-1.5 rounded-full bg-green-50 transition-colors"
                  >
                    📞 +233 54 898 3019
                  </a>
                </div>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>

      {/* Background shape decors (desktop only) */}
      <div className="hidden sm:block absolute top-[10%] left-[10%] w-[30%] h-[30%] bg-primary-100 rounded-full mix-blend-multiply blur-[100px] opacity-60 -z-10"></div>
      <div className="hidden sm:block absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-blue-100 rounded-full mix-blend-multiply blur-[100px] opacity-60 -z-10"></div>
    </div>
  );
};
