'use client';

import { Fragment, useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { CardData } from '@/types';
import NavBubble from './NavBubble';
import PageHeader from './PageHeader';
import TagColumn from './TagColumn';

// Below this width a column collapses to a left-edge tab
const COLLAPSE_W = 48;
// Below this, a column left-edge is considered pushed off the right edge
const OFFSCREEN_R = 40;
const DIVIDER_W = 3;

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

  const [viewportW, setViewportW] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    const onResize = () => setViewportW(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (colWidths.length === colCount) return;
    setColWidths((prev) => {
      const w = window.innerWidth;
      const n = Math.max(colCount, 1);
      return Array.from({ length: colCount }, (_, i) => prev[i] ?? w / n);
    });
  }, [colCount]);

  // Cumulative left-edge x of each column
  const colStarts = useMemo(() => {
    const starts: number[] = [];
    let x = 0;
    for (let i = 0; i < allCols.length; i++) {
      starts.push(x);
      x += Math.max(0, colWidths[i] ?? 0) + DIVIDER_W;
    }
    return starts;
  }, [colWidths, allCols.length]);

  // Right off-screen: left edge pushed past the right viewport boundary (checked first)
  const rightTabIndices = useMemo(
    () => colStarts.map((s, i) => ({ s, i })).filter(({ s }) => s >= viewportW - OFFSCREEN_R).map(({ i }) => i),
    [colStarts, viewportW]
  );

  // Left-collapsed: width squeezed below threshold, but NOT already a right tab
  const leftTabIndices = useMemo(() => {
    const rightSet = new Set(rightTabIndices);
    return colWidths.map((w, i) => ({ w, i })).filter(({ w, i }) => w <= COLLAPSE_W && !rightSet.has(i)).map(({ i }) => i);
  }, [colWidths, rightTabIndices]);

  const hiddenSet = useMemo(
    () => new Set([...leftTabIndices, ...rightTabIndices]),
    [leftTabIndices, rightTabIndices]
  );

  const restoreCol = useCallback((colIdx: number) => {
    const RESTORE_W = 320;
    const vw = window.innerWidth;
    setColWidths((prev) => {
      const next = [...prev];
      next[colIdx] = RESTORE_W;
      let excess = next.reduce((a, b) => a + Math.max(0, b), 0) + (next.length - 1) * DIVIDER_W - vw;
      if (excess > 0) {
        const byWidth = next
          .map((w, i) => ({ w, i }))
          .filter(({ i }) => i !== colIdx)
          .sort((a, b) => b.w - a.w);
        for (const { i } of byWidth) {
          if (excess <= 0) break;
          const take = Math.min(next[i] - COLLAPSE_W, excess);
          if (take > 0) { next[i] -= take; excess -= take; }
        }
      }
      return next;
    });
  }, []);

  const handleDividerDrag = useCallback((dividerIdx: number, e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidths = [...colWidths];

    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      setColWidths(() => {
        const next = [...startWidths];
        // Allow full collapse to 0 — no hard minimum
        next[dividerIdx] = Math.max(0, startWidths[dividerIdx] + dx);
        next[dividerIdx + 1] = Math.max(0, startWidths[dividerIdx + 1] - dx);
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

  const tabLabel = (i: number) => {
    const tag = allCols[i];
    return tag === null ? 'untagged' : tag;
  };

  return (
    <div
      className="canvas-bg"
      style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
    >
      <PageHeader />

      {/* Columns area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        {allCols.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 13, color: '#6366f1', opacity: 0.55, fontStyle: 'italic' }}>
              Add a card with the + menu to get started
            </span>
          </div>
        ) : (
          allCols.map((tag, i) => {
            const hidden = hiddenSet.has(i);
            const nextHidden = hiddenSet.has(i + 1);
            return (
              <Fragment key={tag ?? '__untagged__'}>
                {/* Column — render at 0-width when hidden so DOM order is preserved */}
                <div style={{
                  width: hidden ? 0 : (colWidths[i] ?? 0),
                  flexShrink: 0,
                  overflow: 'hidden',
                  height: '100%',
                }}>
                  {!hidden && <TagColumn tag={tag} width={colWidths[i] ?? 0} index={i} />}
                </div>

                {/* Divider — hide if either neighbour is hidden */}
                {i < allCols.length - 1 && !hidden && !nextHidden && (
                  <div
                    onMouseDown={(e) => handleDividerDrag(i, e)}
                    style={{
                      width: DIVIDER_W, flexShrink: 0,
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
            );
          })
        )}
      </div>

      {/* LEFT bookmark tabs — columns squeezed to nothing */}
      <div style={{
        position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 40,
        display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6,
        pointerEvents: 'none',
      }}>
        <AnimatePresence>
          {leftTabIndices.map((colIdx, tabIdx) => (
            <motion.button
              key={`left-${colIdx}`}
              initial={{ x: -60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -60, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30, delay: tabIdx * 0.05 }}
              onClick={() => restoreCol(colIdx)}
              style={{
                pointerEvents: 'auto',
                width: 26,
                padding: '14px 5px',
                background: 'rgba(255,255,255,0.78)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(203,213,225,0.7)',
                borderLeft: 'none',
                borderRadius: '0 8px 8px 0',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '2px 4px 16px rgba(30,58,138,0.1)',
                outline: 'none',
                fontFamily: 'inherit',
              }}
              title={`Restore #${tabLabel(colIdx)}`}
            >
              <span style={{
                writingMode: 'vertical-rl',
                fontSize: 10,
                fontWeight: 600,
                color: '#3730a3',
                letterSpacing: '0.02em',
                whiteSpace: 'nowrap',
              }}>
                #{tabLabel(colIdx)}
              </span>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* RIGHT bookmark tabs — columns pushed off the right edge */}
      <div style={{
        position: 'fixed', right: 0, top: 0, bottom: 0, zIndex: 40,
        display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6,
        pointerEvents: 'none',
      }}>
        <AnimatePresence>
          {rightTabIndices.map((colIdx, tabIdx) => (
            <motion.button
              key={`right-${colIdx}`}
              initial={{ x: 60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 60, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30, delay: tabIdx * 0.05 }}
              onClick={() => restoreCol(colIdx)}
              style={{
                pointerEvents: 'auto',
                width: 26,
                padding: '14px 5px',
                background: 'rgba(255,255,255,0.78)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(203,213,225,0.7)',
                borderRight: 'none',
                borderRadius: '8px 0 0 8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '-2px 4px 16px rgba(30,58,138,0.1)',
                outline: 'none',
                fontFamily: 'inherit',
              }}
              title={`Restore #${tabLabel(colIdx)}`}
            >
              <span style={{
                writingMode: 'vertical-rl',
                transform: 'rotate(180deg)',
                fontSize: 10,
                fontWeight: 600,
                color: '#3730a3',
                letterSpacing: '0.02em',
                whiteSpace: 'nowrap',
              }}>
                #{tabLabel(colIdx)}
              </span>
            </motion.button>
          ))}
        </AnimatePresence>
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
