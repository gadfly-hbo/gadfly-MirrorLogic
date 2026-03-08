import { create } from 'zustand';
import { apiUrl } from './utils/api.js';

const useStore = create((set) => ({
    personas: [],
    currentPersona: null,
    isLoading: false,
    error: null,

    setPersonas: (personas) => set({ personas }),
    setCurrentPersona: (persona) => set({ currentPersona: persona }),

    fetchPersonas: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await fetch(apiUrl('/api/personas'));
            if (!res.ok) throw new Error('网络请求失败');
            const data = await res.json();
            set({ personas: data });
        } catch (error) {
            set({ error: error.message });
        } finally {
            set({ isLoading: false });
        }
    }
}));

export default useStore;
