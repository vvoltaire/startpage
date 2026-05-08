import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CardData } from '@/types';

interface StoreState {
  cards: CardData[];
  maxZIndex: number;
  addCard: (card: Omit<CardData, 'id' | 'zIndex'> & { zIndex?: number }) => void;
  updateCard: (id: string, updates: Partial<CardData>) => void;
  removeCard: (id: string) => void;
  bringToFront: (id: string) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      cards: [],
      maxZIndex: 10,

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
        set((state) => ({
          cards: state.cards.filter((c) => c.id !== id),
        })),

      bringToFront: (id) =>
        set((state) => ({
          cards: state.cards.map((c) =>
            c.id === id ? { ...c, zIndex: state.maxZIndex + 1 } : c
          ),
          maxZIndex: state.maxZIndex + 1,
        })),
    }),
    { name: 'homebase-storage' }
  )
);
