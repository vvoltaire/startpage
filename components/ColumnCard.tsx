'use client';

import { useRef, useState, useCallback, useEffect, type CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { CardData } from '@/types';
import NoteCard from './cards/NoteCard';
import LinkCard from './cards/LinkCard';
import YouTubeCard from './cards/YouTubeCard';
import ImageCard from './cards/ImageCard';
import AudioCard from './cards/AudioCard';

const TYPE_ICON: Record<string, string> = {
  note: '≡', link: '↗', youtube: '▶', image: '▣', audio: '♫',
};

function cardTitle(card: CardData): string {
  if (card.type === 'note') {
    const text = (card.data.text as string) ?? '';
    const line = text.split('\n')[0].trim();
    return line.length > 0 ? (line.length > 36 ? line.slice(0, 36) + '…' : line) : 'Note';
  }
  if (card.type === 'link') return (card.data.meta as Record<string,string>)?.title || (card.data.title as string) || 'Link';
  if (card.type === 'youtube') return (card.data.meta as Record<string,string>)?.title || (card.data.title as string) || 'YouTube';
  if (card.type === 'image') return 'Image';
  if (card.type === 'audio') return (card.data.name as string) || 'Audio';
  return card.type;
}

const inputStyle: CSSProperties = {
  flex: 1, background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.18)',
  borderRadius: 6, padding: '6px 10px', fontSize: 12, color: '#1e293b',
  outline: 'none', fontFamily: 'inherit',
};
const actionBtn: CSSProperties = {
  background: 'rgba(99,102,241,0.1)', border: 'none', borderRadius: 6,
  padding: '6px 10px', fontSize: 12, color: '#3730a3',
  cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
};

const MIN_CARD_W = 200;
const MIN_CARD_H = 80;

interface Props {
  card: CardData;
  floating?: boolean;
}

export default function ColumnCard({ card, floating = false }: Props) {
  const updateCard = useStore((s) => s.updateCard);
  const removeCard = useStore((s) => s.removeCard);
  const editMode = useStore((s) => s.editMode);
  const view = useStore((s) => s.view);

  const locked = view === 'home' || floating;

  const [hovered, setHovered] = useState(false);
  const [editPanel, setEditPanel] = useState(false);
  const [editUrl, setEditUrl] = useState('');

  const cardRef = useRef<HTMLDivElement>(null);
  const imageFileRef = useRef<HTMLInputElement>(null);
  const audioFileRef = useRef<HTMLInputElement>(null);

  const handleResizeStart = useCallback((e: React.PointerEvent) => {
    e.preventDefault(); e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = cardRef.current?.offsetWidth ?? card.width;
    const startH = cardRef.current?.offsetHeight ?? card.height;
    const onMove = (ev: PointerEvent) => {
      const w = Math.max(MIN_CARD_W, startW + ev.clientX - startX);
      const h = Math.max(MIN_CARD_H, startH + ev.clientY - startY);
      if (cardRef.current) {
        cardRef.current.style.width = `${w}px`;
        cardRef.current.style.height = `${h}px`;
      }
    };
    const onUp = (ev: PointerEvent) => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      updateCard(card.id, {
        width: Math.max(MIN_CARD_W, startW + ev.clientX - startX),
        height: Math.max(MIN_CARD_H, startH + ev.clientY - startY),
      });
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  }, [card.id, card.width, card.height, updateCard]);

  useEffect(() => { if (!editMode) setEditPanel(false); }, [editMode]);

  const openEditPanel = useCallback(() => {
    setEditUrl((card.data.url as string) || '');
    setEditPanel(true);
  }, [card.data.url]);

  const saveUrl = useCallback(() => {
    const val = editUrl.trim();
    if (!val) return;
    if (card.type === 'link') {
      updateCard(card.id, { data: { url: val } });
    } else if (card.type === 'youtube') {
      const match = val.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
      updateCard(card.id, { data: { videoId: match?.[1] ?? val, url: val, meta: undefined } });
    }
    setEditPanel(false);
  }, [card.id, card.type, editUrl, updateCard]);

  const handleImageFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { updateCard(card.id, { data: { src: ev.target?.result as string } }); setEditPanel(false); };
    reader.readAsDataURL(file);
  }, [card.id, updateCard]);

  const handleAudioFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { updateCard(card.id, { data: { src: ev.target?.result as string, name: file.name } }); setEditPanel(false); };
    reader.readAsDataURL(file);
  }, [card.id, updateCard]);

  return (
    <motion.div
      ref={cardRef}
      layout="position"
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="card-glass"
      style={{
        borderRadius: 20,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        width: card.width,
        height: card.height,
        flexShrink: 0,
        overflow: 'hidden',
      }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '11px 13px 7px', flexShrink: 0, gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 11, color: '#64748b', flexShrink: 0 }}>
            {TYPE_ICON[card.type] || '·'}
          </span>
          <span style={{
            fontSize: 13, fontWeight: 500, color: '#1e293b',
            flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            letterSpacing: '-0.01em',
          }}>
            {cardTitle(card)}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
          {/* Edit button — gallery only */}
          {!locked && editMode && (
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={openEditPanel}
              style={{
                background: editPanel ? 'rgba(99,102,241,0.1)' : 'none',
                border: 'none', cursor: 'pointer',
                color: '#6366f1', fontSize: 12, padding: '1px 4px',
                borderRadius: 4, lineHeight: 1, fontFamily: 'inherit',
              }}
            >✏</button>
          )}

          {/* Star — gallery view only, not floating */}
          {!floating && view === 'gallery' && (
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => updateCard(card.id, { starred: !card.starred })}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: card.starred ? '#d97706' : 'rgba(71,85,105,0.3)',
                fontSize: 13, padding: 0, lineHeight: 1, transition: 'color 0.15s',
              }}
            >{card.starred ? '★' : '☆'}</button>
          )}

          {/* Delete — gallery only, edit mode only */}
          <AnimatePresence>
            {!locked && editMode && hovered && (
              <motion.button
                initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }} transition={{ duration: 0.12 }}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => removeCard(card.id)}
                style={{
                  width: 16, height: 16, borderRadius: '50%', border: 'none',
                  background: 'rgba(220,60,60,0.08)', color: 'rgba(200,60,60,0.7)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, lineHeight: 1, padding: 0,
                }}
              >×</motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
        {card.type === 'note'      ? <NoteCard card={card} />
          : card.type === 'link'   ? <LinkCard card={card} />
          : card.type === 'youtube'? <YouTubeCard card={card} />
          : card.type === 'image'  ? <ImageCard card={card} />
          : card.type === 'audio'  ? <AudioCard card={card} />
          : null}
      </div>

      {/* Edit panel overlay — gallery only */}
      <AnimatePresence>
        {!locked && editPanel && editMode && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute', inset: 0, borderRadius: 20,
              background: 'rgba(248,250,252,0.97)',
              display: 'flex', flexDirection: 'column', gap: 10,
              padding: 14, zIndex: 20, overflow: 'auto',
            }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 500, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Edit {card.type}
              </span>
              <button onClick={() => setEditPanel(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 18, cursor: 'pointer', lineHeight: 1, padding: 0 }}>×</button>
            </div>

            {(card.type === 'link' || card.type === 'youtube') && (
              <div style={{ display: 'flex', gap: 6 }}>
                <input value={editUrl} onChange={(e) => setEditUrl(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') saveUrl(); if (e.key === 'Escape') setEditPanel(false); }}
                  placeholder={card.type === 'youtube' ? 'youtu.be/...' : 'https://...'}
                  style={inputStyle} />
                <button onClick={saveUrl} style={actionBtn}>Save</button>
              </div>
            )}

            {card.type === 'image' && (
              <>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input value={editUrl} onChange={(e) => setEditUrl(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { updateCard(card.id, { data: { src: editUrl } }); setEditPanel(false); } }}
                    placeholder="Image URL" style={inputStyle} />
                  <button onClick={() => { updateCard(card.id, { data: { src: editUrl } }); setEditPanel(false); }} style={actionBtn}>Save</button>
                </div>
                <button onClick={() => imageFileRef.current?.click()} style={{ ...actionBtn, textAlign: 'left' }}>Choose file from desktop</button>
              </>
            )}

            {card.type === 'audio' && (
              <button onClick={() => audioFileRef.current?.click()} style={{ ...actionBtn, textAlign: 'left' }}>Choose audio file</button>
            )}

            {card.type === 'note' && (
              <p style={{ fontSize: 12, color: '#475569', fontStyle: 'italic', margin: 0 }}>
                Double-click the note to edit its text directly.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit mode outline — gallery only */}
      {!locked && editMode && (
        <div style={{ position: 'absolute', inset: 0, borderRadius: 20, border: '1.5px dashed rgba(99,102,241,0.3)', pointerEvents: 'none', zIndex: 10 }} />
      )}

      {/* SE resize handle — gallery only, not floating */}
      {!locked && (
        <div
          style={{
            position: 'absolute', bottom: 4, right: 4,
            width: 14, height: 14,
            cursor: 'se-resize',
            background: 'linear-gradient(135deg, transparent 40%, rgba(30,41,59,0.14) 40%)',
            borderRadius: 3,
            zIndex: 15,
          }}
          onPointerDown={handleResizeStart}
        />
      )}

      {/* Glass gloss reflection — top-edge gradient overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '50%',
        background: 'linear-gradient(to bottom, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 100%)',
        borderRadius: '20px 20px 0 0',
        pointerEvents: 'none',
        zIndex: 25,
      }} />

      <input ref={imageFileRef} type="file" accept="image/*,image/gif" style={{ display: 'none' }} onChange={handleImageFile} />
      <input ref={audioFileRef} type="file" accept="audio/*" style={{ display: 'none' }} onChange={handleAudioFile} />
    </motion.div>
  );
}
