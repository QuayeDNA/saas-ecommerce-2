import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks';
import { useState, useEffect } from 'react';
import { Button, Input, Alert, Card, CardBody } from '../design-system';
import { FaLock, FaEye, FaEyeSlash, FaCheck, FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';

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

  if (isSuccess) {
    return (
      <div className="min-h-[100dvh] flex flex-col bg-gray-50 pb-safe-area sm:bg-gray-100 sm:justify-center sm:items-center">
        <div className="flex-grow flex items-center justify-center p-4 sm:p-0">
          <div className="w-full sm:max-w-md">
            <Card variant="bottom-sheet" noPadding>
              <CardBody className="p-6 sm:p-8 text-center">
                <div className="relative mx-auto mb-6">
                  <div className="absolute inset-0 bg-green-400/20 rounded-full blur-xl transform animate-pulse"></div>
                  <div className="relative mx-auto flex items-center justify-center h-24 w-24 rounded-[24px] bg-green-50 border border-green-100 shadow-sm">
                    <FaCheck className="h-10 w-10 text-green-500" />
                  </div>
                </div>

                <h2 className="text-2xl font-extrabold text-gray-900 mb-3">Password reset successful!</h2>

                <p className="text-[15px] text-gray-600 mb-8 leading-relaxed">
                  You can now log in with your new password.
                </p>

                <div className="space-y-3">
                  <Link to="/login" className="block">
                    <Button variant="primary" size="lg" fullWidth className="h-14 rounded-2xl shadow-sm text-[16px] font-bold">
                      Go to Login
                    </Button>
                  </Link>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-gray-50 sm:bg-gray-100 sm:justify-center sm:items-center relative">
      {/* Mobile background/header area */}
      <div className="flex flex-col flex-grow items-center justify-center p-6 text-center sm:hidden bg-slate-900 text-white min-h-[35vh]">
        <div className="mx-auto p-4 rounded-full w-20 h-20 flex items-center justify-center mb-6 bg-slate-800 border border-slate-700 shadow-md">
          <FaLock className="text-3xl text-primary-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">
          Set new password
        </h1>
        <p className="text-gray-300 text-sm max-w-xs">
          Create a strong password for your account
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
              Set new password
            </h1>
            <p className="text-gray-300 text-sm">
              Create a strong password for your account
            </p>
          </div>

          <CardBody className="p-6 sm:p-8 pt-8 sm:pt-2">
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

              {passwordError && (
                <Alert
                  status="error"
                  variant="solid"
                  className="flex items-start text-sm font-semibold mb-2"
                >
                  <FaExclamationTriangle className="mt-0.5 mr-2.5 flex-shrink-0" />
                  <span>{passwordError}</span>
                </Alert>
              )}

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">New Password</label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      placeholder="••••••••"
                      className="w-full h-12 pr-12"
                      leftIcon={<FaLock className="text-gray-400" />}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center justify-center w-12 text-gray-400 hover:text-primary-600 transition-colors"
                    >
                      {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 pl-1">Min 6 chars with uppercase, lowercase, and number</p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">Confirm New Password</label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      placeholder="••••••••"
                      className="w-full h-12 pr-12"
                      leftIcon={<FaLock className="text-gray-400" />}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 flex items-center justify-center w-12 text-gray-400 hover:text-primary-600 transition-colors"
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
            </form>
          </CardBody>
        </Card>
      </div>

      {/* Mobile background spacer */}
      <div className="fixed inset-0 sm:hidden bg-slate-900 -z-10"></div>
    </div>
  );
};
