'use client';

import { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { CardData } from '@/types';
import NoteCard from './cards/NoteCard';
import LinkCard from './cards/LinkCard';
import YouTubeCard from './cards/YouTubeCard';
import ImageCard from './cards/ImageCard';

interface Props {
  card: CardData;
}

export default function Card({ card }: Props) {
  const updateCard = useStore((state) => state.updateCard);
  const removeCard = useStore((state) => state.removeCard);
  const bringToFront = useStore((state) => state.bringToFront);
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDragStart = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      bringToFront(card.id);

      const startMouseX = e.clientX;
      const startMouseY = e.clientY;
      const startX = card.x;
      const startY = card.y;

      const onMove = (ev: PointerEvent) => {
        const x = startX + (ev.clientX - startMouseX);
        const y = startY + (ev.clientY - startMouseY);
        if (cardRef.current) {
          cardRef.current.style.left = `${x}px`;
          cardRef.current.style.top = `${y}px`;
        }
      };

      const onUp = (ev: PointerEvent) => {
        const x = startX + (ev.clientX - startMouseX);
        const y = startY + (ev.clientY - startMouseY);
        updateCard(card.id, { x, y });
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
      };

      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
    },
    [card.id, card.x, card.y, bringToFront, updateCard]
  );

  const handleResizeStart = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const startMouseX = e.clientX;
      const startMouseY = e.clientY;
      const startW = card.width;
      const startH = card.height;

      const onMove = (ev: PointerEvent) => {
        const w = Math.max(200, startW + (ev.clientX - startMouseX));
        const h = Math.max(100, startH + (ev.clientY - startMouseY));
        if (cardRef.current) {
          cardRef.current.style.width = `${w}px`;
          cardRef.current.style.height = `${h}px`;
        }
      };

      const onUp = (ev: PointerEvent) => {
        const w = Math.max(200, startW + (ev.clientX - startMouseX));
        const h = Math.max(100, startH + (ev.clientY - startMouseY));
        updateCard(card.id, { width: w, height: h });
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
      };

      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
    },
    [card.id, card.width, card.height, updateCard]
  );

  return (
    <motion.div
      ref={cardRef}
      data-card="true"
      initial={card.type === 'section' ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={card.type === 'section'
        ? { duration: 0.25 }
        : { type: 'spring', stiffness: 380, damping: 28 }}
      style={{
        position: 'absolute',
        left: card.x,
        top: card.y,
        width: card.width,
        height: card.height,
        zIndex: card.zIndex,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: card.type === 'section' ? 24 : 16,
        overflow: 'hidden',
      }}
      className={card.type === 'section' ? 'card-section' : 'card-glass'}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onPointerDown={(e) => {
        e.stopPropagation();
        if (card.type !== 'section') bringToFront(card.id);
      }}
    >
      {/* Drag handle */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: card.type === 'section' ? '16px 18px 10px' : '10px 12px 6px',
          flexShrink: 0,
          cursor: 'grab',
          userSelect: 'none',
        }}
        onPointerDown={handleDragStart}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
          {card.type === 'section' ? (
            <input
              value={(card.data.title as string) ?? ''}
              onChange={(e) => updateCard(card.id, { data: { ...card.data, title: e.target.value } })}
              onPointerDown={(e) => e.stopPropagation()}
              placeholder="Section name"
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                fontSize: 15, fontWeight: 600, color: 'rgba(0,0,0,0.38)',
                letterSpacing: '-0.02em', fontFamily: 'inherit', cursor: 'text',
                width: '100%', minWidth: 0,
              }}
            />
          ) : (
            <>
              <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                {[0, 1, 2].map((i) => (
                  <span key={i} style={{ display: 'block', width: 4, height: 4, borderRadius: '50%', background: 'rgba(0,0,0,0.12)' }} />
                ))}
              </div>
              <span style={{ color: 'rgba(0,0,0,0.2)', fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {card.type}
              </span>
            </>
          )}
        </div>

        <AnimatePresence>
          {hovered && (
            <motion.button
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.12 }}
              onPointerDown={(e) => {
                e.stopPropagation();
                removeCard(card.id);
              }}
              style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                border: 'none',
                background: 'transparent',
                color: 'rgba(0,0,0,0.25)',
                cursor: 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                lineHeight: 1,
                padding: 0,
              }}
              aria-label="Delete card"
            >
              ×
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
        {card.type === 'note' ? <NoteCard card={card} />
          : card.type === 'link' ? <LinkCard card={card} />
          : card.type === 'youtube' ? <YouTubeCard card={card} />
          : card.type === 'image' ? <ImageCard card={card} />
          : null}
      </div>

      {/* Resize handle — hidden for sections (still functional) */}
      <div
        style={{
          position: 'absolute',
          bottom: 6,
          right: 6,
          width: 12,
          height: 12,
          cursor: 'se-resize',
          background: card.type === 'section'
            ? 'transparent'
            : 'linear-gradient(135deg, transparent 40%, rgba(0,0,0,0.12) 40%)',
          borderRadius: 2,
        }}
        onPointerDown={handleResizeStart}
      />
    </motion.div>
  );
}
