import React from 'react';
// src/pages/register-page.tsx

/**
 * Enhanced Multi-Step Agent Registration Page
 *
 * Features:
 * - Smooth multi-step flow with animations
 * - Mobile-first responsive design
 * - Real-time validation with visual feedback
 * - Password strength indicator
 * - Improved progress visualization
 * - Better error handling and states
 * - Enhanced UX with micro-interactions
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
  FaArrowRight,
  FaPhoneAlt,
  FaExclamationTriangle,
  FaSpinner,
  FaStore,
  FaBuilding,
  FaEnvelope,
  FaLock,
  FaCheckCircle,
  FaCheck,
  FaClock,
} from "react-icons/fa";
import {
  Button,
  Input,
  Alert,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter
} from "../design-system";
import { useAuth } from "../hooks";
import { useSiteStatus } from "../contexts/site-status-context";
import { useToast } from "../design-system/components/toast";
import type { RegisterAgentData } from "../services/auth.service";
import { AuthLayout } from "../layouts/auth-layout";

interface FormData {
  fullName: string;
  email: string;
  businessName: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface PasswordValidation {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  match: boolean;
}

interface FieldErrors {
  fullName?: string;
  email?: string;
  businessName?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

export const RegisterPage = () => {
  const { registerAgent } = useAuth();
  const { signupApprovalRequired, isLoading: siteStatusLoading } =
    useSiteStatus();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [showPasswords, setShowPasswords] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    businessName: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [passwordValidation, setPasswordValidation] =
    useState<PasswordValidation>({
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      match: false,
    });

  const totalSteps = 3;

  // Validate individual fields
  const validateField = (
    field: keyof FormData,
    value: string
  ): string | undefined => {
    switch (field) {
      case "fullName":
        if (!value.trim()) return "Full name is required";
        if (value.trim().length < 2)
          return "Name must be at least 2 characters";
        return undefined;

      case "email":
        if (!value.trim()) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return "Invalid email format";
        return undefined;

      case "businessName":
        if (!value.trim()) return "Business name is required";
        if (value.trim().length < 2)
          return "Business name must be at least 2 characters";
        return undefined;

      case "phone":
        if (!value.trim()) return "Phone number is required";
        if (!/^[\d\s\-+()]{10,}$/.test(value)) return "Invalid phone number";
        return undefined;

      case "password":
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        return undefined;

      case "confirmPassword":
        if (!value) return "Please confirm your password";
        if (value !== formData.password) return "Passwords do not match";
        return undefined;

      default:
        return undefined;
    }
  };

  // Password validation with real-time feedback
  const validatePassword = (password: string, confirmPassword: string) => {
    setPasswordValidation({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      match: password === confirmPassword && password.length > 0,
    });
  };

  // Handle field blur for validation
  const handleFieldBlur = (field: keyof FormData) => {
    setTouchedFields((prev) => new Set(prev).add(field));
    const error = validateField(field, formData[field]);
    setFieldErrors((prev) => ({ ...prev, [field]: error }));
  };

  // Handle form data changes
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setLocalError(null);

    // Clear field error when user starts typing
    if (touchedFields.has(field)) {
      const error = validateField(field, value);
      setFieldErrors((prev) => ({ ...prev, [field]: error }));
    }

    // Validate password when password fields change
    if (field === "password" || field === "confirmPassword") {
      validatePassword(
        field === "password" ? value : formData.password,
        field === "confirmPassword" ? value : formData.confirmPassword
      );
    }
  };

  // Validate current step
  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        return (
          !fieldErrors.fullName &&
          !fieldErrors.email &&
          formData.fullName.trim() !== "" &&
          formData.email.trim() !== ""
        );
      case 2:
        return (
          !fieldErrors.businessName &&
          !fieldErrors.phone &&
          formData.businessName.trim() !== "" &&
          formData.phone.trim() !== ""
        );
      case 3:
        return Object.values(passwordValidation).every(Boolean);
      default:
        return false;
    }
  };

  // Step navigation
  const nextStep = () => {
    if (currentStep < totalSteps && validateCurrentStep()) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (siteStatusLoading) {
      return;
    }

    // Final validation
    if (!validateCurrentStep()) {
      addToast("Please complete all required fields correctly", "error");
      return;
    }

    setLocalError(null);
    setIsSubmitting(true);

    try {
      const agentData: RegisterAgentData = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        businessName: formData.businessName.trim(),
      };

      await registerAgent(agentData);

      if (signupApprovalRequired) {
        setShowSuccessDialog(true);
      } else {
        addToast(
          "Agent account created successfully! You can now log in.",
          "success"
        );
        navigate("/login");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again.";
      setLocalError(errorMessage);
      addToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Password strength calculation
  const getPasswordStrength = (): {
    strength: number;
    label: string;
    color: string;
  } => {
    const validCount = Object.values(passwordValidation).filter(Boolean).length;
    const strength = (validCount / 5) * 100;

    if (strength === 100)
      return { strength, label: "Strong", color: "bg-green-500" };
    if (strength >= 60)
      return { strength, label: "Medium", color: "bg-yellow-500" };
    if (strength > 0) return { strength, label: "Weak", color: "bg-red-500" };
    return { strength: 0, label: "Very Weak", color: "bg-gray-300" };
  };

  const passwordStrength = getPasswordStrength();

  const steps = ["Personal Info", "Business Info", "Security Setup"];

  return (
    <AuthLayout
      title="Create an Account"
      subtitle="Join our platform and start managing your telecom business today"
      footerText="Already have an account?"
      footerLinkText="Sign in here"
      footerLinkTo="/login"
    >
      {/* Progress Indicator - Matched to TopUpRequestModal */}
      <div className="flex items-center gap-1.5 mb-8 w-full max-w-md mx-auto">
        {steps.map((label, idx) => {
          const stepNum = idx + 1;
          const isCompleted = stepNum < currentStep;

          return (
            <React.Fragment key={stepNum}>
              <div
                className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-black transition-all duration-300"
                style={stepNum <= currentStep
                  ? { backgroundColor: 'var(--color-primary-500)', color: '#fff' }
                  : { backgroundColor: '#e2e8f0', color: '#64748b' }}
              >
                {isCompleted ? <FaCheck className="w-3.5 h-3.5" /> : stepNum}
              </div>
              {stepNum < steps.length && (
                <div
                  className="flex-1 h-1 rounded-full transition-all duration-300"
                  style={{ backgroundColor: stepNum < currentStep ? 'var(--color-primary-500)' : '#e2e8f0' }}
                />
              )}
            </React.Fragment>
          );
        })}
        <span className="ml-2 text-xs text-primary-600 font-bold whitespace-nowrap hidden sm:inline-block">
          {steps[currentStep - 1]}
        </span>
      </div>

      <div className="text-center sm:hidden mb-6">
        <p className="text-base font-bold text-gray-900">
          {steps[currentStep - 1]}
        </p>
        <p className="text-xs font-semibold text-primary-600 mt-1">
          STEP {currentStep} OF {totalSteps}
        </p>
      </div>

      <div className="pt-2">
        {localError && (
          <Alert
            status="error"
            variant="solid"
            className="mb-8 font-semibold text-sm"
          >
            <div className="flex items-start">
              <FaExclamationTriangle className="mr-2.5 mt-0.5 flex-shrink-0" />
              <span>{localError}</span>
            </div>
          </Alert>
        )}

      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-fadeIn">
            <Input
              label="Full Name"
              value={formData.fullName}
              onChange={(e) =>
                handleInputChange("fullName", e.target.value)
              }
              onBlur={() => handleFieldBlur("fullName")}
              type="text"
              required
              placeholder="Enter your full name"
              leftIcon={<FaUser className="text-gray-400" />}
              errorText={
                touchedFields.has("fullName")
                  ? fieldErrors.fullName
                  : undefined
              }
              className="transition-all"
            />

            <Input
              label="Email Address"
              value={formData.email}
              onChange={(e) =>
                handleInputChange("email", e.target.value)
              }
              onBlur={() => handleFieldBlur("email")}
              type="email"
              required
              placeholder="your.email@example.com"
              leftIcon={<FaEnvelope className="text-gray-400" />}
              errorText={
                touchedFields.has("email")
                  ? fieldErrors.email
                  : undefined
              }
              className="transition-all"
            />

            <div className="bg-blue-50 rounded-lg p-4 mt-6">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Your email will be used for
                account notifications and communication.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Business Information */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-fadeIn">
            <Input
              label="Business Name"
              value={formData.businessName}
              onChange={(e) =>
                handleInputChange("businessName", e.target.value)
              }
              onBlur={() => handleFieldBlur("businessName")}
              type="text"
              required
              placeholder="Enter your business name"
              leftIcon={<FaBuilding className="text-gray-400" />}
              errorText={
                touchedFields.has("businessName")
                  ? fieldErrors.businessName
                  : undefined
              }
              className="transition-all"
            />

            <Input
              label="Phone Number"
              value={formData.phone}
              onChange={(e) =>
                handleInputChange("phone", e.target.value)
              }
              onBlur={() => handleFieldBlur("phone")}
              type="tel"
              required
              placeholder="+233 XX XXX XXXX"
              leftIcon={<FaPhoneAlt className="text-gray-400" />}
              errorText={
                touchedFields.has("phone")
                  ? fieldErrors.phone
                  : undefined
              }
              className="transition-all"
            />

            <div className="bg-blue-50 rounded-lg p-4 mt-6">
              <p className="text-sm text-blue-800">
                <strong>Business verification:</strong> Ensure your
                business details are accurate for faster approval.
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Security */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <Input
                label="Password"
                value={formData.password}
                onChange={(e) =>
                  handleInputChange("password", e.target.value)
                }
                onBlur={() => handleFieldBlur("password")}
                type={showPasswords ? "text" : "password"}
                required
                placeholder="Create a strong password"
                leftIcon={<FaLock className="text-gray-400" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="absolute bottom-0.5 right-1 text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    aria-label={
                      showPasswords ? "Hide passwords" : "Show passwords"
                    }
                  >
                    {showPasswords ? (
                      <FaEyeSlash className="w-5 h-5" />
                    ) : (
                      <FaEye className="w-5 h-5" />
                    )}
                  </button>
                }
                errorText={
                  touchedFields.has("password")
                    ? fieldErrors.password
                    : undefined
                }
              />

              {/* Password Strength Bar */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">
                      Password Strength:
                    </span>
                    <span
                      className={`text-xs font-medium ${passwordStrength.strength === 100
                        ? "text-green-600"
                        : passwordStrength.strength >= 60
                          ? "text-yellow-600"
                          : "text-red-600"
                        }`}
                    >
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${passwordStrength.color} transition-all duration-300`}
                      style={{ width: `${passwordStrength.strength}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <Input
                label="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                onBlur={() => handleFieldBlur("confirmPassword")}
                type={showPasswords ? "text" : "password"}
                required
                placeholder="Confirm your password"
                leftIcon={<FaLock className="text-gray-400" />}
                errorText={
                  touchedFields.has("confirmPassword")
                    ? fieldErrors.confirmPassword
                    : undefined
                }
              />
            </div>

            {/* Password Requirements */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h4 className="text-sm font-semibold text-gray-900">
                Password Requirements:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { key: "length", label: "At least 8 characters" },
                  { key: "uppercase", label: "One uppercase letter" },
                  { key: "lowercase", label: "One lowercase letter" },
                  { key: "number", label: "One number" },
                ].map(({ key, label }) => (
                  <div
                    key={key}
                    className={`flex items-center text-sm transition-colors ${passwordValidation[
                      key as keyof PasswordValidation
                    ]
                      ? "text-green-700"
                      : "text-gray-500"
                      }`}
                  >
                    <div
                      className={`mr-2 w-5 h-5 rounded-full flex items-center justify-center transition-all ${passwordValidation[
                        key as keyof PasswordValidation
                      ]
                        ? "bg-green-100"
                        : "bg-gray-200"
                        }`}
                    >
                      <FaCheckCircle
                        className={`w-3 h-3 ${passwordValidation[
                          key as keyof PasswordValidation
                        ]
                          ? "text-green-600"
                          : "text-gray-400"
                          }`}
                      />
                    </div>
                    {label}
                  </div>
                ))}
                <div
                  className={`flex items-center text-sm transition-colors sm:col-span-2 ${passwordValidation.match
                    ? "text-green-700"
                    : "text-gray-500"
                    }`}
                >
                  <div
                    className={`mr-2 w-5 h-5 rounded-full flex items-center justify-center transition-all ${passwordValidation.match
                      ? "bg-green-100"
                      : "bg-gray-200"
                      }`}
                  >
                    <FaCheckCircle
                      className={`w-3 h-3 ${passwordValidation.match
                        ? "text-green-600"
                        : "text-gray-400"
                        }`}
                    />
                  </div>
                  Passwords match
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center justify-center sm:flex-1 order-2 sm:order-1"
          >
            <FaArrowLeft className="mr-2" />
            Back
          </Button>

          {currentStep < totalSteps ? (
            <Button
              type="button"
              variant="primary"
              onClick={nextStep}
              disabled={!validateCurrentStep()}
              className="flex items-center justify-center sm:flex-1 order-1 sm:order-2"
            >
              Next
              <FaArrowRight className="ml-2" />
            </Button>
          ) : (
            <Button
              type="submit"
              variant="primary"
              disabled={
                !validateCurrentStep() ||
                isSubmitting ||
                siteStatusLoading
              }
              className="flex items-center justify-center sm:flex-1 order-1 sm:order-2"
            >
              {siteStatusLoading ? (
                <>
                  <FaSpinner className="mr-2 animate-spin" />
                  Loading...
                </>
              ) : isSubmitting ? (
                <>
                  <FaSpinner className="mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <FaStore className="mr-2" />
                  Create Account
                </>
              )}
            </Button>
          )}
        </div>
      </form>

      {/* Success Dialog */}
      <Dialog
        isOpen={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        size="md"
      >
        <DialogHeader>
          <div className="flex items-center">
            <div className="bg-green-100 p-2 rounded-full mr-3">
              <FaCheckCircle className="text-green-600 text-xl" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Registration Successful!
            </h2>
          </div>
        </DialogHeader>
        <DialogBody>
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="mx-auto bg-green-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4">
                <FaCheckCircle className="text-green-600 text-4xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Your Agent Account Has Been Created
              </h3>
              <p className="text-gray-600 text-sm">
                Your account is pending approval by our admin team. We'll notify
                you once approved.
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                <FaClock className="mr-2" />
                What happens next?
              </h4>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Review within 24-48 hours</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Email notification upon approval</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Immediate access to start earning</span>
                </li>
              </ul>
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => setShowSuccessDialog(false)}
              className="flex-1 sm:flex-none"
            >
              Close
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setShowSuccessDialog(false);
                navigate("/login");
              }}
              className="flex-1 sm:flex-none"
            >
              Go to Login
            </Button>
          </div>
        </DialogFooter>
      </Dialog>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </AuthLayout>
  );
};
