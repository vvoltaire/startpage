'use client';

import { Fragment, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { CardData, Decoration } from '@/types';
import NavBubble from './NavBubble';
import PageHeader from './PageHeader';
import TagColumn from './TagColumn';
import ColumnCard from './ColumnCard';
import PipOverlay from './PipOverlay';
import SearchOverlay from './SearchOverlay';

const COLLAPSE_W = 48;
const OFFSCREEN_R = 40;
const DIVIDER_W = 3;
const HEADER_H = 68;
const COL_HEADER_H = 45; // px height of each TagColumn header row (incl. padding + border)

// ── Decoration overlay item ──────────────────────────────────────────────────
function DecorationItem({ decoration, onRemove }: { decoration: Decoration; onRemove: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      style={{
        position: 'fixed',
        left: decoration.x,
        top: decoration.y,
        zIndex: 8,
        userSelect: 'none',
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <img
        src={decoration.src}
        alt=""
        style={{
          width: decoration.width,
          height: 'auto',
          display: 'block',
          borderRadius: 6,
          pointerEvents: 'none',
        }}
        draggable={false}
      />
      {hov && (
        <button
          onClick={onRemove}
          title="Remove decoration"
          style={{
            position: 'absolute',
            top: -8, right: -8,
            width: 22, height: 22,
            borderRadius: '50%',
            background: 'rgba(15,23,42,0.65)',
            backdropFilter: 'blur(6px)',
            border: 'none',
            color: 'white',
            fontSize: 13,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            lineHeight: 1,
            pointerEvents: 'auto',
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}

// ── Background class resolver ────────────────────────────────────────────────
function bgClass(type: 'static' | 'gradient' | 'mesh', dark: boolean): string {
  if (type === 'mesh')     return dark ? 'canvas-bg-mesh-dark'   : 'canvas-bg-mesh';
  if (type === 'static')   return dark ? 'canvas-bg-static-dark' : 'canvas-bg-static';
  return dark ? 'canvas-bg-dark' : 'canvas-bg';
}

export default function HomeLayout() {
  const cards = useStore((s) => s.cards);
  const addCard = useStore((s) => s.addCard);
  const updateCard = useStore((s) => s.updateCard);
  const editMode = useStore((s) => s.editMode);
  const setEditMode = useStore((s) => s.setEditMode);
  const hiddenTags = useStore((s) => s.hiddenTags);
  const view = useStore((s) => s.view);

  // Theme
  const darkMode = useStore((s) => s.darkMode);
  const bgType = useStore((s) => s.bgType);
  const bgColor = useStore((s) => s.bgColor);
  const cardOpacity = useStore((s) => s.cardOpacity);
  const inkColor = useStore((s) => s.inkColor);

  // Decorations
  const decorations = useStore((s) => s.decorations);
  const addDecoration = useStore((s) => s.addDecoration);
  const removeDecoration = useStore((s) => s.removeDecoration);

  // ── Pending card: newly created card awaiting drop into a column ──────────
  const [pendingCardId, setPendingCardId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOverCol, setDragOverCol] = useState<number | null>(null);
  const dragStartMouse = useRef({ x: 0, y: 0 });
  const dragStartOffset = useRef({ x: 0, y: 0 });

  const tags = [...new Set(
    cards.filter((c) => c.type !== 'section').flatMap((c) => c.tags)
  )].sort();

  const hasUntagged = cards.some((c) => c.type !== 'section' && c.tags.length === 0 && c.id !== pendingCardId);
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

  // Raw starts — used only for right-tab detection (must stay raw to avoid circular dep)
  const colStarts = useMemo(() => {
    const starts: number[] = [];
    let x = 0;
    for (let i = 0; i < allCols.length; i++) {
      starts.push(x);
      x += Math.max(0, colWidths[i] ?? 0) + DIVIDER_W;
    }
    return starts;
  }, [colWidths, allCols.length]);

  const rightTabIndices = useMemo(
    () => colStarts.map((s, i) => ({ s, i })).filter(({ s }) => s >= viewportW - OFFSCREEN_R).map(({ i }) => i),
    [colStarts, viewportW]
  );

  const leftTabIndices = useMemo(() => {
    const rightSet = new Set(rightTabIndices);
    return colWidths.map((w, i) => ({ w, i })).filter(({ w, i }) => w <= COLLAPSE_W && !rightSet.has(i)).map(({ i }) => i);
  }, [colWidths, rightTabIndices]);

  const autoHiddenSet = useMemo(
    () => new Set([...leftTabIndices, ...rightTabIndices]),
    [leftTabIndices, rightTabIndices]
  );

  const tagHiddenSet = useMemo(() => {
    const s = new Set<number>();
    allCols.forEach((tag, i) => {
      if (tag !== null && hiddenTags.includes(tag)) s.add(i);
    });
    return s;
  }, [allCols, hiddenTags]);

  const allHiddenSet = useMemo(
    () => new Set([...autoHiddenSet, ...tagHiddenSet]),
    [autoHiddenSet, tagHiddenSet]
  );

  const leftTabsVisible = useMemo(
    () => leftTabIndices.filter((i) => !tagHiddenSet.has(i)),
    [leftTabIndices, tagHiddenSet]
  );
  const rightTabsVisible = useMemo(
    () => rightTabIndices.filter((i) => !tagHiddenSet.has(i)),
    [rightTabIndices, tagHiddenSet]
  );

  // Stretched display widths — visible columns always fill the viewport
  const stretchedColWidths = useMemo(() => {
    const visibleIndices = allCols.map((_, i) => i).filter((i) => !allHiddenSet.has(i));
    if (visibleIndices.length === 0) return colWidths.map(() => 0);
    const dividerCount = Math.max(visibleIndices.length - 1, 0);
    const available = viewportW - dividerCount * DIVIDER_W;
    const rawTotal = visibleIndices.reduce((sum, i) => sum + (colWidths[i] ?? 0), 0);
    if (rawTotal <= 0) {
      const equal = available / visibleIndices.length;
      return colWidths.map((_, i) => (allHiddenSet.has(i) ? 0 : equal));
    }
    const scale = available / rawTotal;
    return colWidths.map((w, i) => (allHiddenSet.has(i) ? 0 : w * scale));
  }, [colWidths, allHiddenSet, allCols, viewportW]);

  const restoreCol = useCallback((colIdx: number) => {
    setColWidths((prev) => {
      const next = [...prev];
      next[colIdx] = 320;
      return next;
    });
  }, []);

  const handleDividerDrag = useCallback((dividerIdx: number, e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidths = [...colWidths];
    const startHiddenSet = new Set(allHiddenSet);
    // Compute scale at drag start so screen-pixel delta maps to correct raw-width delta
    const visibleRawTotal = startWidths.reduce((sum, w, i) => (startHiddenSet.has(i) ? sum : sum + w), 0);
    const visibleCount = startWidths.filter((_, i) => !startHiddenSet.has(i)).length;
    const available = viewportW - Math.max(visibleCount - 1, 0) * DIVIDER_W;
    const scale = visibleRawTotal > 0 ? available / visibleRawTotal : 1;

    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      const rawDx = scale > 0 ? dx / scale : dx;
      setColWidths(() => {
        const next = [...startWidths];
        if (rawDx >= 0) {
          // Dragging right: left col grows; cascade shrink rightward from dividerIdx+1
          // Each neighbor must be fully absorbed before the next one starts shrinking.
          let remaining = rawDx;
          for (let j = dividerIdx + 1; j < next.length && remaining > 0; j++) {
            if (startHiddenSet.has(j)) continue;
            const canShrink = startWidths[j]; // allow full collapse → tab
            const take = Math.min(remaining, canShrink);
            next[j] = startWidths[j] - take;
            remaining -= take;
          }
          next[dividerIdx] = startWidths[dividerIdx] + (rawDx - remaining);
        } else {
          // Dragging left: right col grows; cascade shrink leftward from dividerIdx
          const absDx = -rawDx;
          let remaining = absDx;
          for (let j = dividerIdx; j >= 0 && remaining > 0; j--) {
            if (startHiddenSet.has(j)) continue;
            const canShrink = startWidths[j]; // allow full collapse → tab
            const take = Math.min(remaining, canShrink);
            next[j] = startWidths[j] - take;
            remaining -= take;
          }
          next[dividerIdx + 1] = startWidths[dividerIdx + 1] + (absDx - remaining);
        }
        return next;
      });
    };

    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [colWidths, allHiddenSet, viewportW]);

  // Gallery-only: create card then show floating placement overlay
  const handleAdd = useCallback(
    (type: CardData['type'], data: Record<string, unknown>) => {
      const id = crypto.randomUUID();
      const colW = Math.max(200, Math.floor(window.innerWidth / 4) - 28);
      const sizes: Partial<Record<CardData['type'], [number, number]>> = {
        youtube: [colW, Math.round(colW * 0.62)],
        image:   [colW, Math.round(colW * 0.68)],
        link:    [colW, Math.round(colW * 0.62)],
        note:    [colW, Math.round(colW * 0.52)],
        audio:   [colW, 88],
      };
      const [w, h] = sizes[type] ?? [colW, Math.round(colW * 0.6)];
      addCard({ type, x: 0, y: 0, width: w, height: h, data, tags: [], starred: false, id });
      setPendingCardId(id);
      setDragOffset({ x: 0, y: 0 });
    },
    [addCard]
  );

  // ── Spatial canvas: OS file drag-drop ────────────────────────────────────
  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (e.dataTransfer.types.includes('Files')) e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const x = e.clientX;
    const y = e.clientY;
    const reader = new FileReader();

    if (file.type === 'image/gif') {
      // GIF on background → Decoration (no card wrapper)
      reader.onload = (ev) => {
        addDecoration({
          id: crypto.randomUUID(),
          x,
          y,
          src: ev.target?.result as string,
          width: 200,
        });
      };
      reader.readAsDataURL(file);
    } else if (file.type.startsWith('image/')) {
      reader.onload = (ev) => { handleAdd('image', { src: ev.target?.result as string }); };
      reader.readAsDataURL(file);
    } else if (file.type.startsWith('audio/')) {
      reader.onload = (ev) => { handleAdd('audio', { src: ev.target?.result as string, name: file.name }); };
      reader.readAsDataURL(file);
    }
  }, [addDecoration, handleAdd]);

  // ── Floating card drag ────────────────────────────────────────────────────
  const findColumnAtX = useCallback((x: number): number => {
    let left = 0;
    for (let i = 0; i < allCols.length; i++) {
      if (allHiddenSet.has(i)) continue;
      const w = stretchedColWidths[i] ?? 0;
      if (x >= left && x <= left + w) return i;
      left += w + DIVIDER_W;
    }
    return -1;
  }, [allCols, allHiddenSet, stretchedColWidths]);

  const handleFloatPointerDown = useCallback((e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStartMouse.current = { x: e.clientX, y: e.clientY };
    dragStartOffset.current = { ...dragOffset };
    setIsDragging(true);
  }, [dragOffset]);

  const handleFloatPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartMouse.current.x;
    const dy = e.clientY - dragStartMouse.current.y;
    setDragOffset({ x: dragStartOffset.current.x + dx, y: dragStartOffset.current.y + dy });
    setDragOverCol(findColumnAtX(e.clientX));
  }, [isDragging, findColumnAtX]);

  const handleFloatPointerUp = useCallback((e: React.PointerEvent) => {
    setIsDragging(false);
    if (pendingCardId) {
      const col = findColumnAtX(e.clientX);
      if (col !== -1) {
        const tag = allCols[col];
        updateCard(pendingCardId, { tags: tag ? [tag] : [] });
      }
    }
    setPendingCardId(null);
    setDragOffset({ x: 0, y: 0 });
    setDragOverCol(null);
  }, [pendingCardId, findColumnAtX, allCols, updateCard]);

  const pendingCard = pendingCardId ? cards.find((c) => c.id === pendingCardId) ?? null : null;

  const tabLabel = (i: number) => {
    const tag = allCols[i];
    if (tag === null) return 'Untagged';
    return tag.charAt(0).toUpperCase() + tag.slice(1);
  };

  const inkSubtle = darkMode ? '#94a3b8' : '#64748b';

  return (
    <div
      className={bgClass(bgType, darkMode)}
      style={{
        '--ink-color': inkColor,
        '--ink-subtle': inkSubtle,
        '--bg-color': bgColor,
        '--card-opacity': String(cardOpacity),
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
      } as React.CSSProperties}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* PageHeader is now fixed — no longer a flex child */}
      <PageHeader />

      {/* ── Decoration layer (z-index 8, above bg, below nav overlays) ──────── */}
      {decorations.map((d) => (
        <DecorationItem
          key={d.id}
          decoration={d}
          onRemove={() => removeDecoration(d.id)}
        />
      ))}

      {/* Columns area — padded top so content clears the fixed header */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0, paddingTop: HEADER_H }}>
        {allCols.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 13, color: '#64748b', opacity: 0.7, fontStyle: 'italic' }}>
              {view === 'home'
                ? 'Toggle sections in Gallery to curate your Home view'
                : 'Add a card with the + button to get started'}
            </span>
          </div>
        ) : (
          allCols.map((tag, i) => {
            const hidden = allHiddenSet.has(i);
            // Find next visible column (may skip hidden ones)
            let nextVisIdx = -1;
            for (let j = i + 1; j < allCols.length; j++) {
              if (!allHiddenSet.has(j)) { nextVisIdx = j; break; }
            }
            // Only allow drag-resize when next visible is directly adjacent (no hidden gap)
            const isAdjacentToNext = nextVisIdx === i + 1;

            return (
              <Fragment key={tag ?? '__untagged__'}>
                <div style={{
                  width: hidden ? 0 : (stretchedColWidths[i] ?? 0),
                  flexShrink: 0,
                  overflow: 'hidden',
                  height: '100%',
                }}>
                  {!hidden && (
                    <TagColumn
                      tag={tag}
                      width={stretchedColWidths[i] ?? 0}
                      index={i}
                      isDropTarget={dragOverCol === i && pendingCardId !== null}
                    />
                  )}
                </div>

                {/* Divider — single div; gradient keeps wall below the header underline */}
                {!hidden && nextVisIdx !== -1 && (
                  <div
                    onMouseDown={isAdjacentToNext ? (e) => handleDividerDrag(i, e) : undefined}
                    style={{
                      width: DIVIDER_W, flexShrink: 0,
                      background: `linear-gradient(to bottom, transparent ${COL_HEADER_H}px, rgba(100,116,139,0.12) ${COL_HEADER_H}px)`,
                      cursor: isAdjacentToNext ? 'col-resize' : 'default',
                      zIndex: 1,
                    }}
                    onMouseEnter={isAdjacentToNext ? (e) => (e.currentTarget.style.background = `linear-gradient(to bottom, transparent ${COL_HEADER_H}px, rgba(100,116,139,0.3) ${COL_HEADER_H}px)`) : undefined}
                    onMouseLeave={isAdjacentToNext ? (e) => (e.currentTarget.style.background = `linear-gradient(to bottom, transparent ${COL_HEADER_H}px, rgba(100,116,139,0.12) ${COL_HEADER_H}px)`) : undefined}
                  />
                )}
              </Fragment>
            );
          })
        )}
      </div>

      {/* LEFT bookmark tabs */}
      <div style={{
        position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 40,
        display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6,
        pointerEvents: 'none',
      }}>
        <AnimatePresence>
          {leftTabsVisible.map((colIdx, tabIdx) => (
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
                background: 'rgba(255,255,255,0.88)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(148,163,184,0.5)',
                borderLeft: 'none',
                borderRadius: '0 8px 8px 0',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '2px 4px 16px rgba(15,23,42,0.08)',
                outline: 'none',
                fontFamily: 'inherit',
              }}
              title={`Restore ${tabLabel(colIdx)}`}
            >
              <span style={{
                writingMode: 'vertical-rl',
                fontSize: 10,
                fontWeight: 600,
                color: '#1e293b',
                letterSpacing: '0.02em',
                whiteSpace: 'nowrap',
              }}>
                {tabLabel(colIdx)}
              </span>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* RIGHT bookmark tabs */}
      <div style={{
        position: 'fixed', right: 0, top: 0, bottom: 0, zIndex: 40,
        display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6,
        pointerEvents: 'none',
      }}>
        <AnimatePresence>
          {rightTabsVisible.map((colIdx, tabIdx) => (
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
                background: 'rgba(255,255,255,0.88)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(148,163,184,0.5)',
                borderRight: 'none',
                borderRadius: '8px 0 0 8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '-2px 4px 16px rgba(15,23,42,0.08)',
                outline: 'none',
                fontFamily: 'inherit',
              }}
              title={`Restore ${tabLabel(colIdx)}`}
            >
              <span style={{
                writingMode: 'vertical-rl',
                transform: 'rotate(180deg)',
                fontSize: 10,
                fontWeight: 600,
                color: '#1e293b',
                letterSpacing: '0.02em',
                whiteSpace: 'nowrap',
              }}>
                {tabLabel(colIdx)}
              </span>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* NavBubble — shown in both modes; internally hides add/edit in home */}
      <NavBubble onAdd={handleAdd} />

      {/* Exit edit mode bar — gallery only */}
      {view === 'gallery' && (
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
                  background: 'rgba(255,255,255,0.88)',
                  border: '1px solid rgba(100,116,139,0.2)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  color: '#475569', fontSize: 13,
                  cursor: 'pointer', fontFamily: 'inherit', outline: 'none',
                }}
              >
                exit edit mode
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Global overlays */}
      <PipOverlay />
      <SearchOverlay />

      {/* Floating new card — appears centered, user drags to a section column */}
      <AnimatePresence>
        {pendingCard && (
          <motion.div
            key="pending-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{ position: 'fixed', inset: 0, zIndex: 200, pointerEvents: 'auto' }}
          >
            {/* Scrim */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(15,23,42,0.38)',
              backdropFilter: 'blur(3px)',
            }} />

            {/* Label above card */}
            <div style={{
              position: 'absolute',
              left: '50%',
              top: 'calc(50% - 130px)',
              transform: `translateX(calc(-50% + ${dragOffset.x}px))`,
              pointerEvents: 'none',
              textAlign: 'center',
            }}>
              <span style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.82)',
                fontWeight: 500,
                letterSpacing: '0.05em',
                background: 'rgba(15,23,42,0.45)',
                padding: '5px 14px',
                borderRadius: 20,
                whiteSpace: 'nowrap',
              }}>
                {isDragging ? 'Drop into a section' : 'Drag to a section to place'}
              </span>
            </div>

            {/* Draggable card wrapper */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: `translate(calc(-50% + ${dragOffset.x}px), calc(-50% + ${dragOffset.y}px))`,
                cursor: isDragging ? 'grabbing' : 'grab',
                touchAction: 'none',
                userSelect: 'none',
                filter: 'drop-shadow(0 16px 40px rgba(15,23,42,0.28))',
              }}
              onPointerDown={handleFloatPointerDown}
              onPointerMove={handleFloatPointerMove}
              onPointerUp={handleFloatPointerUp}
            >
              <ColumnCard card={pendingCard} floating />
              {/* Pointer capture overlay — absorbs all inner card clicks during placement */}
              <div style={{ position: 'absolute', inset: 0, borderRadius: 16 }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
