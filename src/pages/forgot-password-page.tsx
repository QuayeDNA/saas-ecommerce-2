// src/pages/forgot-password-page.tsx

/**
 * Forgot Password Page
 *
 * Features:
 * - Email input with validation
 * - Clear success/error states
 * - Animated transitions
 * - Mobile-first responsive design
 * - Consistent with auth design system
 */

import { Link } from "react-router-dom";
import { useAuth } from "../hooks";
import { useState } from "react";
import {
  Button,
  Input,
  Alert,
  Card,
  CardBody,
} from "../design-system";
import {
  FaEnvelope,
  FaArrowLeft,
  FaExclamationTriangle,
  FaLock,
  FaCheck,
} from "react-icons/fa";

export const ForgotPasswordPage = () => {
  const { authState, forgotPassword } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    try {
      await forgotPassword(email);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Password reset request failed:", error);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-gray-50 sm:bg-gray-100 sm:justify-center sm:items-center relative">
      {/* Mobile background/header area */}
      <div className="flex flex-col flex-grow items-center justify-center p-6 text-center sm:hidden bg-slate-900 text-white min-h-[35vh]">
        <div className="mx-auto p-4 rounded-full w-20 h-20 flex items-center justify-center mb-6 bg-slate-800 border border-slate-700 shadow-md">
          <FaLock className="text-3xl text-primary-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">
          Reset password
        </h1>
        <p className="text-gray-300 text-sm max-w-xs">
          Enter your email and we'll send you a reset link
        </p>
      </div>

      {/* Main form container mimicking a bottom sheet on mobile, standard card on desktop */}
      <div className="w-full sm:max-w-md mt-auto sm:mt-0 z-10 transition-transform">
        <Card variant="bottom-sheet" noPadding>

          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
            <Link
              to="/login"
              className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 sm:bg-gray-50 hover:bg-gray-200 transition-colors text-gray-600 sm:text-gray-500"
            >
              <FaArrowLeft />
            </Link>
          </div>

          {/* Desktop-only header */}
          <div className="hidden sm:block text-center pt-12 pb-4 bg-slate-900 w-full mb-6">
            <div className="mx-auto p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4 bg-slate-800">
              <FaLock className="text-2xl text-primary-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Reset your password
            </h1>
            <p className="text-gray-300 text-sm">
              Enter your email and we'll send you a reset link
            </p>
          </div>

          <CardBody className="p-6 sm:p-8 pt-8 sm:pt-2">
            {isSubmitted ? (
              <div className="text-center py-6">
                <div className="mx-auto bg-green-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-6">
                  <FaCheck className="text-green-600 text-3xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Check your email
                </h3>
                <p className="text-gray-500 text-[15px] mb-8 leading-relaxed">
                  We've sent a password reset link to your email address.
                </p>
                <div>
                  <Link to="/login" className="block">
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      className="h-12 w-full font-bold text-[16px] shadow-sm rounded-xl"
                    >
                      Back to login
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                {authState.error && (
                  <Alert
                    status="error"
                    variant="solid"
                    className="flex items-start text-sm font-semibold mb-2"
                  >
                    <FaExclamationTriangle className="mt-0.5 mr-2.5 flex-shrink-0" />
                    <span>{authState.error}</span>
                  </Alert>
                )}

                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Email address
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="Enter your email"
                    className="w-full h-12"
                    leftIcon={<FaEnvelope className="text-gray-400" />}
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={authState.isLoading}
                    isLoading={authState.isLoading}
                    variant="primary"
                    size="lg"
                    fullWidth
                    className="h-12 w-full font-bold text-[16px] shadow-sm rounded-xl"
                  >
                    {authState.isLoading ? "Sending..." : "Send reset link"}
                  </Button>
                </div>

                <div className="mt-6 pt-6 text-center text-sm text-gray-500 font-medium border-t border-gray-100">
                  <Link
                    to="/"
                    className="text-primary-600 hover:text-primary-700 font-bold hover:underline transition-all"
                  >
                    Back to Home
                  </Link>
                </div>
              </form>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Mobile background spacer */}
      <div className="fixed inset-0 sm:hidden bg-slate-900 -z-10"></div>
    </div>
  );
};
