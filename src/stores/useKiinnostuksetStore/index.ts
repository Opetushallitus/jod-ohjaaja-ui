import { addKiinnostus, deleteKiinnostus, getKiinnostukset } from '@/api/kiinnostukset';
import { components } from '@/api/schema';

import { create } from 'zustand';

interface KiinnostuksetStore {
  kiinnostukset: components['schemas']['KiinnostusDto'][];
  toggleKiinnostus: (asiasanaId: number) => Promise<void>;
  fetchKiinnostukset: () => Promise<void>;
  clearKiinnostukset: () => void;
}

export const useKiinnostuksetStore = create<KiinnostuksetStore>()((set, get) => ({
  kiinnostukset: [],
  toggleKiinnostus: async (asiasanaId) => {
    const currentKiinnostukset = get().kiinnostukset;
    const existingKiinnostus = currentKiinnostukset.find((kiinnostus) => kiinnostus.asiasanaId === asiasanaId);
    if (existingKiinnostus?.id) {
      await deleteKiinnostus(existingKiinnostus.id);
      set({ kiinnostukset: currentKiinnostukset.filter((kiinnostus) => kiinnostus.id !== existingKiinnostus.id) });
    } else {
      const newKiinnostusId = await addKiinnostus(asiasanaId);
      if (newKiinnostusId) {
        const newKiinnostus = { id: newKiinnostusId, asiasanaId: asiasanaId, luotu: new Date().toISOString() };
        set({ kiinnostukset: [...currentKiinnostukset, newKiinnostus] });
      }
    }
  },
  fetchKiinnostukset: async () => {
    const fetchedKiinnostukset = await getKiinnostukset();
    set({ kiinnostukset: fetchedKiinnostukset });
  },
  clearKiinnostukset: () => {
    set({ kiinnostukset: [] });
  },
}));
