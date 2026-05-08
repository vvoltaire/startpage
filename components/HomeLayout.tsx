'use client';

import { Fragment, useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { CardData } from '@/types';
import NavBubble from './NavBubble';
import PageHeader from './PageHeader';
import TagColumn from './TagColumn';

const MIN_COL_WIDTH = 200;

export default function HomeLayout() {
  const cards = useStore((s) => s.cards);
  const addCard = useStore((s) => s.addCard);
  const editMode = useStore((s) => s.editMode);
  const setEditMode = useStore((s) => s.setEditMode);

  const tags = [...new Set(
    cards.filter((c) => c.type !== 'section').flatMap((c) => c.tags)
  )].sort();

  const hasUntagged = cards.some((c) => c.type !== 'section' && c.tags.length === 0);
  const allCols: (string | null)[] = hasUntagged ? [...tags, null] : tags;
  const colCount = Math.max(allCols.length, 0);

  const [colWidths, setColWidths] = useState<number[]>(() => {
    if (colCount === 0) return [];
    const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
    return Array.from({ length: colCount }, () => w / colCount);
  });

  useEffect(() => {
    if (colWidths.length === colCount) return;
    setColWidths((prev) => {
      const w = window.innerWidth;
      const n = Math.max(colCount, 1);
      return Array.from({ length: colCount }, (_, i) => prev[i] ?? w / n);
    });
  }, [colCount]);

  const handleDividerDrag = useCallback((dividerIdx: number, e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidths = [...colWidths];

    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      setColWidths(() => {
        const next = [...startWidths];
        next[dividerIdx] = Math.max(MIN_COL_WIDTH, startWidths[dividerIdx] + dx);
        next[dividerIdx + 1] = Math.max(MIN_COL_WIDTH, startWidths[dividerIdx + 1] - dx);
        return next;
      });
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [colWidths]);

  const handleAdd = useCallback(
    (type: CardData['type'], data: Record<string, unknown>) => {
      const sizes: Partial<Record<CardData['type'], [number, number]>> = {
        youtube: [400, 264], image: [300, 220], link: [300, 210],
        note: [300, 160], audio: [300, 104],
      };
      const [w, h] = sizes[type] ?? [300, 200];
      addCard({ type, x: 0, y: 0, width: w, height: h, data, tags: [], starred: false });
    },
    [addCard]
  );

  return (
    <div
      className="canvas-bg"
      style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
    >
      <PageHeader />

      {/* Columns area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        {allCols.length === 0 ? (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 13, color: 'rgba(107,139,209,0.5)', fontStyle: 'italic' }}>
              Add a card with the + menu to get started
            </span>
          </div>
        ) : (
          allCols.map((tag, i) => (
            <Fragment key={tag ?? '__untagged__'}>
              <TagColumn tag={tag} width={colWidths[i] ?? MIN_COL_WIDTH} index={i} />
              {i < allCols.length - 1 && (
                <div
                  onMouseDown={(e) => handleDividerDrag(i, e)}
                  style={{
                    width: 3,
                    flexShrink: 0,
                    background: 'rgba(107,139,209,0.14)',
                    cursor: 'col-resize',
                    transition: 'background 0.15s',
                    zIndex: 1,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(107,139,209,0.38)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(107,139,209,0.14)')}
                />
              )}
            </Fragment>
          ))
        )}
      </div>

      <NavBubble onAdd={handleAdd} />

      {/* Exit edit mode bar */}
      <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 50 }}>
        <AnimatePresence>
          {editMode && (
            <motion.button
              key="exit-edit"
              initial={{ y: 14, opacity: 0, scale: 0.92 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 14, opacity: 0, scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 420, damping: 26 }}
              onClick={() => setEditMode(false)}
              style={{
                height: 40, padding: '0 20px', borderRadius: 20,
                background: 'rgba(255,255,255,0.6)',
                border: '1px solid rgba(107,139,209,0.22)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                color: 'rgba(55,85,170,0.65)', fontSize: 13,
                cursor: 'pointer', fontFamily: 'inherit', outline: 'none',
              }}
            >
              exit edit mode
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
