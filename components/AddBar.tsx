'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardData } from '@/types';

interface Props {
  onAdd: (type: CardData['type'], data: Record<string, unknown>) => void;
}

const barStyle = {
  backdropFilter: 'blur(28px)',
  WebkitBackdropFilter: 'blur(28px)',
};

export default function AddBar({ onAdd }: Props) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (trimmed.startsWith('/')) {
      const title = trimmed.replace(/^\/section\s*/i, '').replace(/^\//, '').trim();
      onAdd('section', { title });
      return;
    }
    const ytMatch = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) {
      onAdd('youtube', { url: trimmed, videoId: ytMatch[1] });
      return;
    }
    if (/^https?:\/\/.+\.(jpe?g|png|gif|webp|avif|svg)(\?.*)?$/i.test(trimmed)) {
      onAdd('image', { url: trimmed });
      return;
    }
    if (/^https?:\/\/.+\..+/.test(trimmed)) {
      onAdd('link', { url: trimmed });
      return;
    }
    onAdd('note', { text: trimmed });
    setValue('');
  }, [value, onAdd]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') { e.preventDefault(); handleSubmit(); }
      if (e.key === 'Escape') { setValue(''); inputRef.current?.blur(); }
    },
    [handleSubmit]
  );

  return (
    <motion.div
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        x: '-50%',
        zIndex: 50,
      }}
      animate={{ y: focused ? -6 : 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <div
        style={{
          ...barStyle,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 16px',
          borderRadius: 16,
          background: focused ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.75)',
          border: focused ? '1px solid rgba(0,0,0,0.12)' : '1px solid rgba(0,0,0,0.07)',
          boxShadow: focused
            ? '0 0 0 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.1)'
            : '0 2px 12px rgba(0,0,0,0.08)',
          transition: 'all 0.2s',
        }}
      >
        <span style={{ color: 'rgba(0,0,0,0.25)', fontSize: 18, lineHeight: 1, userSelect: 'none' }}>+</span>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Note, link, YouTube, image, or /section..."
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'rgba(0,0,0,0.65)',
            fontSize: 14,
            width: 280,
            fontFamily: 'inherit',
          }}
        />
        <AnimatePresence>
          {value && (
            <motion.button
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.12 }}
              onClick={handleSubmit}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(0,0,0,0.3)',
                cursor: 'pointer',
                fontSize: 13,
                padding: 0,
              }}
            >
              ↵
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
