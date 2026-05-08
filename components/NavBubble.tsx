'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';

const glassStyle = {
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  background: 'rgba(255,255,255,0.85)',
  border: '1px solid rgba(0,0,0,0.07)',
};

export default function NavBubble() {
  const [open, setOpen] = useState(false);
  const cardCount = useStore((state) => state.cards.length);

  return (
    <div style={{ position: 'fixed', top: 20, left: 20, zIndex: 50 }}>
      <motion.button
        onClick={() => setOpen((o) => !o)}
        style={{
          ...glassStyle,
          width: 36,
          height: 36,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          border: '1px solid rgba(255,255,255,0.09)',
        }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        aria-label="Open navigation"
      >
        <span style={{ color: 'rgba(0,0,0,0.35)', fontSize: 14, userSelect: 'none' }}>⌘</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: -6 }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            style={{
              ...glassStyle,
              marginTop: 8,
              padding: 8,
              borderRadius: 16,
              minWidth: 180,
            }}
          >
            <p style={{ color: 'rgba(0,0,0,0.3)', fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '4px 8px 8px', userSelect: 'none' }}>
              Homebase
            </p>
            <NavItem active>Canvas</NavItem>
            <NavItem disabled>Gallery</NavItem>
            <NavItem disabled>Tags</NavItem>
            <div style={{ marginTop: 8, paddingTop: 8, padding: '8px 8px 4px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              <span style={{ color: 'rgba(0,0,0,0.25)', fontSize: 12 }}>
                {cardCount} card{cardCount !== 1 ? 's' : ''}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavItem({ children, active, disabled }: { children: React.ReactNode; active?: boolean; disabled?: boolean }) {
  return (
    <div style={{
      padding: '6px 8px',
      borderRadius: 8,
      fontSize: 14,
      userSelect: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      color: disabled ? 'rgba(0,0,0,0.2)' : active ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.45)',
    }}>
      {children}
    </div>
  );
}
