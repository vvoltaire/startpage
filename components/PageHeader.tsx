'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import SettingsPanel from './SettingsPanel';

export default function PageHeader() {
  const [visible, setVisible] = useState(false);
  const [hoveringTop, setHoveringTop] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const view = useStore((s) => s.view);
  const setView = useStore((s) => s.setView);
  const zenMode = useStore((s) => s.zenMode);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Track mouse Y for zen mode reveal zone (top 50px)
  useEffect(() => {
    if (!zenMode) { setHoveringTop(false); return; }
    const handler = (e: MouseEvent) => setHoveringTop(e.clientY <= 50);
    window.addEventListener('mousemove', handler);
    return () => { window.removeEventListener('mousemove', handler); setHoveringTop(false); };
  }, [zenMode]);

  const revealed = !zenMode || hoveringTop || settingsOpen;

  return (
    <div
      className="header-zen-wrapper"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 68,
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 76,
        paddingRight: 20,
        zIndex: 30,
        opacity: revealed ? 1 : 0,
        pointerEvents: revealed ? 'auto' : 'none',
        // subtle glass so title floats over the bg without a harsh bar
        backdropFilter: 'blur(0px)',
        WebkitBackdropFilter: 'blur(0px)',
      }}
    >
      {/* Title */}
      <a
        href="/"
        style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: 10, flex: 1 }}
      >
        <motion.span
          initial={{ opacity: 0, scale: 0.82, filter: 'blur(10px)' }}
          animate={visible ? { opacity: 1, scale: 1, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: '0.05em',
            color: 'var(--ink-color, #1e293b)',
            fontFamily: '"Playfair Display", Georgia, serif',
            lineHeight: 1,
          }}
        >
          Vinsline&apos;s
        </motion.span>
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={visible ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.28 }}
          style={{
            fontSize: 28,
            fontWeight: 400,
            letterSpacing: '0.12em',
            color: 'var(--ink-subtle, #64748b)',
            fontFamily: '"Playfair Display", Georgia, serif',
            fontStyle: 'italic',
            lineHeight: 1,
          }}
        >
          Start Page
        </motion.span>
      </a>

      {/* Home / Gallery segmented toggle */}
      <div style={{
        display: 'flex',
        background: 'rgba(100,116,139,0.09)',
        borderRadius: 20,
        padding: 3,
        gap: 2,
      }}>
        {(['home', 'gallery'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              padding: '4px 16px',
              borderRadius: 16,
              fontSize: 12,
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              background: view === v ? 'rgba(255,255,255,0.9)' : 'transparent',
              color: view === v ? '#1e293b' : '#64748b',
              boxShadow: view === v ? '0 1px 4px rgba(15,23,42,0.1)' : 'none',
              transition: 'all 0.15s',
              textTransform: 'capitalize',
              backdropFilter: view === v ? 'blur(8px)' : 'none',
            }}
          >
            {v}
          </button>
        ))}
      </div>

      {/* Settings gear */}
      <SettingsPanel onOpenChange={setSettingsOpen} />
    </div>
  );
}
