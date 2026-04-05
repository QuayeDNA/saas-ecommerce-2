import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Button,
  Alert,
} from "../design-system";
import { queueToast } from "../design-system/components/toast";
import {
  FaCheck,
  FaExclamationTriangle,
  FaSpinner,
} from "react-icons/fa";
import { AuthLayout } from "../layouts/auth-layout";

export const VerifyAccountPage = () => {
  const { authState, verifyAccount } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Extract token from URL query params
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get("token");

    if (token && verificationStatus === "idle") {
      handleVerification(token);
    } else if (!token && verificationStatus === "idle") {
      setVerificationStatus("error");
      setErrorMessage("Verification token is missing. Please check your email link.");
    }
  }, [location]);

  const handleVerification = async (token: string) => {
    setVerificationStatus("loading");
    setErrorMessage(null);

    try {
      await verifyAccount(token);
      queueToast("Account verified successfully! You can now log in.", "success", 5000);
      setVerificationStatus("success");

      // Optional: Auto redirect after few seconds
      setTimeout(() => {
        navigate("/login");
      }, 5000);
    } catch (error: any) {
      setVerificationStatus("error");
      setErrorMessage(
        error.message || "Failed to verify account. The link may be expired."
      );
    }
  };

  return (
    <AuthLayout
      title="Verify your account"
      subtitle="We are confirming your email address."
      showLogo={true}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="py-4"
      >
        {verificationStatus === "loading" && (
          <div className="text-center py-6">
            <div className="mx-auto p-4 rounded-full w-20 h-20 flex items-center justify-center mb-6 bg-primary-50">
              <FaSpinner className="text-primary-600 text-4xl animate-spin" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Verifying your email
            </h3>
            <p className="text-slate-500 text-[15px] mb-4 leading-relaxed">
              Please wait while we confirm your account details...
            </p>
          </div>
        )}

        {verificationStatus === "success" && (
          <div className="text-center py-6">
            <div className="mx-auto bg-primary-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-6">
              <FaCheck className="text-primary-600 text-3xl" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Account Verified!
            </h3>
            <p className="text-slate-500 text-[15px] mb-8 leading-relaxed">
              Your email has been successfully verified. You can now access all features.
            </p>
            <div>
              <Link to="/login" className="block">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  className="h-12 w-full font-bold text-[16px] shadow-sm rounded-xl"
                >
                  Go to login
                </Button>
              </Link>
            </div>
          </div>
        )}

        {verificationStatus === "error" && (
          <div className="text-center py-6">
            <div className="mx-auto bg-primary-50 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-6">
              <FaExclamationTriangle className="text-primary-600 text-3xl" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Verification Failed
            </h3>
            <Alert
              status="error"
              variant="subtle"
              className="flex items-start text-sm font-medium mb-6 text-left"
            >
              <span>{errorMessage || authState.error}</span>
            </Alert>
            <p className="text-slate-500 text-[14px] mb-8 leading-relaxed">
              If your link has expired, you can request a new one from the
              login page.
            </p>
            <div className="space-y-3">
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
        )}
      </motion.div>
    </AuthLayout>
  );
};
