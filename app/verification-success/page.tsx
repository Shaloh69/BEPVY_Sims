// app/verification-success/page.tsx
"use client";

import { useEffect } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { useRouter } from "next/navigation";
import {
  Lock as LockClosedIcon,
  CheckCircle as CheckCircleIcon,
} from "lucide-react";

import { useAuthModals } from "@/context/useAuthModals";

export default function VerificationSuccess() {
  const router = useRouter();
  const { openModal } = useAuthModals();

  // Redirect to login after 5 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push("/");
      openModal("login");
    }, 5000);

    return () => clearTimeout(timeout);
  }, [router, openModal]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mb-4" />
          <h1 className="text-2xl font-bold text-center">Email Verified!</h1>
        </CardHeader>
        <CardBody>
          <p className="text-center mb-4">
            Your email has been successfully verified. You can now log in to
            your account.
          </p>
          <p className="text-center text-sm text-gray-500">
            You will be redirected to the login page in a few seconds...
          </p>
        </CardBody>
        <CardFooter className="flex justify-center">
          <Button
            color="primary"
            onClick={() => {
              router.push("/");
              openModal("login");
            }}
          >
            Log in now
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
