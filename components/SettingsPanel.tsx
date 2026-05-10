'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';

interface Props {
  onOpenChange?: (open: boolean) => void;
}

export default function SettingsPanel({ onOpenChange }: Props) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleSetOpen = (v: boolean) => { setOpen(v); onOpenChange?.(v); };

  const zenMode = useStore((s) => s.zenMode);
  const setZenMode = useStore((s) => s.setZenMode);
  const darkMode = useStore((s) => s.darkMode);
  const setDarkMode = useStore((s) => s.setDarkMode);
  const bgType = useStore((s) => s.bgType);
  const setBgType = useStore((s) => s.setBgType);
  const bgColor = useStore((s) => s.bgColor);
  const setBgColor = useStore((s) => s.setBgColor);
  const cardOpacity = useStore((s) => s.cardOpacity);
  const setCardOpacity = useStore((s) => s.setCardOpacity);
  const inkColor = useStore((s) => s.inkColor);
  const setInkColor = useStore((s) => s.setInkColor);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        handleSetOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={panelRef} style={{ position: 'relative', marginLeft: 10 }}>
      {/* Gear button */}
      <button
        onClick={() => handleSetOpen(!open)}
        title="Settings"
        style={{
          width: 32, height: 32,
          borderRadius: '50%',
          background: open ? 'rgba(100,116,139,0.15)' : 'transparent',
          border: '1px solid rgba(100,116,139,0.22)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          outline: 'none',
          transition: 'background 0.15s, border-color 0.15s',
          color: '#64748b',
          fontSize: 15,
          flexShrink: 0,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(100,116,139,0.45)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(100,116,139,0.22)'; }}
      >
        ⚙
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 10px)',
              right: 0,
              width: 272,
              background: 'rgba(255,255,255,0.97)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(100,116,139,0.15)',
              borderRadius: 20,
              boxShadow: '0 8px 48px rgba(15,23,42,0.14), 0 1px 0 rgba(255,255,255,0.8) inset',
              padding: '18px 20px',
              zIndex: 200,
            }}
          >
            {/* Section: Workspace */}
            <SectionLabel>Workspace</SectionLabel>

            <SettingRow label="Clear Screen">
              <Toggle value={zenMode} onChange={setZenMode} />
            </SettingRow>

            <SettingRow label="Dark Mode">
              <Toggle value={darkMode} onChange={setDarkMode} />
            </SettingRow>

            <Divider />

            {/* Section: Background */}
            <SectionLabel>Background</SectionLabel>

            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              {(['static', 'gradient', 'mesh'] as const).map((type) => {
                const labels = { static: 'Flat', gradient: 'Gradient', mesh: 'Mesh' };
                const active = bgType === type;
                return (
                  <button
                    key={type}
                    onClick={() => setBgType(type)}
                    style={{
                      flex: 1,
                      padding: '6px 0',
                      borderRadius: 9,
                      border: `1.5px solid ${active ? 'rgba(99,102,241,0.5)' : 'rgba(100,116,139,0.18)'}`,
                      background: active ? 'rgba(99,102,241,0.08)' : 'transparent',
                      fontSize: 11,
                      color: active ? '#6366f1' : '#64748b',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontWeight: active ? 600 : 400,
                      transition: 'all 0.12s',
                      outline: 'none',
                    }}
                  >
                    {labels[type]}
                  </button>
                );
              })}
            </div>

            {bgType === 'static' && (
              <SettingRow label="Background Color">
                <ColorSwatch color={bgColor} onChange={setBgColor} />
              </SettingRow>
            )}

            <Divider />

            {/* Section: Cards */}
            <SectionLabel>Cards</SectionLabel>

            <SettingRow label="Glass Opacity">
              <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 'auto', marginRight: 8 }}>
                {Math.round(cardOpacity * 100)}%
              </span>
            </SettingRow>
            <input
              type="range"
              min={0.35}
              max={1}
              step={0.05}
              value={cardOpacity}
              onChange={(e) => setCardOpacity(parseFloat(e.target.value))}
              style={{
                width: '100%',
                marginBottom: 12,
                accentColor: '#6366f1',
                cursor: 'pointer',
              }}
            />

            <SettingRow label="Ink Color">
              <ColorSwatch color={inkColor} onChange={setInkColor} />
            </SettingRow>

            <div style={{ marginTop: 14, fontSize: 10, color: '#94a3b8', textAlign: 'center', fontStyle: 'italic' }}>
              Settings saved automatically
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 10,
      fontWeight: 700,
      color: '#94a3b8',
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      marginBottom: 12,
    }}>
      {children}
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: 'rgba(100,116,139,0.1)', margin: '14px 0' }} />;
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
    }}>
      <span style={{ fontSize: 13, color: '#475569', fontWeight: 400 }}>{label}</span>
      {children}
    </div>
  );
}

function ColorSwatch({ color, onChange }: { color: string; onChange: (v: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
      onClick={() => inputRef.current?.click()}
    >
      <div style={{
        width: 24, height: 24,
        borderRadius: 7,
        background: color,
        border: '2px solid rgba(100,116,139,0.18)',
        flexShrink: 0,
        boxShadow: '0 1px 4px rgba(15,23,42,0.08)',
        transition: 'box-shadow 0.15s',
      }} />
      <span style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace', letterSpacing: '0.02em' }}>
        {color}
      </span>
      <input
        ref={inputRef}
        type="color"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
      />
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      style={{
        width: 40, height: 22,
        borderRadius: 11,
        background: value ? '#6366f1' : 'rgba(100,116,139,0.25)',
        position: 'relative',
        cursor: 'pointer',
        transition: 'background 0.22s ease',
        flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute',
        top: 3,
        left: value ? 21 : 3,
        width: 16, height: 16,
        borderRadius: '50%',
        background: 'white',
        boxShadow: '0 1px 4px rgba(0,0,0,0.22)',
        transition: 'left 0.22s ease',
      }} />
    </div>
  );
}
