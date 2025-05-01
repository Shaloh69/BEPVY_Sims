// app/verification-error/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle as ExclamationCircleIcon } from "lucide-react";

import { useAuthModals } from "@/context/useAuthModals";

export default function VerificationError() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { openModal } = useAuthModals();
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const error = searchParams.get("error");

    // Set appropriate error message based on error code
    switch (error) {
      case "no-token":
        setErrorMessage("No verification token was provided.");
        break;
      case "invalid-token":
        setErrorMessage(
          "The verification token is invalid or has already been used."
        );
        break;
      case "expired-token":
        setErrorMessage("The verification token has expired.");
        break;
      case "wrong-token-type":
        setErrorMessage("The token is not a valid verification token.");
        break;
      case "user-not-found":
        setErrorMessage("User associated with this token was not found.");
        break;
      case "server-error":
        setErrorMessage("A server error occurred during verification.");
        break;
      default:
        setErrorMessage("An unknown error occurred during email verification.");
    }
  }, [searchParams]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center">
          <ExclamationCircleIcon className="w-16 h-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-center">
            Verification Failed
          </h1>
        </CardHeader>
        <CardBody>
          <p className="text-center mb-4">{errorMessage}</p>
          <p className="text-center text-sm text-gray-500">
            Please try again or contact support if the problem persists.
          </p>
        </CardBody>
        <CardFooter className="flex justify-center gap-4">
          <Button
            color="primary"
            variant="light"
            onClick={() => {
              router.push("/");
            }}
          >
            Go to Home
          </Button>
          <Button
            color="primary"
            onClick={() => {
              router.push("/");
              openModal("register");
            }}
          >
            Try Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
