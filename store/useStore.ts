import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CardData } from '@/types';

const SEED: CardData[] = [
  // Art
  { id: 'seed-a-yt', type: 'youtube', x: 0, y: 0, width: 300, height: 264, zIndex: 2,
    data: { videoId: 'BCsHwU_7C8I', url: 'https://youtu.be/BCsHwU_7C8I', meta: { title: 'Run animation | Breakdown', channel: 'Troisenko Vladislav' } },
    tags: ['art'], starred: true },
  { id: 'seed-a-link', type: 'link', x: 0, y: 0, width: 300, height: 210, zIndex: 2,
    data: { url: 'https://docs.blender.org' },
    tags: ['art', 'code'], starred: false },
  { id: 'seed-a-img', type: 'image', x: 0, y: 0, width: 300, height: 220, zIndex: 2,
    data: { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Procreate_logo.svg/512px-Procreate_logo.svg.png' },
    tags: ['art'], starred: false },

  // Music
  { id: 'seed-m-yt', type: 'youtube', x: 0, y: 0, width: 300, height: 264, zIndex: 2,
    data: { videoId: 'jfKfPfyJRdk', url: 'https://youtu.be/jfKfPfyJRdk', meta: { title: 'Music To Watch Boys To', channel: 'Lana Del Rey' } },
    tags: ['music'], starred: true },
  { id: 'seed-m-link', type: 'link', x: 0, y: 0, width: 300, height: 210, zIndex: 2,
    data: { url: 'https://www.guitarcenter.com' },
    tags: ['music'], starred: false },

  // Code
  { id: 'seed-c-note', type: 'note', x: 0, y: 0, width: 300, height: 160, zIndex: 2,
    data: { text: 'Fri May 8\n\n• Learn Framer Motion\n\n• Build a mood board\n\n• Push changes to GitHub\n\n• Explore Supabase for sync' },
    tags: ['code'], starred: false },
  { id: 'seed-c-img', type: 'image', x: 0, y: 0, width: 300, height: 220, zIndex: 2,
    data: { src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
    tags: ['art', 'inspiration'], starred: true },
  { id: 'seed-c-link', type: 'link', x: 0, y: 0, width: 300, height: 210, zIndex: 2,
    data: { url: 'https://www.reddit.com/r/fractals/' },
    tags: ['code', 'inspiration'], starred: false },
];

interface StoreState {
  cards: CardData[];
  maxZIndex: number;
  activeTag: string | null;
  editMode: boolean;
  addCard: (card: Omit<CardData, 'id' | 'zIndex'> & { zIndex?: number }) => void;
  updateCard: (id: string, updates: Partial<CardData>) => void;
  removeCard: (id: string) => void;
  bringToFront: (id: string) => void;
  setActiveTag: (tag: string | null) => void;
  setEditMode: (mode: boolean) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      cards: SEED,
      maxZIndex: 10,
      activeTag: null,
      editMode: false,

      addCard: (card) =>
        set((state) => {
          const zIndex = card.zIndex ?? state.maxZIndex + 1;
          const nextMax = card.zIndex !== undefined ? state.maxZIndex : zIndex;
          return {
            cards: [...state.cards, { ...card, id: crypto.randomUUID(), zIndex }],
            maxZIndex: nextMax,
          };
        }),

      updateCard: (id, updates) =>
        set((state) => ({
          cards: state.cards.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),

      removeCard: (id) =>
        set((state) => ({ cards: state.cards.filter((c) => c.id !== id) })),

      bringToFront: (id) =>
        set((state) => ({
          cards: state.cards.map((c) => c.id === id ? { ...c, zIndex: state.maxZIndex + 1 } : c),
          maxZIndex: state.maxZIndex + 1,
        })),

      setActiveTag: (tag) => set({ activeTag: tag }),
      setEditMode: (mode) => set({ editMode: mode }),
    }),
    {
      name: 'homebase-v4',
      partialize: (state) => ({ cards: state.cards, maxZIndex: state.maxZIndex }),
    }
  )
);
