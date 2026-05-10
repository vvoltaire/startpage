'use client';

import { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { PipWindow } from '@/types';

export default function PipOverlay() {
  const pipWindows = useStore((s) => s.pipWindows);
  const closePip = useStore((s) => s.closePip);
  const movePip = useStore((s) => s.movePip);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 900, pointerEvents: 'none' }}>
      <AnimatePresence>
        {pipWindows.map((pip) => (
          <PipItem
            key={pip.id}
            pip={pip}
            onClose={() => closePip(pip.id)}
            onMove={(x, y) => movePip(pip.id, x, y)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function PipItem({
  pip,
  onClose,
  onMove,
}: {
  pip: PipWindow;
  onClose: () => void;
  onMove: (x: number, y: number) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ mx: 0, my: 0, px: 0, py: 0 });

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      dragStart.current = { mx: e.clientX, my: e.clientY, px: pip.x, py: pip.y };
      setDragging(true);
    },
    [pip.x, pip.y],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      onMove(
        dragStart.current.px + e.clientX - dragStart.current.mx,
        dragStart.current.py + e.clientY - dragStart.current.my,
      );
    },
    [dragging, onMove],
  );

  const handlePointerUp = useCallback(() => setDragging(false), []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.88, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.88, y: 24 }}
      transition={{ type: 'spring', stiffness: 440, damping: 32 }}
      style={{
        position: 'absolute',
        left: pip.x,
        top: pip.y,
        width: pip.width,
        height: pip.height,
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 20px 72px rgba(15,23,42,0.42), 0 2px 8px rgba(15,23,42,0.2)',
        pointerEvents: 'auto',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        background: '#000',
      }}
    >
      {/* Title bar — drag handle */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          height: 38,
          background: 'rgba(15,23,42,0.9)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          cursor: dragging ? 'grabbing' : 'grab',
          flexShrink: 0,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', flexShrink: 0 }}>▶</span>
          <span style={{
            fontSize: 11,
            fontWeight: 500,
            color: 'rgba(255,255,255,0.65)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {pip.title}
          </span>
        </div>
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onClose}
          title="Close"
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: 'none',
            borderRadius: '50%',
            width: 22,
            height: 22,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.6)',
            fontSize: 15,
            lineHeight: 1,
            flexShrink: 0,
            marginLeft: 10,
            transition: 'background 0.12s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,60,60,0.35)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minHeight: 0 }}>
        {pip.type === 'youtube' && pip.videoId && (
          <iframe
            src={`https://www.youtube.com/embed/${pip.videoId}?autoplay=1&rel=0`}
            style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>
    </motion.div>
  );
}
