"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";

import { Button } from "@heroui/button";

import { useAuthModals } from "@/context/useAuthModals";

export default function AuthModals() {
  const { modalType, closeModal } = useAuthModals();
  const isOpen = modalType !== null;

  const renderContent = () => {
    switch (modalType) {
      case "login":
        return <LoginForm />;
      case "register":
        return <RegisterForm />;
      case "forgot":
        return <ForgotPasswordForm />;
      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={closeModal} isDismissable={true}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="text-xl font-semibold capitalize">
              {modalType === "login" && "Login"}
              {modalType === "register" && "Register"}
              {modalType === "forgot" && "Forgot Password"}
            </ModalHeader>

            <ModalBody>{renderContent()}</ModalBody>

            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button color="primary" onPress={onClose}>
                Confirm
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

// Placeholder forms (you can replace with real ones)
const LoginForm = () => (
  <form className="space-y-4">
    <input
      className="w-full px-4 py-2 bg-white text-black rounded"
      placeholder="Email"
    />
    <input
      className="w-full px-4 py-2 bg-white text-black rounded"
      type="password"
      placeholder="Password"
    />
  </form>
);

const RegisterForm = () => (
  <form className="space-y-4">
    <input
      className="w-full px-4 py-2 bg-white text-black rounded"
      placeholder="Full Name"
    />
    <input
      className="w-full px-4 py-2 bg-white text-black rounded"
      placeholder="Email"
    />
    <input
      className="w-full px-4 py-2 bg-white text-black rounded"
      type="password"
      placeholder="Password"
    />
  </form>
);

const ForgotPasswordForm = () => (
  <form className="space-y-4">
    <input
      className="w-full px-4 py-2 bg-white text-black rounded"
      placeholder="Email to recover password"
    />
  </form>
);
