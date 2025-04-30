"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type ModalType = "login" | "register" | "forgot" | null;

interface AuthModalsContextType {
  modalType: ModalType;
  openModal: (type: ModalType) => void;
  closeModal: () => void;
}

const AuthModalsContext = createContext<AuthModalsContextType | undefined>(
  undefined
);

export const AuthModalsProvider = ({ children }: { children: ReactNode }) => {
  const [modalType, setModalType] = useState<ModalType>(null);

  const openModal = (type: ModalType) => setModalType(type);
  const closeModal = () => setModalType(null);

  return (
    <AuthModalsContext.Provider value={{ modalType, openModal, closeModal }}>
      {children}
    </AuthModalsContext.Provider>
  );
};

export const useAuthModals = () => {
  const context = useContext(AuthModalsContext);
  if (!context)
    throw new Error("useAuthModals must be used within AuthModalsProvider");
  return context;
};
