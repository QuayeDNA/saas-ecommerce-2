import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button, Input, Alert } from "../design-system";
import { queueToast } from "../design-system/components/toast";
import { FaUser, FaExclamationTriangle, FaCheck, FaLock } from "react-icons/fa";
import { AuthLayout } from "../layouts/auth-layout";

export const ForgotPasswordPage = () => {
  const { authState, forgotPassword } = useAuth();
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const identifier = formData.get("identifier") as string;
    const pin = formData.get("pin") as string;

    try {
      const response = await forgotPassword(identifier, pin);
      if (response && response.resetToken) {
        queueToast("PIN verified successfully.", "success", 4500);
        navigate(`/reset-password/${response.resetToken}`);
      } else {
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error("Password reset request failed:", error);
    }
  };

  return (
    <AuthLayout
      title="Verify your account"
      subtitle="Enter your identifier and security PIN to continue"
      showLogo={true}
    >
      {isSubmitted ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="text-center py-6"
        >
          <div className="mx-auto bg-[var(--color-primary-100)] p-4 rounded-full w-20 h-20 flex items-center justify-center mb-6">
            <FaCheck className="text-[var(--color-primary-700)] text-3xl" />
          </div>
          <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">
            Verification complete
          </h3>
          <p className="text-[var(--color-muted-text)] text-[15px] mb-8 leading-relaxed">
            Your PIN was verified. You can now continue to reset your password.
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
              htmlFor="identifier"
              className="block text-sm font-semibold text-[var(--color-text)]"
            >
              Account identifier
            </label>
            <Input
              id="identifier"
              name="identifier"
              type="text"
              autoComplete="username"
              required
              placeholder="Phone, email, or agent code"
              className="w-full h-12"
              leftIcon={<FaUser className="text-[var(--color-muted-text)]" />}
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="pin"
              className="block text-sm font-semibold text-[var(--color-text)]"
            >
              Security PIN
            </label>
            <Input
              id="pin"
              name="pin"
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              required
              placeholder="Enter your PIN"
              className="w-full h-12"
              leftIcon={<FaLock className="text-[var(--color-muted-text)]" />}
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
              {authState.isLoading ? "Verifying..." : "Verify PIN"}
            </Button>
          </div>

          <div className="mt-6 pt-6 text-center text-sm text-[var(--color-muted-text)] font-medium border-t border-[var(--color-border)]">
            <Link
              to="/login"
              className="text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] font-bold hover:underline transition-all"
            >
              Back to Login
            </Link>
          </div>
        </motion.form>
      )}
    </AuthLayout>
  );
};
