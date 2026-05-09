'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { CardData } from '@/types';
import Card from './Card';
import NavBubble from './NavBubble';

interface DrawRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function Canvas() {
  const cards = useStore((state) => state.cards);
  const addCard = useStore((state) => state.addCard);
  const editMode = useStore((state) => state.editMode);
  const setEditMode = useStore((state) => state.setEditMode);
  const containerRef = useRef<HTMLDivElement>(null);

  const [drawMode, setDrawMode] = useState(false);
  const isDrawing = useRef(false);
  const drawStart = useRef({ x: 0, y: 0 });
  const [drawRect, setDrawRect] = useState<DrawRect | null>(null);

  useEffect(() => {
    if (!drawMode) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDrawMode(false);
        setDrawRect(null);
        isDrawing.current = false;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawMode]);

  const toCanvas = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-card]')) return;
    if (!drawMode) return;
    e.preventDefault();
    isDrawing.current = true;
    const { x, y } = toCanvas(e.clientX, e.clientY);
    drawStart.current = { x, y };
    setDrawRect({ x, y, width: 0, height: 0 });
  }, [drawMode, toCanvas]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!drawMode || !isDrawing.current) return;
    const { x, y } = toCanvas(e.clientX, e.clientY);
    setDrawRect({
      x: Math.min(x, drawStart.current.x),
      y: Math.min(y, drawStart.current.y),
      width: Math.abs(x - drawStart.current.x),
      height: Math.abs(y - drawStart.current.y),
    });
  }, [drawMode, toCanvas]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!drawMode || !isDrawing.current) return;
    isDrawing.current = false;
    const { x, y } = toCanvas(e.clientX, e.clientY);
    const rx = Math.min(x, drawStart.current.x);
    const ry = Math.min(y, drawStart.current.y);
    const rw = Math.abs(x - drawStart.current.x);
    const rh = Math.abs(y - drawStart.current.y);
    if (rw > 60 && rh > 40) {
      addCard({ type: 'section', x: rx, y: ry, width: rw, height: rh, data: { title: '' }, tags: [], starred: false, zIndex: 1 });
    }
    setDrawRect(null);
    setDrawMode(false);
  }, [drawMode, toCanvas, addCard]);

  const addCardAtCenter = useCallback(
    (type: CardData['type'], data: Record<string, unknown>) => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const sizes: Partial<Record<CardData['type'], [number, number]>> = {
        youtube: [400, 272],
        image:   [300, 300],
        link:    [300, 240],
        note:    [300, 200],
      };
      const [w, h] = sizes[type] ?? [300, 200];
      addCard({ type, x: vw / 2 - w / 2, y: vh / 2 - h / 2, width: w, height: h, data, tags: [], starred: false });
    },
    [addCard]
  );

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <div
        ref={containerRef}
        className="canvas-bg"
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          cursor: drawMode ? 'crosshair' : 'default',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {cards.map((card) => (
          <Card key={card.id} card={card} />
        ))}

        {drawRect && drawRect.width > 0 && drawRect.height > 0 && (
          <div
            style={{
              position: 'absolute',
              left: drawRect.x,
              top: drawRect.y,
              width: drawRect.width,
              height: drawRect.height,
              borderRadius: 24,
              background: 'rgba(255,255,255,0.04)',
              border: '2px dashed rgba(255,255,255,0.2)',
              pointerEvents: 'none',
              boxSizing: 'border-box',
            }}
          />
        )}
      </div>

      <NavBubble onAdd={addCardAtCenter} />

      {/* Bottom center: trash zone in edit mode, gallery arrow otherwise */}
      <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 50, display: 'flex', alignItems: 'center', gap: 10 }}>
        <AnimatePresence mode="wait">
          {editMode ? (
            <motion.div
              key="trash-zone"
              initial={{ y: 16, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 16, opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 420, damping: 26 }}
              style={{ display: 'flex', alignItems: 'center', gap: 10 }}
            >
              <div
                data-trash="true"
                style={{
                  height: 44, padding: '0 20px',
                  borderRadius: 22,
                  background: 'rgba(255,60,60,0.1)',
                  border: '1.5px dashed rgba(255,80,80,0.35)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  display: 'flex', alignItems: 'center', gap: 8,
                  color: 'rgba(255,140,140,0.75)', fontSize: 13,
                  userSelect: 'none',
                }}
              >
                <span style={{ fontSize: 16 }}>🗑</span>
                drag cards here to delete
              </div>
              <button
                onClick={() => setEditMode(false)}
                style={{
                  height: 44, padding: '0 18px', borderRadius: 22,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.14)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  color: 'rgba(255,255,255,0.45)', fontSize: 13,
                  cursor: 'pointer', fontFamily: 'inherit', outline: 'none',
                }}
              >
                exit edit mode
              </button>
            </motion.div>
          ) : (
            <motion.button
              key="gallery-arrow"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              style={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '50%',
                width: 36, height: 36,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                color: 'rgba(255,255,255,0.45)',
                fontSize: 16, outline: 'none',
              }}
              whileHover={{ scale: 1.08, backgroundColor: 'rgba(255,255,255,0.16)' }}
              whileTap={{ scale: 0.94 }}
              aria-label="Gallery"
            >
              ↓
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
