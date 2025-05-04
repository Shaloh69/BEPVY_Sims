// components/AuthModals.tsx
"use client";

import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Link } from "@heroui/link";
import { Spinner } from "@heroui/spinner";
import { Divider } from "@heroui/divider";
import { Checkbox } from "@heroui/checkbox";

import { useAuthModals } from "@/context/useAuthModals";
import { useAuth } from "@/context/AuthContext";

export default function AuthModals() {
  const { modalType, closeModal, openModal } = useAuthModals();
  const isOpen = modalType !== null;

  const renderContent = () => {
    switch (modalType) {
      case "login":
        return <LoginForm onSuccess={closeModal} />;
      case "register":
        return <RegisterForm onSuccess={closeModal} />;
      case "forgot":
        return <ForgotPasswordForm onSuccess={closeModal} />;
      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={closeModal} isDismissable={true}>
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="text-xl font-semibold flex flex-col gap-1">
              {modalType === "login" && "Login to your account"}
              {modalType === "register" && "Create an account"}
              {modalType === "forgot" && "Reset your password"}

              {modalType && (
                <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
                  {modalType === "login" &&
                    "Welcome back! Enter your credentials to continue."}
                  {modalType === "register" &&
                    "Join us today and get started with BEPVY."}
                  {modalType === "forgot" &&
                    "Enter your email to receive a password reset link."}
                </p>
              )}
            </ModalHeader>

            <ModalBody>{renderContent()}</ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

// Login Form Component
const LoginForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const { openModal } = useAuthModals();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        onSuccess();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      <Input
        label="Email Address"
        placeholder="Enter your email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        isRequired
        fullWidth
      />

      <Input
        label="Password"
        placeholder="Enter your password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        isRequired
        fullWidth
      />

      <div className="flex justify-between items-center">
        <Checkbox defaultSelected>Remember me</Checkbox>
        <Link
          href="#"
          onClick={(e) => {
            e.preventDefault();
            openModal("forgot");
          }}
          size="sm"
        >
          Forgot password?
        </Link>
      </div>

      <Button type="submit" color="primary" fullWidth isLoading={isSubmitting}>
        {isSubmitting ? "Logging in..." : "Log in"}
      </Button>

      <div className="relative flex items-center py-5">
        <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
        <span className="flex-shrink mx-4 text-sm text-gray-500">or</span>
        <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
      </div>

      <div className="text-center">
        <span className="text-sm">Don't have an account? </span>
        <Link
          href="#"
          onClick={(e) => {
            e.preventDefault();
            openModal("register");
          }}
          size="sm"
        >
          Sign up now
        </Link>
      </div>
    </form>
  );
};

// Register Form Component
const RegisterForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const { openModal } = useAuthModals();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await register(name, email, password);
      if (result.success) {
        setSuccess(result.message);
        setTimeout(() => {
          onSuccess();
          openModal("login");
        }, 3000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 text-sm text-green-500 bg-green-100 rounded-md">
          {success}
        </div>
      )}

      <Input
        label="Full Name"
        placeholder="Enter your full name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        isRequired
        fullWidth
      />

      <Input
        label="Email Address"
        placeholder="Enter your email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        isRequired
        fullWidth
      />

      <Input
        label="Password"
        placeholder="Create a password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        isRequired
        fullWidth
      />

      <Input
        label="Confirm Password"
        placeholder="Confirm your password"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        isRequired
        fullWidth
      />

      <Button type="submit" color="primary" fullWidth isLoading={isSubmitting}>
        {isSubmitting ? "Creating account..." : "Create account"}
      </Button>

      <div className="text-center">
        <span className="text-sm">Already have an account? </span>
        <Link
          href="#"
          onClick={(e) => {
            e.preventDefault();
            openModal("login");
          }}
          size="sm"
        >
          Log in
        </Link>
      </div>
    </form>
  );
};

// Forgot Password Form Component
const ForgotPasswordForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { forgotPassword } = useAuth();
  const { openModal } = useAuthModals();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError("Email is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await forgotPassword(email);
      if (result.success) {
        setSuccess(result.message);
        setTimeout(() => {
          onSuccess();
        }, 3000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 text-sm text-green-500 bg-green-100 rounded-md">
          {success}
        </div>
      )}

      <div className="mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          We'll send a password reset link to your email address.
        </p>
      </div>

      <Input
        label="Email Address"
        placeholder="Enter your email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        isRequired
        fullWidth
      />

      <Button type="submit" color="primary" fullWidth isLoading={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send reset link"}
      </Button>

      <div className="text-center">
        <Link
          href="#"
          onClick={(e) => {
            e.preventDefault();
            openModal("login");
          }}
          size="sm"
        >
          Back to login
        </Link>
      </div>
    </form>
  );
};
