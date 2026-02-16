import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ShiftState {
    currentShift: any | null;
    setCurrentShift: (shift: any | null) => void;
}

export const useShiftStore = create<ShiftState>()(
    persist(
        (set) => ({
            currentShift: null,
            setCurrentShift: (shift) => set({ currentShift: shift }),
        }),
        {
            name: "bumas-shift-storage",
        }
    )
);
