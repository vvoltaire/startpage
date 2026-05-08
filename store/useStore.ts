import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CardData } from '@/types';

const SEED: CardData[] = [
  // ── Notes ─────────────────────────────────────────────────────────────────
  { id: 'seed-note-art', type: 'note', x: 0, y: 0, width: 280, height: 192, zIndex: 2,
    data: { text: 'Current 3D Goals\n\n• Finish donut tutorial (Ch. 3)\n• Learn geometry nodes\n• Try NPR / toon shading\n• Rig a simple character' },
    tags: ['art'], starred: false },
  { id: 'seed-note-music', type: 'note', x: 0, y: 0, width: 280, height: 192, zIndex: 2,
    data: { text: 'Session Ideas\n\n• E minor chord progression\n• Layer vinyl crackle sample\n• Target BPM: 85 (lo-fi feel)\n• Try side-chain compression' },
    tags: ['music'], starred: false },
  { id: 'seed-note-code', type: 'note', x: 0, y: 0, width: 280, height: 210, zIndex: 2,
    data: { text: 'Dev To-Do\n\n• Homebase: Supabase sync\n• Deploy to Vercel\n• Fix Canvas TS errors\n• Gallery mode (Phase 6)\n• Magnetic card snapping' },
    tags: ['code'], starred: true },
  { id: 'seed-note-inspo', type: 'note', x: 0, y: 0, width: 280, height: 192, zIndex: 2,
    data: { text: 'Current Aesthetic\n\n• Japanese minimalism\n• Brutalist architecture\n• Muted earth + indigo tones\n• Clean geometric sans-serif' },
    tags: ['inspiration'], starred: false },

  // ── Art ──────────────────────────────────────────────────────────────────
  { id: 'seed-art-blender-manual', type: 'link', x: 0, y: 0, width: 280, height: 170, zIndex: 2,
    data: { url: 'https://docs.blender.org/manual/en/latest/' },
    tags: ['art'], starred: false },
  { id: 'seed-art-donut', type: 'youtube', x: 0, y: 0, width: 340, height: 256, zIndex: 2,
    data: { videoId: 'nIoXOplUvAw', url: 'https://www.youtube.com/watch?v=nIoXOplUvAw', meta: { title: 'Blender Beginner Donut Tutorial', channel: 'Blender Guru' } },
    tags: ['art'], starred: true },
  { id: 'seed-art-stylized', type: 'youtube', x: 0, y: 0, width: 340, height: 256, zIndex: 2,
    data: { videoId: 'Tpwi-v3at8M', url: 'https://www.youtube.com/watch?v=Tpwi-v3at8M', meta: { title: 'Stylized Shading in Blender', channel: 'YanSculpts' } },
    tags: ['art'], starred: false },
  { id: 'seed-art-artstation', type: 'link', x: 0, y: 0, width: 300, height: 210, zIndex: 2,
    data: { url: 'https://www.artstation.com/search?sort_by=trending' },
    tags: ['art'], starred: false },
  { id: 'seed-art-behance', type: 'link', x: 0, y: 0, width: 300, height: 210, zIndex: 2,
    data: { url: 'https://www.behance.net/galleries/graphic-design' },
    tags: ['art'], starred: false },
  { id: 'seed-art-conceptart', type: 'link', x: 0, y: 0, width: 280, height: 185, zIndex: 2,
    data: { url: 'https://conceptartworld.com/' },
    tags: ['art'], starred: false },
  { id: 'seed-art-sketchfab', type: 'link', x: 0, y: 0, width: 300, height: 210, zIndex: 2,
    data: { url: 'https://sketchfab.com/feed' },
    tags: ['art'], starred: false },
  { id: 'seed-art-procreate', type: 'youtube', x: 0, y: 0, width: 340, height: 256, zIndex: 2,
    data: { videoId: 'p0Z3E82eC7k', url: 'https://www.youtube.com/watch?v=p0Z3E82eC7k', meta: { title: 'Procreate Dreams — Intro', channel: 'Procreate' } },
    tags: ['art'], starred: true },
  { id: 'seed-art-krita', type: 'link', x: 0, y: 0, width: 280, height: 170, zIndex: 2,
    data: { url: 'https://krita.org/en/' },
    tags: ['art'], starred: false },
  { id: 'seed-art-gnomon', type: 'link', x: 0, y: 0, width: 300, height: 210, zIndex: 2,
    data: { url: 'https://www.thegnomonworkshop.com/' },
    tags: ['art'], starred: false },

  // ── Music ─────────────────────────────────────────────────────────────────
  { id: 'seed-music-clarity', type: 'youtube', x: 0, y: 0, width: 340, height: 256, zIndex: 2,
    data: { videoId: 'IxxstCcJlsc', url: 'https://www.youtube.com/watch?v=IxxstCcJlsc', meta: { title: 'Zedd ft. Foxes — Clarity (Official Video)', channel: 'Zedd' } },
    tags: ['music'], starred: true },
  { id: 'seed-music-genius', type: 'link', x: 0, y: 0, width: 280, height: 170, zIndex: 2,
    data: { url: 'https://genius.com/Zedd-clarity-lyrics' },
    tags: ['music'], starred: false },
  { id: 'seed-music-justin', type: 'link', x: 0, y: 0, width: 300, height: 210, zIndex: 2,
    data: { url: 'https://www.justinguitar.com/classes/beginner-guitar-course-grade-1' },
    tags: ['music'], starred: false },
  { id: 'seed-music-samplemagic', type: 'link', x: 0, y: 0, width: 280, height: 185, zIndex: 2,
    data: { url: 'https://www.samplemagic.com/' },
    tags: ['music'], starred: false },
  { id: 'seed-music-splice', type: 'link', x: 0, y: 0, width: 300, height: 210, zIndex: 2,
    data: { url: 'https://splice.com/sounds/search/samples' },
    tags: ['music'], starred: false },
  { id: 'seed-music-ableton', type: 'link', x: 0, y: 0, width: 320, height: 220, zIndex: 2,
    data: { url: 'https://learningsynths.ableton.com/' },
    tags: ['music'], starred: true },
  { id: 'seed-music-sos', type: 'link', x: 0, y: 0, width: 280, height: 185, zIndex: 2,
    data: { url: 'https://www.soundonsound.com/' },
    tags: ['music'], starred: false },
  { id: 'seed-music-pitchfork', type: 'link', x: 0, y: 0, width: 300, height: 210, zIndex: 2,
    data: { url: 'https://pitchfork.com/reviews/albums/' },
    tags: ['music'], starred: false },
  { id: 'seed-music-lofi', type: 'youtube', x: 0, y: 0, width: 340, height: 256, zIndex: 2,
    data: { videoId: 'jfKfPfyJRdk', url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk', meta: { title: 'lofi hip hop radio 📚 beats to relax/study to', channel: 'Lofi Girl' } },
    tags: ['music'], starred: true },
  { id: 'seed-music-ni', type: 'link', x: 0, y: 0, width: 300, height: 210, zIndex: 2,
    data: { url: 'https://www.native-instruments.com/en/' },
    tags: ['music'], starred: false },

  // ── Code ──────────────────────────────────────────────────────────────────
  { id: 'seed-code-framer', type: 'link', x: 0, y: 0, width: 320, height: 220, zIndex: 2,
    data: { url: 'https://www.framer.com/motion/' },
    tags: ['code'], starred: true },
  { id: 'seed-code-react', type: 'link', x: 0, y: 0, width: 300, height: 185, zIndex: 2,
    data: { url: 'https://github.com/facebook/react' },
    tags: ['code'], starred: false },
  { id: 'seed-code-supabase', type: 'link', x: 0, y: 0, width: 320, height: 220, zIndex: 2,
    data: { url: 'https://supabase.com/docs' },
    tags: ['code'], starred: true },
  { id: 'seed-code-mdn', type: 'link', x: 0, y: 0, width: 280, height: 185, zIndex: 2,
    data: { url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout' },
    tags: ['code'], starred: false },
  { id: 'seed-code-stackoverflow', type: 'link', x: 0, y: 0, width: 300, height: 210, zIndex: 2,
    data: { url: 'https://stackoverflow.com/questions?sort=featured' },
    tags: ['code'], starred: false },
  { id: 'seed-code-nextjs', type: 'link', x: 0, y: 0, width: 320, height: 220, zIndex: 2,
    data: { url: 'https://nextjs.org/docs' },
    tags: ['code'], starred: true },
  { id: 'seed-code-tailwind', type: 'link', x: 0, y: 0, width: 280, height: 185, zIndex: 2,
    data: { url: 'https://tailwindcss.com/docs/installation' },
    tags: ['code'], starred: false },
  { id: 'seed-code-devto', type: 'link', x: 0, y: 0, width: 280, height: 185, zIndex: 2,
    data: { url: 'https://dev.to/' },
    tags: ['code'], starred: false },
  { id: 'seed-code-codepen', type: 'link', x: 0, y: 0, width: 300, height: 210, zIndex: 2,
    data: { url: 'https://codepen.io/trending' },
    tags: ['code'], starred: false },
  { id: 'seed-code-threejs', type: 'link', x: 0, y: 0, width: 320, height: 220, zIndex: 2,
    data: { url: 'https://threejs.org/examples/' },
    tags: ['code'], starred: true },

  // ── Inspiration ───────────────────────────────────────────────────────────
  { id: 'seed-inspo-pinterest', type: 'link', x: 0, y: 0, width: 300, height: 210, zIndex: 2,
    data: { url: 'https://www.pinterest.com/search/pins/?q=minimalism%20aesthetic' },
    tags: ['inspiration'], starred: false },
  { id: 'seed-inspo-awwwards', type: 'link', x: 0, y: 0, width: 320, height: 220, zIndex: 2,
    data: { url: 'https://www.awwwards.com/websites/' },
    tags: ['inspiration'], starred: true },
  { id: 'seed-inspo-designfiles', type: 'link', x: 0, y: 0, width: 280, height: 185, zIndex: 2,
    data: { url: 'https://thedesignfiles.net/' },
    tags: ['inspiration'], starred: false },
  { id: 'seed-inspo-unsplash', type: 'link', x: 0, y: 0, width: 320, height: 220, zIndex: 2,
    data: { url: 'https://unsplash.com/t/architecture-interior' },
    tags: ['inspiration'], starred: true },
  { id: 'seed-inspo-arena', type: 'link', x: 0, y: 0, width: 280, height: 185, zIndex: 2,
    data: { url: 'https://www.are.na/explore' },
    tags: ['inspiration'], starred: false },
  { id: 'seed-inspo-designmilk', type: 'link', x: 0, y: 0, width: 280, height: 185, zIndex: 2,
    data: { url: 'https://design-milk.com/' },
    tags: ['inspiration'], starred: false },
  { id: 'seed-inspo-itsnicethat', type: 'link', x: 0, y: 0, width: 300, height: 210, zIndex: 2,
    data: { url: 'https://www.itsnicethat.com/' },
    tags: ['inspiration'], starred: true },
  { id: 'seed-inspo-abduzeedo', type: 'link', x: 0, y: 0, width: 280, height: 185, zIndex: 2,
    data: { url: 'https://abduzeedo.com/' },
    tags: ['inspiration'], starred: false },
  { id: 'seed-inspo-dribbble', type: 'link', x: 0, y: 0, width: 300, height: 210, zIndex: 2,
    data: { url: 'https://dribbble.com/shots' },
    tags: ['inspiration'], starred: true },
  { id: 'seed-inspo-archdaily', type: 'link', x: 0, y: 0, width: 300, height: 210, zIndex: 2,
    data: { url: 'https://www.archdaily.com/' },
    tags: ['inspiration'], starred: false },
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
      name: 'homebase-v6',
      partialize: (state) => ({ cards: state.cards, maxZIndex: state.maxZIndex }),
    }
  )
);
