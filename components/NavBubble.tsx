'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { CardType } from '@/types';

const CIRCLE = 36;

const circle = (extra?: React.CSSProperties): React.CSSProperties => ({
  width: CIRCLE,
  height: CIRCLE,
  borderRadius: '50%',
  background: 'rgb(248,250,252)',
  border: '1px solid rgba(100,116,139,0.22)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  userSelect: 'none',
  cursor: 'pointer',
  flexShrink: 0,
  ...extra,
});

const abbrev = (tag: string) => tag.length > 5 ? tag.slice(0, 4) + '.' : tag;

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
  const hiddenTags = useStore((s) => s.hiddenTags);
  const toggleHiddenTag = useStore((s) => s.toggleHiddenTag);
  const cards = useStore((s) => s.cards);
  const view = useStore((s) => s.view);

  const tags = [...new Set(
    cards.filter((c) => c.type !== 'section').flatMap((c) => c.tags)
  )].sort();

  const openChain = useCallback(() => { clearTimeout(chainTimer.current); setChainOpen(true); }, []);
  const closeChain = useCallback(() => {
    chainTimer.current = setTimeout(() => {
      setChainOpen(false); setPlusOpen(false); setAddState(null);
    }, 200);
  }, []);
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

  const isGallery = view === 'gallery';

  return (
    <div
      style={{ position: 'fixed', top: 14, left: 14, zIndex: 50 }}
      onMouseEnter={openChain}
      onMouseLeave={closeChain}
    >
      {/* ⌘ main button */}
      <motion.div
        onClick={() => { setChainOpen(false); setPlusOpen(false); setAddState(null); }}
        style={circle({ background: editMode ? 'rgb(255,236,236)' : 'rgb(248,250,252)' })}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <span style={{ fontSize: 14, color: editMode ? 'rgba(210,70,70,0.85)' : '#64748b' }}>
          {editMode ? '✏' : '⌘'}
        </span>
      </motion.div>

      {/* Vertical chain */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
        <AnimatePresence>

          {/* + Add — gallery only */}
          {chainOpen && isGallery && (
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
              <div style={circle({ background: (plusOpen || addState !== null) ? 'rgb(226,232,240)' : 'rgb(248,250,252)' })}>
                <span style={{ fontSize: 20, color: '#475569', lineHeight: 1 }}>+</span>
              </div>

              {/* Horizontal sub-bubbles */}
              <div
                style={{ position: 'absolute', top: 0, left: CIRCLE + 8, display: 'flex', gap: 6 }}
                onMouseEnter={openPlus}
              >
                <AnimatePresence>
                  {plusOpen && addState === null && (
                    <>
                      {/* Note Card */}
                      <motion.div
                        key="note"
                        initial={{ x: -14, opacity: 0, scale: 0.65 }}
                        animate={{ x: 0, opacity: 1, scale: 1 }}
                        exit={{ x: -10, opacity: 0, scale: 0.7, transition: { duration: 0.1 } }}
                        transition={{ ...BOUNCE, delay: 0 }}
                        onClick={() => { onAdd('note', { text: '' }); setChainOpen(false); setPlusOpen(false); }}
                        style={circle()}
                      >
                        <span style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>note</span>
                      </motion.div>

                      {/* Regular Card */}
                      <motion.div
                        key="card"
                        initial={{ x: -14, opacity: 0, scale: 0.65 }}
                        animate={{ x: 0, opacity: 1, scale: 1 }}
                        exit={{ x: -10, opacity: 0, scale: 0.7, transition: { duration: 0.1 } }}
                        transition={{ ...BOUNCE, delay: 0.055 }}
                        onClick={() => setAddState('types')}
                        style={circle()}
                      >
                        <span style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>card</span>
                      </motion.div>
                    </>
                  )}

                  {/* Card type panel */}
                  {addState === 'types' && (
                    <motion.div
                      key="types-panel"
                      initial={{ x: -10, opacity: 0, scale: 0.9 }}
                      animate={{ x: 0, opacity: 1, scale: 1 }}
                      exit={{ x: -8, opacity: 0 }}
                      transition={{ ...BOUNCE }}
                      style={{
                        background: 'rgb(248,250,252)',
                        border: '1px solid rgba(100,116,139,0.22)',
                        borderRadius: 16, padding: 8, minWidth: 150,
                        display: 'flex', flexDirection: 'column',
                      }}
                    >
                      <TypeRow onClick={() => openUrl('link')}>Link</TypeRow>
                      <TypeRow onClick={() => openUrl('youtube')}>YouTube</TypeRow>
                      <TypeRow onClick={() => openUrl('image')}>Image URL</TypeRow>
                      <TypeRow onClick={() => imageFileRef.current?.click()}>Image from file</TypeRow>
                      <TypeRow onClick={() => audioFileRef.current?.click()}>Audio file</TypeRow>
                      <button
                        onClick={() => setAddState(null)}
                        style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 11, cursor: 'pointer', padding: '4px 8px 0', fontFamily: 'inherit', textAlign: 'left' }}
                      >← back</button>
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
                      style={{
                        background: 'rgb(248,250,252)',
                        border: '1px solid rgba(100,116,139,0.22)',
                        borderRadius: 14, padding: '8px 10px', minWidth: 220,
                      }}
                    >
                      <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 6, textTransform: 'capitalize', letterSpacing: '0.07em' }}>
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
                            flex: 1, background: 'rgba(100,116,139,0.08)',
                            border: '1px solid rgba(100,116,139,0.2)',
                            borderRadius: 8, padding: '5px 8px', fontSize: 12,
                            color: '#1e293b', outline: 'none', fontFamily: 'inherit',
                          }}
                        />
                        <button
                          onClick={submit}
                          style={{ background: 'rgb(226,232,240)', border: 'none', borderRadius: 8, padding: '5px 10px', fontSize: 12, color: '#1e293b', cursor: 'pointer', fontFamily: 'inherit' }}
                        >Add</button>
                      </div>
                      <button
                        onClick={() => { setAddState('types'); setUrlValue(''); }}
                        style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 11, cursor: 'pointer', padding: '5px 0 0', fontFamily: 'inherit' }}
                      >← back</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* ✏ Edit — gallery only */}
          {chainOpen && isGallery && (
            <motion.div
              key="edit"
              initial={{ y: -24, opacity: 0, scale: 0.6 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -16, opacity: 0, scale: 0.7, transition: { duration: 0.1 } }}
              transition={{ ...BOUNCE, delay: 0.055 }}
              onClick={() => { setEditMode(!editMode); setChainOpen(false); }}
              style={circle({
                background: editMode ? 'rgb(255,220,220)' : 'rgb(248,250,252)',
                border: `1px solid ${editMode ? 'rgba(210,80,80,0.35)' : 'rgba(100,116,139,0.22)'}`,
              })}
            >
              <span style={{ fontSize: 13, color: editMode ? 'rgba(200,60,60,0.9)' : '#64748b' }}>
                ✏
              </span>
            </motion.div>
          )}

          {/* Tag filter circles — both modes */}
          {chainOpen && tags.map((tag, tagIdx) => {
            const isHidden = hiddenTags.includes(tag);
            const delay = isGallery ? 0.11 + tagIdx * 0.04 : 0.04 + tagIdx * 0.04;
            return (
              <motion.div
                key={`tag-${tag}`}
                initial={{ y: -24, opacity: 0, scale: 0.6 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -16, opacity: 0, scale: 0.7, transition: { duration: 0.1 } }}
                transition={{ ...BOUNCE, delay }}
                onClick={() => toggleHiddenTag(tag)}
                style={circle({
                  background: isHidden ? 'rgb(248,250,252)' : 'rgb(226,232,240)',
                  border: `1px solid ${isHidden ? 'rgba(100,116,139,0.15)' : 'rgba(100,116,139,0.35)'}`,
                  opacity: isHidden ? 0.5 : 1,
                })}
              >
                <span style={{
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.03em',
                  color: '#1e293b',
                  textAlign: 'center',
                  lineHeight: 1.2,
                  maxWidth: 30,
                  overflow: 'hidden',
                  wordBreak: 'break-word',
                }}>
                  {abbrev(tag)}
                </span>
              </motion.div>
            );
          })}
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
        color: hov ? '#1e293b' : '#475569',
        background: hov ? 'rgb(226,232,240)' : 'transparent',
        cursor: 'pointer', transition: 'background 0.1s, color 0.1s',
      }}
    >
      {children}
    </div>
  );
}
