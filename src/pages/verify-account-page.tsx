// src/pages/verify-account-page.tsx

/**
 * Account Verification Page
 *
 * Features:
 * - Handles token-based email verification
 * - Automatic token extraction from URL
 * - Visual feedback states (loading, success, error)
 * - Consistent with auth design system
 */

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks";
import { useState, useEffect } from "react";
import {
  Button,
  Alert,
  Card,
  CardBody,
} from "../design-system";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaArrowLeft,
} from "react-icons/fa";

export const VerifyAccountPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");

  const { verifyAccount } = useAuth();

  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [userType, setUserType] = useState<string>("");
  const [verificationError, setVerificationError] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (!token) {
      setVerificationError(
        "Invalid verification link. Please check your email for the correct link."
      );
      setIsVerifying(false);
      return;
    }

    const performVerification = async () => {
      try {
        const result = await verifyAccount(token);
        setUserType(result.userType);
        setIsSuccess(true);
      } catch (error) {
        setVerificationError(
          error instanceof Error
            ? error.message
            : "Verification failed. Please try again."
        );
      } finally {
        setIsVerifying(false);
      }
    };

    performVerification();
  }, [token, verifyAccount]);

  // Redirect to appropriate dashboard based on user type
  const handleContinue = () => {
    navigate(userType === "super_admin" ? "/superadmin" : "/agent/dashboard");
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-gray-50 sm:bg-gray-100 sm:justify-center sm:items-center relative">
      {/* Mobile background/header area */}
      <div className="flex flex-col flex-grow items-center justify-center p-6 text-center sm:hidden bg-slate-900 text-white min-h-[35vh]">
        <div className="mx-auto p-4 rounded-full w-20 h-20 flex items-center justify-center mb-6 bg-slate-800 border border-slate-700 shadow-md">
          {isVerifying && <FaSpinner className="text-3xl text-blue-400 animate-spin" />}
          {isSuccess && <FaCheckCircle className="text-3xl text-green-400" />}
          {!isVerifying && !isSuccess && <FaExclamationTriangle className="text-3xl text-red-500" />}
        </div>
        <h1 className="text-2xl font-bold mb-2">
          {isVerifying ? "Verifying Account" : isSuccess ? "Account Verified!" : "Verification Failed"}
        </h1>
        <p className="text-gray-300 text-sm max-w-xs">
          {isVerifying && "Please wait while we verify your account..."}
          {isSuccess && "Your email has been successfully verified."}
          {!isVerifying && !isSuccess && "We couldn't verify your account."}
        </p>
      </div>

      {/* Main container mimicking a bottom sheet on mobile, standard card on desktop */}
      <div className="w-full sm:max-w-md mt-auto sm:mt-0 z-10 transition-transform">
        <Card variant="bottom-sheet" noPadding>

          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
            <Link
              to="/home"
              className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 sm:bg-gray-50 hover:bg-gray-200 transition-colors text-gray-600 sm:text-gray-500"
            >
              <FaArrowLeft />
            </Link>
          </div>

          {/* Desktop-only header */}
          <div className="hidden sm:block text-center pt-12 pb-4 bg-slate-900 w-full mb-6">
            <div className="mx-auto p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4 bg-slate-800">
              {isVerifying && <FaSpinner className="text-2xl text-blue-400 animate-spin" />}
              {isSuccess && <FaCheckCircle className="text-2xl text-green-400" />}
              {!isVerifying && !isSuccess && <FaExclamationTriangle className="text-2xl text-red-500" />}
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {isVerifying ? "Verifying Account" : isSuccess ? "Account Verified!" : "Verification Failed"}
            </h1>
            <p className="text-gray-300 text-sm">
              {isVerifying && "Please wait while we verify your account..."}
              {isSuccess && "Your email has been successfully verified."}
              {!isVerifying && !isSuccess && "We couldn't verify your account."}
            </p>
          </div>

          <CardBody className="p-6 sm:p-8 pt-8 sm:pt-2">
            {isVerifying && (
              <div className="flex justify-center py-6">
                <div className="w-full max-w-sm">
                  <div className="animate-pulse space-y-4">
                    <div className="h-2.5 bg-gray-200 rounded w-full"></div>
                    <div className="h-2.5 bg-gray-200 rounded w-5/6 mx-auto"></div>
                    <div className="h-2.5 bg-gray-200 rounded w-4/6 mx-auto"></div>
                  </div>
                </div>
              </div>
            )}

            {isSuccess && (
              <div className="space-y-6 animate-fade-in">
                <Alert status="success" variant="solid" className="flex items-start text-sm font-semibold">
                  <FaCheckCircle className="mt-0.5 mr-2.5 flex-shrink-0" />
                  <span>Your account has been successfully verified. You can now access all features.</span>
                </Alert>

                <div className="space-y-3 pt-2">
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleContinue}
                    className="h-12 font-bold text-[16px] shadow-sm rounded-xl"
                  >
                    Continue to Dashboard
                  </Button>

                  <Link to="/login" className="block">
                    <Button variant="outline" size="lg" fullWidth className="h-12 font-bold text-[16px] rounded-xl border-gray-300 text-gray-700">
                      Back to Login
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {!isVerifying && !isSuccess && (
              <div className="space-y-6">
                <Alert status="error" variant="solid" className="flex items-start text-sm font-semibold">
                  <FaExclamationTriangle className="mt-0.5 mr-2.5 flex-shrink-0" />
                  <span>{verificationError || "An error occurred during verification."}</span>
                </Alert>

                <div className="space-y-3 pt-2">
                  <Link to="/login" className="block">
                    <Button variant="primary" size="lg" fullWidth className="h-12 font-bold text-[16px] shadow-sm rounded-xl">
                      Go to Login
                    </Button>
                  </Link>

                  <Link to="/" className="block">
                    <Button variant="outline" size="lg" fullWidth className="h-12 font-bold text-[16px] rounded-xl border-gray-300 text-gray-700">
                      Back to Home
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Mobile background spacer */}
      <div className="fixed inset-0 sm:hidden bg-slate-900 -z-10"></div>
    </div>
  );
};
