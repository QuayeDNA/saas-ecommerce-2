import { Link } from "react-router-dom";
import { useAuth } from "../hooks";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Button,
  Input,
  Alert,
} from "../design-system";
import {
  FaEnvelope,
  FaExclamationTriangle,
  FaCheck,
} from "react-icons/fa";
import { AuthLayout } from "../layouts/auth-layout";

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
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link"
      showLogo={true}
    >
      {isSubmitted ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="text-center py-6"
        >
          <div className="mx-auto bg-primary-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-6">
            <FaCheck className="text-primary-600 text-3xl" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            Check your email
          </h3>
          <p className="text-slate-500 text-[15px] mb-8 leading-relaxed">
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
        </motion.div>
      ) : (
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="space-y-6"
          onSubmit={handleSubmit}
        >
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
              className="block text-sm font-semibold text-slate-700"
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
              leftIcon={<FaEnvelope className="text-slate-400" />}
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

          <div className="mt-6 pt-6 text-center text-sm text-slate-500 font-medium border-t border-[var(--color-border)]">
            <Link
              to="/login"
              className="text-primary-600 hover:text-primary-700 font-bold hover:underline transition-all"
            >
              Back to Login
            </Link>
          </div>
        </motion.form>
      )}
    </AuthLayout>
  );
};
