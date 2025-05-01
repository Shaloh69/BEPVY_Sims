// app/reset-password/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import {
  Lock as LockClosedIcon,
  CheckCircle as CheckCircleIcon,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useAuthModals } from "@/context/useAuthModals";

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetPassword } = useAuth();
  const { openModal } = useAuthModals();

  const [token, setToken] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    // Get token from URL
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError("No reset token provided. Please check your reset link.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!password || !confirmPassword) {
      setError("Both fields are required");
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
      const result = await resetPassword(token, password);

      if (result.success) {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/");
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
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center">
          {success ? (
            <CheckCircleIcon className="w-16 h-16 text-green-500 mb-4" />
          ) : (
            <LockClosedIcon className="w-16 h-16 text-primary mb-4" />
          )}
          <h1 className="text-2xl font-bold text-center">
            {success ? "Password Reset Successfully" : "Reset Your Password"}
          </h1>
        </CardHeader>
        <CardBody>
          {error && (
            <div className="p-3 mb-4 text-sm text-red-500 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          {success ? (
            <div className="text-center mb-4">
              <p>Your password has been reset successfully.</p>
              <p className="text-sm text-gray-500 mt-2">
                Redirecting you to login...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="New Password"
                placeholder="Enter new password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                isRequired
                fullWidth
              />
              <Input
                label="Confirm Password"
                placeholder="Confirm new password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                isRequired
                fullWidth
              />
              <Button
                type="submit"
                color="primary"
                fullWidth
                isLoading={isSubmitting}
              >
                Reset Password
              </Button>
            </form>
          )}
        </CardBody>
        {success && (
          <CardFooter className="flex justify-center">
            <Button
              color="primary"
              onClick={() => {
                router.push("/");
                openModal("login");
              }}
            >
              Go to Login
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
