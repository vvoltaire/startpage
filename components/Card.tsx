'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { CardData } from '@/types';
import NoteCard from './cards/NoteCard';
import LinkCard from './cards/LinkCard';
import YouTubeCard from './cards/YouTubeCard';
import ImageCard from './cards/ImageCard';
import AudioCard from './cards/AudioCard';

interface Props { card: CardData }

const TYPE_ICON: Record<string, string> = {
  note: '≡', link: '↗', youtube: '▶', image: '▣', audio: '♫',
};

function cardTitle(card: CardData): string {
  if (card.type === 'note') {
    const text = (card.data.text as string) ?? '';
    const line = text.split('\n')[0].trim();
    return line.length > 0 ? (line.length > 36 ? line.slice(0, 36) + '…' : line) : 'Note';
  }
  if (card.type === 'link') return (card.data.title as string) || (card.data.meta as Record<string,string>)?.title || 'Link';
  if (card.type === 'youtube') return (card.data.meta as Record<string,string>)?.title || (card.data.title as string) || 'YouTube';
  if (card.type === 'image') return 'Image';
  if (card.type === 'audio') return (card.data.name as string) || 'Audio';
  return card.type;
}

const MIN_W = 110;
const MIN_H = 80;
type ResizeDir = 'se' | 'sw' | 'ne' | 'nw';

function computeResize(dir: ResizeDir, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number) {
  let w = sw, h = sh, x = sx, y = sy;
  if (dir === 'se' || dir === 'ne') w = Math.max(MIN_W, sw + dx);
  if (dir === 'sw' || dir === 'nw') {
    const rw = sw - dx;
    w = Math.max(MIN_W, rw);
    x = sx + (rw >= MIN_W ? dx : sw - MIN_W);
  }
  if (dir === 'se' || dir === 'sw') h = Math.max(MIN_H, sh + dy);
  if (dir === 'ne' || dir === 'nw') {
    const rh = sh - dy;
    h = Math.max(MIN_H, rh);
    y = sy + (rh >= MIN_H ? dy : sh - MIN_H);
  }
  return { x, y, width: w, height: h };
}

const inputStyle: React.CSSProperties = {
  flex: 1, background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.1)',
  borderRadius: 6, padding: '6px 10px', fontSize: 12, color: 'rgba(0,0,0,0.7)',
  outline: 'none', fontFamily: 'inherit',
};
const actionBtn: React.CSSProperties = {
  background: 'rgba(0,0,0,0.06)', border: 'none', borderRadius: 6,
  padding: '6px 10px', fontSize: 12, color: 'rgba(0,0,0,0.5)',
  cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
};

export default function Card({ card }: Props) {
  const updateCard = useStore((s) => s.updateCard);
  const removeCard = useStore((s) => s.removeCard);
  const bringToFront = useStore((s) => s.bringToFront);
  const activeTag = useStore((s) => s.activeTag);
  const editMode = useStore((s) => s.editMode);

  const [hovered, setHovered] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [addingTag, setAddingTag] = useState(false);
  const [editPanel, setEditPanel] = useState(false);
  const [editUrl, setEditUrl] = useState('');

  const tagInputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const imageFileRef = useRef<HTMLInputElement>(null);
  const audioFileRef = useRef<HTMLInputElement>(null);

  const isFiltered = !!activeTag && card.type !== 'section' && !card.tags.includes(activeTag);

  useEffect(() => { if (addingTag) tagInputRef.current?.focus(); }, [addingTag]);
  useEffect(() => { if (!editMode) setEditPanel(false); }, [editMode]);

  const addTag = useCallback(() => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !card.tags.includes(t)) updateCard(card.id, { tags: [...card.tags, t] });
    setTagInput(''); setAddingTag(false);
  }, [tagInput, card.id, card.tags, updateCard]);

  const removeTag = useCallback((tag: string) => {
    updateCard(card.id, { tags: card.tags.filter((t) => t !== tag) });
  }, [card.id, card.tags, updateCard]);

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
      const videoId = match?.[1] ?? val;
      updateCard(card.id, { data: { videoId, url: val, meta: undefined } });
    }
    setEditPanel(false);
  }, [card.id, card.type, editUrl, updateCard]);

  const handleImageFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      updateCard(card.id, { data: { src: ev.target?.result as string } });
      setEditPanel(false);
    };
    reader.readAsDataURL(file);
  }, [card.id, updateCard]);

  const handleAudioFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      updateCard(card.id, { data: { src: ev.target?.result as string, name: file.name } });
      setEditPanel(false);
    };
    reader.readAsDataURL(file);
  }, [card.id, updateCard]);

  const handleDragStart = useCallback((e: React.PointerEvent) => {
    e.preventDefault(); e.stopPropagation();
    bringToFront(card.id);
    const smx = e.clientX, smy = e.clientY, sx = card.x, sy = card.y;

    const onMove = (ev: PointerEvent) => {
      if (cardRef.current) {
        cardRef.current.style.left = `${sx + ev.clientX - smx}px`;
        cardRef.current.style.top = `${sy + ev.clientY - smy}px`;
      }
    };
    const onUp = (ev: PointerEvent) => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      if (editMode) {
        const el = document.elementFromPoint(ev.clientX, ev.clientY);
        if (el?.closest('[data-trash]')) { removeCard(card.id); return; }
      }
      updateCard(card.id, { x: sx + ev.clientX - smx, y: sy + ev.clientY - smy });
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  }, [card.id, card.x, card.y, bringToFront, updateCard, removeCard, editMode]);

  const handleResizeStart = useCallback((e: React.PointerEvent, dir: ResizeDir) => {
    e.preventDefault(); e.stopPropagation();
    const sx = card.x, sy = card.y, sw = card.width, sh = card.height;
    const smx = e.clientX, smy = e.clientY;

    const onMove = (ev: PointerEvent) => {
      const r = computeResize(dir, sx, sy, sw, sh, ev.clientX - smx, ev.clientY - smy);
      if (cardRef.current) {
        cardRef.current.style.left = `${r.x}px`;
        cardRef.current.style.top = `${r.y}px`;
        cardRef.current.style.width = `${r.width}px`;
        cardRef.current.style.height = `${r.height}px`;
      }
    };
    const onUp = (ev: PointerEvent) => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      updateCard(card.id, computeResize(dir, sx, sy, sw, sh, ev.clientX - smx, ev.clientY - smy));
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  }, [card, updateCard]);

  const isSection = card.type === 'section';
  const radius = isSection ? 24 : 16;

  return (
    <motion.div
      ref={cardRef}
      data-card="true"
      initial={isSection ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
      animate={{ opacity: isFiltered ? 0.08 : 1, scale: 1 }}
      transition={isSection ? { duration: 0.25 } : { type: 'spring', stiffness: 380, damping: 28 }}
      style={{
        position: 'absolute', left: card.x, top: card.y,
        width: card.width, height: card.height, zIndex: card.zIndex,
        display: 'flex', flexDirection: 'column',
        borderRadius: radius, overflow: 'hidden',
      }}
      className={isSection ? 'card-section' : 'card-glass'}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onPointerDown={(e) => { e.stopPropagation(); if (!isSection) bringToFront(card.id); }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: isSection ? '16px 18px 10px' : '11px 13px 7px',
          flexShrink: 0, cursor: 'grab', userSelect: 'none', gap: 8,
        }}
        onPointerDown={handleDragStart}
      >
        {isSection ? (
          <input
            value={(card.data.title as string) ?? ''}
            onChange={(e) => updateCard(card.id, { data: { ...card.data, title: e.target.value } })}
            onPointerDown={(e) => e.stopPropagation()}
            placeholder="Section name"
            style={{
              background: 'transparent', border: 'none', outline: 'none',
              fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.4)',
              letterSpacing: '-0.02em', fontFamily: 'inherit', cursor: 'text', flex: 1, minWidth: 0,
            }}
          />
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.28)', flexShrink: 0 }}>
                {TYPE_ICON[card.type] || '·'}
              </span>
              <span style={{
                fontSize: 13, fontWeight: 500, color: 'rgba(0,0,0,0.62)',
                flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                letterSpacing: '-0.01em',
              }}>
                {cardTitle(card)}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
              {editMode && (
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => openEditPanel()}
                  style={{
                    background: editPanel ? 'rgba(0,0,0,0.08)' : 'none',
                    border: 'none', cursor: 'pointer',
                    color: 'rgba(0,0,0,0.35)', fontSize: 12, padding: '1px 4px',
                    borderRadius: 4, lineHeight: 1, fontFamily: 'inherit',
                  }}
                  title="Edit card"
                >
                  ✏
                </button>
              )}
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => updateCard(card.id, { starred: !card.starred })}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: card.starred ? '#e8a020' : 'rgba(0,0,0,0.18)',
                  fontSize: 13, padding: 0, lineHeight: 1, transition: 'color 0.15s',
                }}
              >
                {card.starred ? '★' : '☆'}
              </button>
              <AnimatePresence>
                {hovered && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }} transition={{ duration: 0.12 }}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => removeCard(card.id)}
                    style={{
                      width: 16, height: 16, borderRadius: '50%', border: 'none',
                      background: 'transparent', color: 'rgba(0,0,0,0.25)', cursor: 'default',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, lineHeight: 1, padding: 0,
                    }}
                  >×</motion.button>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
        {card.type === 'note'    ? <NoteCard card={card} />
        : card.type === 'link'   ? <LinkCard card={card} />
        : card.type === 'youtube'? <YouTubeCard card={card} />
        : card.type === 'image'  ? <ImageCard card={card} />
        : card.type === 'audio'  ? <AudioCard card={card} />
        : null}
      </div>

      {/* Tag footer */}
      {!isSection && (hovered || card.tags.length > 0) && (
        <div
          style={{ padding: '4px 12px 9px', display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center', flexShrink: 0 }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {card.tags.map((tag) => (
            <span key={tag} style={{
              display: 'inline-flex', alignItems: 'center', gap: 3,
              background: 'rgba(110,90,220,0.1)', border: '1px solid rgba(110,90,220,0.18)',
              borderRadius: 20, padding: '2px 7px', fontSize: 10,
              color: 'rgba(90,70,180,0.75)', fontWeight: 500,
            }}>
              #{tag}
              <button onClick={() => removeTag(tag)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(90,70,180,0.45)', padding: 0, fontSize: 11, lineHeight: 1 }}>×</button>
            </span>
          ))}
          {addingTag ? (
            <input
              ref={tagInputRef} value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } if (e.key === 'Escape') { setTagInput(''); setAddingTag(false); } }}
              onBlur={() => { if (tagInput.trim()) addTag(); else setAddingTag(false); }}
              placeholder="tag name"
              style={{ background: 'rgba(110,90,220,0.08)', border: '1px solid rgba(110,90,220,0.2)', borderRadius: 20, padding: '2px 7px', fontSize: 10, color: 'rgba(90,70,180,0.8)', outline: 'none', width: 72, fontFamily: 'inherit' }}
            />
          ) : hovered && (
            <button onClick={() => setAddingTag(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(0,0,0,0.22)', fontSize: 14, lineHeight: 1, padding: '0 2px' }}>+</button>
          )}
        </div>
      )}

      {/* Edit panel overlay */}
      <AnimatePresence>
        {editPanel && editMode && !isSection && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute', inset: 0, borderRadius: radius,
              background: 'rgba(255,255,255,0.97)',
              display: 'flex', flexDirection: 'column', gap: 10,
              padding: 14, zIndex: 20, overflow: 'auto',
            }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 500, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Edit {card.type}
              </span>
              <button onClick={() => setEditPanel(false)} style={{ background: 'none', border: 'none', color: 'rgba(0,0,0,0.35)', fontSize: 18, cursor: 'pointer', lineHeight: 1, padding: 0 }}>×</button>
            </div>

            {(card.type === 'link' || card.type === 'youtube') && (
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  value={editUrl} onChange={(e) => setEditUrl(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') saveUrl(); if (e.key === 'Escape') setEditPanel(false); }}
                  placeholder={card.type === 'youtube' ? 'youtu.be/...' : 'https://...'}
                  style={inputStyle}
                />
                <button onClick={saveUrl} style={actionBtn}>Save</button>
              </div>
            )}

            {card.type === 'image' && (
              <>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    value={editUrl} onChange={(e) => setEditUrl(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { updateCard(card.id, { data: { src: editUrl } }); setEditPanel(false); } }}
                    placeholder="Image URL"
                    style={inputStyle}
                  />
                  <button onClick={() => { updateCard(card.id, { data: { src: editUrl } }); setEditPanel(false); }} style={actionBtn}>Save</button>
                </div>
                <button onClick={() => imageFileRef.current?.click()} style={{ ...actionBtn, textAlign: 'left' }}>
                  Choose file from desktop
                </button>
              </>
            )}

            {card.type === 'audio' && (
              <button onClick={() => audioFileRef.current?.click()} style={{ ...actionBtn, textAlign: 'left' }}>
                Choose audio file
              </button>
            )}

            {card.type === 'note' && (
              <p style={{ fontSize: 12, color: 'rgba(0,0,0,0.4)', fontStyle: 'italic', margin: 0 }}>
                Double-click the note to edit its text directly.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit mode red outline */}
      {editMode && !isSection && (
        <div style={{ position: 'absolute', inset: 0, borderRadius: radius, border: '1.5px dashed rgba(255,80,80,0.32)', pointerEvents: 'none', zIndex: 10 }} />
      )}

      {/* 4-corner resize handles */}
      {(['se', 'sw', 'ne', 'nw'] as ResizeDir[]).map((dir) => {
        const isE = dir.includes('e');
        const isS = dir.includes('s');
        return (
          <div
            key={dir}
            style={{
              position: 'absolute',
              [isS ? 'bottom' : 'top']: 4,
              [isE ? 'right' : 'left']: 4,
              width: 12, height: 12,
              cursor: `${dir}-resize`,
              borderRadius: 3,
              background: isSection
                ? 'rgba(255,255,255,0.1)'
                : dir === 'se'
                  ? 'linear-gradient(135deg, transparent 40%, rgba(0,0,0,0.12) 40%)'
                  : dir === 'sw'
                    ? 'linear-gradient(225deg, transparent 40%, rgba(0,0,0,0.12) 40%)'
                    : dir === 'ne'
                      ? 'linear-gradient(45deg, transparent 40%, rgba(0,0,0,0.12) 40%)'
                      : 'linear-gradient(315deg, transparent 40%, rgba(0,0,0,0.12) 40%)',
            }}
            onPointerDown={(e) => handleResizeStart(e, dir)}
          />
        );
      })}

      {/* Hidden file inputs */}
      <input ref={imageFileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageFile} />
      <input ref={audioFileRef} type="file" accept="audio/*" style={{ display: 'none' }} onChange={handleAudioFile} />
    </motion.div>
  );
}
