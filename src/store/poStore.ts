import { create } from "zustand";

interface POStoreState {
  selectedPOId: string | null;
  cancelReason: string;
  setSelectedPO: (id: string | null) => void;
  setCancelReason: (reason: string) => void;
  reset: () => void;
}

export const usePOStore = create<POStoreState>((set) => ({
  selectedPOId: null,
  cancelReason: "",
  setSelectedPO: (id) => set({ selectedPOId: id }),
  setCancelReason: (reason) => set({ cancelReason: reason }),
  reset: () => set({ selectedPOId: null, cancelReason: "" }),
}));
