import { components } from '@/api/schema';
import { addSuosikki, deleteSuosikki, getSuosikit } from '@/api/suosikit';
import { create } from 'zustand';

interface SuosikitStore {
  suosikit: components['schemas']['SuosikkiDto'][];
  toggleSuosikki: (articleErc: string) => Promise<void>;
  fetchSuosikit: () => Promise<void>;
  clearSuosikit: () => void;
}

export const useSuosikitStore = create<SuosikitStore>()((set, get) => ({
  suosikit: [],
  toggleSuosikki: async (articleErc) => {
    const currentSuosikit = get().suosikit;
    const existingSuosikki = currentSuosikit.find((suosikki) => suosikki.artikkeliErc === articleErc);
    if (existingSuosikki?.id) {
      await deleteSuosikki(existingSuosikki.id);
      set({ suosikit: currentSuosikit.filter((suosikki) => suosikki.id !== existingSuosikki.id) });
    } else {
      const newSuosikkiId = await addSuosikki(articleErc);
      if (newSuosikkiId) {
        const newSuosikki = { id: newSuosikkiId, artikkeliErc: articleErc, luotu: new Date().toISOString() };
        set({ suosikit: [...currentSuosikit, newSuosikki] });
      }
    }
  },
  fetchSuosikit: async () => {
    const fetchedSuosikit = await getSuosikit();
    set({ suosikit: fetchedSuosikit });
  },
  clearSuosikit: () => {
    set({ suosikit: [] });
  },
}));
