import { useState, useCallback } from "react";

export interface SettingsModalsState {
  profileModal: boolean;
  passwordModal: boolean;
  notificationsModal: boolean;
  helpModal: boolean;
  groupInfoModal: boolean;
  pendingRequestsModal: boolean;
}

/**
 * Custom hook to manage all settings modal visibility states
 * Eliminates prop drilling and centralizes modal state management
 */
export const useSettingsModals = () => {
  const [modals, setModals] = useState<SettingsModalsState>({
    profileModal: false,
    passwordModal: false,
    notificationsModal: false,
    helpModal: false,
    groupInfoModal: false,
    pendingRequestsModal: false,
  });

  const openModal = useCallback((modal: keyof SettingsModalsState) => {
    setModals((prev) => ({ ...prev, [modal]: true }));
  }, []);

  const closeModal = useCallback((modal: keyof SettingsModalsState) => {
    setModals((prev) => ({ ...prev, [modal]: false }));
  }, []);

  const toggleModal = useCallback((modal: keyof SettingsModalsState) => {
    setModals((prev) => ({ ...prev, [modal]: !prev[modal] }));
  }, []);

  return {
    modals,
    openModal,
    closeModal,
    toggleModal,
  };
};
