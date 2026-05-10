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
      }}
    >
      {/* Centered title — absolutely positioned so it stays truly centered */}
      <div style={{
        position: 'absolute',
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        <motion.a
          href="/"
          initial={{ opacity: 0, scale: 0.88, filter: 'blur(8px)' }}
          animate={visible ? { opacity: 1, scale: 1, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          style={{
            pointerEvents: 'auto',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(255, 255, 255, 0.45)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRadius: 40,
            padding: '6px 22px',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.85), 0 2px 14px rgba(15,23,42,0.07)',
          }}
        >
          <span style={{
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: 'var(--ink-color, #1e293b)',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
            lineHeight: 1,
          }}>
            Vinsline&apos;s
          </span>
          <span style={{
            fontSize: 20,
            fontWeight: 400,
            letterSpacing: '-0.01em',
            color: 'var(--ink-subtle, #64748b)',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
            lineHeight: 1,
          }}>
            Start Page
          </span>
        </motion.a>
      </div>

      {/* Spacer so right controls don't overlap title */}
      <div style={{ flex: 1 }} />

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, zIndex: 1 }}>
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
    </div>
  );
}
