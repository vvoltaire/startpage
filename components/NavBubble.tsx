'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { CardType } from '@/types';

const pill: React.CSSProperties = {
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  background: 'rgba(255,255,255,0.6)',
  border: '1px solid rgba(107,139,209,0.25)',
  userSelect: 'none',
  cursor: 'pointer',
};

const BOUNCE = { type: 'spring', stiffness: 500, damping: 22 } as const;

interface Props {
  onAdd: (type: CardType, data: Record<string, unknown>) => void;
}

type AddState = null | 'types' | 'link' | 'youtube' | 'image';

export default function NavBubble({ onAdd }: Props) {
  const [chainOpen, setChainOpen] = useState(false);
  const [plusOpen, setPlusOpen] = useState(false);
  const [addState, setAddState] = useState<AddState>(null);
  const [urlValue, setUrlValue] = useState('');

  const chainTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const plusTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const imageFileRef = useRef<HTMLInputElement>(null);
  const audioFileRef = useRef<HTMLInputElement>(null);

  const editMode = useStore((s) => s.editMode);
  const setEditMode = useStore((s) => s.setEditMode);

  const openChain = useCallback(() => { clearTimeout(chainTimer.current); setChainOpen(true); }, []);
  const closeChain = useCallback(() => { chainTimer.current = setTimeout(() => { setChainOpen(false); setPlusOpen(false); setAddState(null); }, 200); }, []);
  const openPlus = useCallback(() => { clearTimeout(plusTimer.current); clearTimeout(chainTimer.current); setPlusOpen(true); }, []);
  const closePlus = useCallback(() => { plusTimer.current = setTimeout(() => setPlusOpen(false), 200); }, []);

  const submit = useCallback(() => {
    const val = urlValue.trim();
    if (!val) return;
    if (addState === 'link') onAdd('link', { url: val });
    else if (addState === 'youtube') {
      const m = val.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
      onAdd('youtube', { videoId: m?.[1] ?? val, url: val });
    } else if (addState === 'image') {
      onAdd('image', { src: val });
    }
    setUrlValue(''); setAddState(null); setChainOpen(false); setPlusOpen(false);
  }, [urlValue, addState, onAdd]);

  const openUrl = useCallback((state: AddState) => {
    setAddState(state);
    setTimeout(() => urlInputRef.current?.focus(), 50);
  }, []);

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { onAdd('image', { src: ev.target?.result as string }); setAddState(null); setChainOpen(false); };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAudioFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { onAdd('audio', { src: ev.target?.result as string, name: file.name }); setAddState(null); setChainOpen(false); };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div
      style={{ position: 'fixed', top: 14, left: 14, zIndex: 50 }}
      onMouseEnter={openChain}
      onMouseLeave={closeChain}
    >
      {/* Main ⌘ icon */}
      <motion.div
        onClick={() => { setChainOpen(false); setPlusOpen(false); setAddState(null); }}
        style={{ ...pill, width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <span style={{ fontSize: 14, color: editMode ? 'rgba(210,70,70,0.85)' : 'rgba(55,85,170,0.55)' }}>
          {editMode ? '✏' : '⌘'}
        </span>
      </motion.div>

      {/* Vertical chain */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
        <AnimatePresence>
          {chainOpen && (
            <motion.div
              key="plus-row"
              initial={{ y: -24, opacity: 0, scale: 0.6 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -16, opacity: 0, scale: 0.7, transition: { duration: 0.1 } }}
              transition={{ ...BOUNCE, delay: 0 }}
              style={{ position: 'relative' }}
              onMouseEnter={openPlus}
              onMouseLeave={closePlus}
            >
              {/* + bubble */}
              <div style={{
                ...pill, height: 32, width: 36,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 20,
                background: (plusOpen || addState !== null) ? 'rgba(107,139,209,0.18)' : pill.background,
              }}>
                <span style={{ fontSize: 18, color: 'rgba(55,85,170,0.6)', lineHeight: 1 }}>+</span>
              </div>

              {/* Sub-bubbles */}
              <div
                style={{ position: 'absolute', top: 0, left: 42, display: 'flex', gap: 6 }}
                onMouseEnter={openPlus}
              >
                <AnimatePresence>
                  {plusOpen && addState === null && (
                    <>
                      <motion.div
                        key="note"
                        initial={{ x: -14, opacity: 0, scale: 0.65 }}
                        animate={{ x: 0, opacity: 1, scale: 1 }}
                        exit={{ x: -10, opacity: 0, scale: 0.7, transition: { duration: 0.1 } }}
                        transition={{ ...BOUNCE, delay: 0 }}
                        onClick={() => { onAdd('note', { text: '' }); setChainOpen(false); setPlusOpen(false); }}
                        style={{ ...pill, height: 32, padding: '0 14px', borderRadius: 20, display: 'flex', alignItems: 'center' }}
                      >
                        <span style={{ fontSize: 12, color: 'rgba(55,85,170,0.6)' }}>note</span>
                      </motion.div>
                      <motion.div
                        key="card"
                        initial={{ x: -14, opacity: 0, scale: 0.65 }}
                        animate={{ x: 0, opacity: 1, scale: 1 }}
                        exit={{ x: -10, opacity: 0, scale: 0.7, transition: { duration: 0.1 } }}
                        transition={{ ...BOUNCE, delay: 0.055 }}
                        onClick={() => setAddState('types')}
                        style={{ ...pill, height: 32, padding: '0 14px', borderRadius: 20, display: 'flex', alignItems: 'center' }}
                      >
                        <span style={{ fontSize: 12, color: 'rgba(55,85,170,0.6)' }}>card</span>
                      </motion.div>
                    </>
                  )}

                  {/* Card type options */}
                  {addState === 'types' && (
                    <motion.div
                      key="types-panel"
                      initial={{ x: -10, opacity: 0, scale: 0.9 }}
                      animate={{ x: 0, opacity: 1, scale: 1 }}
                      exit={{ x: -8, opacity: 0 }}
                      transition={{ ...BOUNCE }}
                      style={{
                        ...pill, borderRadius: 16, padding: 8, minWidth: 150,
                        display: 'flex', flexDirection: 'column',
                      }}
                    >
                      <TypeRow onClick={() => openUrl('link')}>Link</TypeRow>
                      <TypeRow onClick={() => openUrl('youtube')}>YouTube</TypeRow>
                      <TypeRow onClick={() => openUrl('image')}>Image URL</TypeRow>
                      <TypeRow onClick={() => imageFileRef.current?.click()}>Image from file</TypeRow>
                      <TypeRow onClick={() => audioFileRef.current?.click()}>Audio file</TypeRow>
                      <button onClick={() => setAddState(null)} style={{ background: 'none', border: 'none', color: 'rgba(55,85,170,0.35)', fontSize: 11, cursor: 'pointer', padding: '4px 8px 0', fontFamily: 'inherit', textAlign: 'left' }}>← back</button>
                    </motion.div>
                  )}

                  {/* URL input */}
                  {(addState === 'link' || addState === 'youtube' || addState === 'image') && (
                    <motion.div
                      key="url-panel"
                      initial={{ x: -10, opacity: 0, scale: 0.9 }}
                      animate={{ x: 0, opacity: 1, scale: 1 }}
                      exit={{ x: -8, opacity: 0 }}
                      transition={{ ...BOUNCE }}
                      style={{ ...pill, borderRadius: 14, padding: '8px 10px', minWidth: 220 }}
                    >
                      <div style={{ fontSize: 10, color: 'rgba(55,85,170,0.4)', marginBottom: 6, textTransform: 'capitalize', letterSpacing: '0.07em' }}>
                        {addState} URL
                      </div>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <input
                          ref={urlInputRef}
                          value={urlValue}
                          onChange={(e) => setUrlValue(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') setAddState('types'); }}
                          placeholder={addState === 'youtube' ? 'youtu.be/...' : 'https://...'}
                          style={{
                            flex: 1, background: 'rgba(107,139,209,0.1)',
                            border: '1px solid rgba(107,139,209,0.2)',
                            borderRadius: 6, padding: '5px 8px', fontSize: 12,
                            color: 'rgba(40,65,140,0.85)', outline: 'none', fontFamily: 'inherit',
                          }}
                        />
                        <button onClick={submit} style={{ background: 'rgba(107,139,209,0.15)', border: 'none', borderRadius: 6, padding: '5px 10px', fontSize: 12, color: 'rgba(55,85,170,0.7)', cursor: 'pointer', fontFamily: 'inherit' }}>Add</button>
                      </div>
                      <button onClick={() => { setAddState('types'); setUrlValue(''); }} style={{ background: 'none', border: 'none', color: 'rgba(55,85,170,0.35)', fontSize: 11, cursor: 'pointer', padding: '5px 0 0', fontFamily: 'inherit' }}>← back</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* Edit bubble */}
          {chainOpen && (
            <motion.div
              key="edit"
              initial={{ y: -24, opacity: 0, scale: 0.6 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -16, opacity: 0, scale: 0.7, transition: { duration: 0.1 } }}
              transition={{ ...BOUNCE, delay: 0.055 }}
              onClick={() => { setEditMode(!editMode); setChainOpen(false); }}
              style={{
                ...pill, height: 32, padding: '0 14px', borderRadius: 20,
                display: 'flex', alignItems: 'center',
                background: editMode ? 'rgba(220,80,80,0.12)' : pill.background,
                border: `1px solid ${editMode ? 'rgba(210,80,80,0.28)' : 'rgba(107,139,209,0.25)'}`,
              }}
            >
              <span style={{ fontSize: 12, color: editMode ? 'rgba(200,60,60,0.85)' : 'rgba(55,85,170,0.55)' }}>
                {editMode ? 'exit edit' : '✏ edit'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <input ref={imageFileRef} type="file" accept="image/*,image/gif" style={{ display: 'none' }} onChange={handleImageFile} />
      <input ref={audioFileRef} type="file" accept="audio/*" style={{ display: 'none' }} onChange={handleAudioFile} />
    </div>
  );
}

function TypeRow({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '6px 8px', borderRadius: 8, fontSize: 13,
        color: hov ? 'rgba(40,65,140,0.85)' : 'rgba(55,85,170,0.55)',
        background: hov ? 'rgba(107,139,209,0.1)' : 'transparent',
        cursor: 'pointer', transition: 'background 0.1s, color 0.1s',
      }}
    >
      {children}
    </div>
  );
}
