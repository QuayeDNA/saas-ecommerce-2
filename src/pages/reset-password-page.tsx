import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button, Input, Alert } from '../design-system';
import { FaLock, FaEye, FaEyeSlash, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { AuthLayout } from '../layouts/auth-layout';

export const ResetPasswordPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { authState, resetPassword } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  const validatePassword = (password: string, confirmPassword: string) => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters long.';
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return 'Password must contain at least one uppercase letter, one lowercase letter, and one number.';
    }
    if (password !== confirmPassword) {
      return 'Passwords do not match.';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordError(null);

    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    const error = validatePassword(password, confirmPassword);
    if (error) {
      setPasswordError(error);
      return;
    }

    if (token) {
      try {
        await resetPassword(token, password);
        setIsSuccess(true);
      } catch (error) {
        console.error('Password reset failed:', error);
      }
    }
  };

  return (
    <AuthLayout
      title="Create new password"
      subtitle="Enter and confirm your new password"
      showLogo={true}
    >
      {isSuccess ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="text-center py-6"
        >
          <div className="mx-auto bg-primary-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-6">
            <FaCheck className="text-primary-600 text-3xl" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Password reset</h3>
          <p className="text-slate-500 text-[15px] mb-8 leading-relaxed">
            Your password has been successfully reset. You can now log in with your new password.
          </p>
          <div>
            <Link to="/login" className="block">
              <Button variant="primary" size="lg" fullWidth className="h-12 w-full font-bold text-[16px] shadow-sm rounded-xl">
                Continue to login
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
          {(authState.error || passwordError) && (
            <Alert status="error" variant="solid" className="flex items-start text-sm font-semibold mb-2">
              <FaExclamationTriangle className="mt-0.5 mr-2.5 flex-shrink-0" />
              <span>{passwordError || authState.error}</span>
            </Alert>
          )}

          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">New Password</label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  placeholder="••••••••"
                  className="w-full h-12 pr-12"
                  leftIcon={<FaLock className="text-slate-400" />}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center justify-center w-12 text-slate-400 hover:text-primary-600 transition-colors"
                >
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1 pl-1">Min 6 chars with uppercase, lowercase, and number</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Confirm New Password</label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  placeholder="••••••••"
                  className="w-full h-12 pr-12"
                  leftIcon={<FaLock className="text-slate-400" />}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center justify-center w-12 text-slate-400 hover:text-primary-600 transition-colors"
                >
                  {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              disabled={authState.isLoading}
              isLoading={authState.isLoading}
              variant="primary"
              size="lg"
              fullWidth
              className="h-12 w-full font-bold text-[16px] shadow-sm rounded-xl"
            >
              {authState.isLoading ? 'Resetting...' : 'Reset password'}
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
