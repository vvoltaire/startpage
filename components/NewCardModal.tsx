'use client';

import { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardType } from '@/types';

interface Props {
  onAdd: (type: CardType, data: Record<string, unknown>) => void;
  onClose: () => void;
}

type Step = 'type' | 'url';

const CARD_TYPES = [
  { type: 'note' as CardType,    label: 'Note',        icon: '≡',  needsUrl: false, needsFile: false },
  { type: 'link' as CardType,    label: 'Link',        icon: '↗',  needsUrl: true,  needsFile: false },
  { type: 'youtube' as CardType, label: 'YouTube',     icon: '▶',  needsUrl: true,  needsFile: false },
  { type: 'image' as CardType,   label: 'Image URL',   icon: '▣',  needsUrl: true,  needsFile: false },
  { type: 'image' as CardType,   label: 'Image file',  icon: '▤',  needsUrl: false, needsFile: true,  accept: 'image/*,image/gif' },
  { type: 'audio' as CardType,   label: 'Audio file',  icon: '♫',  needsUrl: false, needsFile: true,  accept: 'audio/*' },
];

export default function NewCardModal({ onAdd, onClose }: Props) {
  const [step, setStep] = useState<Step>('type');
  const [urlFor, setUrlFor] = useState<'link' | 'youtube' | 'image'>('link');
  const [urlLabel, setUrlLabel] = useState('Link');
  const [urlValue, setUrlValue] = useState('');
  const [fileType, setFileType] = useState<CardType>('image');
  const [fileAccept, setFileAccept] = useState('');

  const urlInputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const submit = useCallback(() => {
    const val = urlValue.trim();
    if (!val) return;
    if (urlFor === 'link') {
      onAdd('link', { url: val });
    } else if (urlFor === 'youtube') {
      const m = val.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
      onAdd('youtube', { videoId: m?.[1] ?? val, url: val });
    } else if (urlFor === 'image') {
      onAdd('image', { src: val });
    }
    onClose();
  }, [urlValue, urlFor, onAdd, onClose]);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (fileType === 'image') {
        onAdd('image', { src: ev.target?.result as string });
      } else {
        onAdd('audio', { src: ev.target?.result as string, name: file.name });
      }
      onClose();
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, [fileType, onAdd, onClose]);

  const handleTypeClick = useCallback((entry: typeof CARD_TYPES[number]) => {
    if (entry.type === 'note') {
      onAdd('note', { text: '' });
      onClose();
    } else if (entry.needsFile) {
      setFileType(entry.type);
      setFileAccept(entry.accept ?? '');
      setTimeout(() => fileRef.current?.click(), 50);
    } else if (entry.needsUrl) {
      setUrlFor(entry.type as 'link' | 'youtube' | 'image');
      setUrlLabel(entry.label);
      setStep('url');
      setTimeout(() => urlInputRef.current?.focus(), 50);
    }
  }, [onAdd, onClose]);

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 80,
          background: 'rgba(30,58,138,0.05)',
          backdropFilter: 'blur(1px)',
        }}
      />

      {/* Panel — anchored below the + button in the top-right */}
      <motion.div
        key="modal"
        initial={{ opacity: 0, scale: 0.92, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: -10 }}
        transition={{ type: 'spring', stiffness: 440, damping: 28 }}
        style={{
          position: 'fixed',
          top: 72,
          right: 16,
          zIndex: 90,
          minWidth: 210,
          background: 'rgba(255,255,255,0.84)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(107,139,209,0.22)',
          borderRadius: 18,
          padding: '12px 10px',
          boxShadow: '0 8px 40px rgba(30,58,138,0.12)',
        }}
      >
        {step === 'type' && (
          <>
            <div style={{
              fontSize: 10, fontWeight: 600, letterSpacing: '0.08em',
              color: 'rgba(107,139,209,0.5)', textTransform: 'uppercase',
              marginBottom: 8, paddingLeft: 6,
            }}>
              New Card
            </div>
            {CARD_TYPES.map((entry, i) => (
              <TypeRow key={i} icon={entry.icon} onClick={() => handleTypeClick(entry)}>
                {entry.label}
              </TypeRow>
            ))}
          </>
        )}

        {step === 'url' && (
          <>
            <button
              onClick={() => { setStep('type'); setUrlValue(''); }}
              style={{
                background: 'none', border: 'none',
                color: 'rgba(55,85,170,0.4)', fontSize: 11,
                cursor: 'pointer', padding: '0 4px 8px',
                fontFamily: 'inherit', display: 'block',
              }}
            >
              ← back
            </button>
            <div style={{
              fontSize: 10, fontWeight: 600, letterSpacing: '0.07em',
              color: 'rgba(107,139,209,0.5)', textTransform: 'uppercase',
              marginBottom: 8, paddingLeft: 4,
            }}>
              {urlLabel} URL
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                ref={urlInputRef}
                value={urlValue}
                onChange={(e) => setUrlValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submit();
                  if (e.key === 'Escape') onClose();
                }}
                placeholder={urlFor === 'youtube' ? 'youtu.be/...' : 'https://...'}
                style={{
                  flex: 1,
                  background: 'rgba(107,139,209,0.08)',
                  border: '1px solid rgba(107,139,209,0.2)',
                  borderRadius: 8, padding: '7px 10px',
                  fontSize: 12, color: 'rgba(40,65,140,0.85)',
                  outline: 'none', fontFamily: 'inherit',
                }}
              />
              <button
                onClick={submit}
                style={{
                  background: 'rgba(107,139,209,0.15)', border: 'none',
                  borderRadius: 8, padding: '7px 12px',
                  fontSize: 12, color: 'rgba(55,85,170,0.75)',
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Add
              </button>
            </div>
          </>
        )}

        <input
          ref={fileRef}
          type="file"
          accept={fileAccept}
          style={{ display: 'none' }}
          onChange={handleFile}
        />
      </motion.div>
    </AnimatePresence>
  );
}

function TypeRow({ icon, children, onClick }: { icon: string; children: React.ReactNode; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '7px 10px', borderRadius: 10,
        fontSize: 13,
        color: hov ? 'rgba(40,65,140,0.85)' : 'rgba(55,85,170,0.55)',
        background: hov ? 'rgba(107,139,209,0.1)' : 'transparent',
        cursor: 'pointer', transition: 'background 0.1s, color 0.1s',
      }}
    >
      <span style={{ fontSize: 13, width: 16, textAlign: 'center', flexShrink: 0 }}>{icon}</span>
      {children}
    </div>
  );
}
