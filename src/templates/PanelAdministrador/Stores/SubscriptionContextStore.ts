// src/stores/panelStore.ts
import { create } from 'zustand'

interface SusbcriptionStore {
    currentSusbscription: number | null
    setCurrentSusbscription: (id: number | null) => void
}

export const useSusbcriptonStore = create<SusbcriptionStore>((set) => ({
    currentSusbscription: null,
    setCurrentSusbscription: (id) => set({ currentSusbscription: id }),
}))