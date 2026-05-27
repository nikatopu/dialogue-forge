import { create } from "zustand";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastStore {
  toasts: ToastItem[];
  addToast: (message: string, type: ToastType) => void;
  removeToast: (id: string) => void;
}

const AUTO_DISMISS_MS = 4000;

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  addToast(message, type) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, AUTO_DISMISS_MS);
  },

  removeToast(id) {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },
}));

function add(message: string, type: ToastType) {
  useToastStore.getState().addToast(message, type);
}

export const toast = {
  success: (message: string) => add(message, "success"),
  error:   (message: string) => add(message, "error"),
  warning: (message: string) => add(message, "warning"),
  info:    (message: string) => add(message, "info"),
};
