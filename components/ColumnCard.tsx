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

const inputStyle: React.CSSProperties = {
  flex: 1, background: 'rgba(107,139,209,0.08)', border: '1px solid rgba(107,139,209,0.2)',
  borderRadius: 6, padding: '6px 10px', fontSize: 12, color: 'rgba(55,80,150,0.85)',
  outline: 'none', fontFamily: 'inherit',
};
const actionBtn: React.CSSProperties = {
  background: 'rgba(107,139,209,0.1)', border: 'none', borderRadius: 6,
  padding: '6px 10px', fontSize: 12, color: 'rgba(82,115,193,0.7)',
  cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
};

const CARD_HEIGHTS: Partial<Record<string, number>> = {
  youtube: 264,
  image: 220,
  link: 210,
  audio: 104,
};

export default function ColumnCard({ card }: { card: CardData }) {
  const updateCard = useStore((s) => s.updateCard);
  const removeCard = useStore((s) => s.removeCard);
  const editMode = useStore((s) => s.editMode);

  const [hovered, setHovered] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [addingTag, setAddingTag] = useState(false);
  const [editPanel, setEditPanel] = useState(false);
  const [editUrl, setEditUrl] = useState('');

  const tagInputRef = useRef<HTMLInputElement>(null);
  const imageFileRef = useRef<HTMLInputElement>(null);
  const audioFileRef = useRef<HTMLInputElement>(null);

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

  const cardHeight = CARD_HEIGHTS[card.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
      className="card-glass"
      style={{
        borderRadius: 16,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        flexShrink: 0,
        height: cardHeight,
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
          <span style={{ fontSize: 11, color: 'rgba(82,115,193,0.45)', flexShrink: 0 }}>
            {TYPE_ICON[card.type] || '·'}
          </span>
          <span style={{
            fontSize: 13, fontWeight: 500, color: 'rgba(40,65,140,0.72)',
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
              onClick={openEditPanel}
              style={{
                background: editPanel ? 'rgba(82,115,193,0.1)' : 'none',
                border: 'none', cursor: 'pointer',
                color: 'rgba(82,115,193,0.5)', fontSize: 12, padding: '1px 4px',
                borderRadius: 4, lineHeight: 1, fontFamily: 'inherit',
              }}
            >✏</button>
          )}
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => updateCard(card.id, { starred: !card.starred })}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: card.starred ? '#d4920a' : 'rgba(82,115,193,0.22)',
              fontSize: 13, padding: 0, lineHeight: 1, transition: 'color 0.15s',
            }}
          >{card.starred ? '★' : '☆'}</button>
          <AnimatePresence>
            {hovered && (
              <motion.button
                initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }} transition={{ duration: 0.12 }}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => removeCard(card.id)}
                style={{
                  width: 16, height: 16, borderRadius: '50%', border: 'none',
                  background: 'transparent', color: 'rgba(82,115,193,0.35)', cursor: 'pointer',
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
        {card.type === 'note'     ? <NoteCard card={card} />
          : card.type === 'link'   ? <LinkCard card={card} />
          : card.type === 'youtube'? <YouTubeCard card={card} />
          : card.type === 'image'  ? <ImageCard card={card} />
          : card.type === 'audio'  ? <AudioCard card={card} />
          : null}
      </div>

      {/* Tag footer */}
      {(hovered || card.tags.length > 0) && (
        <div
          style={{ padding: '4px 12px 9px', display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center', flexShrink: 0 }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {card.tags.map((tag) => (
            <span key={tag} style={{
              display: 'inline-flex', alignItems: 'center', gap: 3,
              background: 'rgba(107,139,209,0.12)', border: '1px solid rgba(107,139,209,0.22)',
              borderRadius: 20, padding: '2px 7px', fontSize: 10,
              color: 'rgba(55,85,170,0.75)', fontWeight: 500,
            }}>
              #{tag}
              <button onClick={() => removeTag(tag)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(82,115,193,0.4)', padding: 0, fontSize: 11, lineHeight: 1 }}>×</button>
            </span>
          ))}
          {addingTag ? (
            <input
              ref={tagInputRef} value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } if (e.key === 'Escape') { setTagInput(''); setAddingTag(false); } }}
              onBlur={() => { if (tagInput.trim()) addTag(); else setAddingTag(false); }}
              placeholder="tag name"
              style={{ background: 'rgba(107,139,209,0.08)', border: '1px solid rgba(107,139,209,0.22)', borderRadius: 20, padding: '2px 7px', fontSize: 10, color: 'rgba(55,85,170,0.8)', outline: 'none', width: 72, fontFamily: 'inherit' }}
            />
          ) : hovered && (
            <button onClick={() => setAddingTag(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(82,115,193,0.35)', fontSize: 14, lineHeight: 1, padding: '0 2px' }}>+</button>
          )}
        </div>
      )}

      {/* Edit panel overlay */}
      <AnimatePresence>
        {editPanel && editMode && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute', inset: 0, borderRadius: 16,
              background: 'rgba(225,235,255,0.97)',
              display: 'flex', flexDirection: 'column', gap: 10,
              padding: 14, zIndex: 20, overflow: 'auto',
            }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 500, color: 'rgba(55,85,170,0.5)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Edit {card.type}
              </span>
              <button onClick={() => setEditPanel(false)} style={{ background: 'none', border: 'none', color: 'rgba(82,115,193,0.45)', fontSize: 18, cursor: 'pointer', lineHeight: 1, padding: 0 }}>×</button>
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
              <p style={{ fontSize: 12, color: 'rgba(55,85,170,0.5)', fontStyle: 'italic', margin: 0 }}>
                Double-click the note to edit its text directly.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {editMode && (
        <div style={{ position: 'absolute', inset: 0, borderRadius: 16, border: '1.5px dashed rgba(82,115,193,0.3)', pointerEvents: 'none', zIndex: 10 }} />
      )}

      <input ref={imageFileRef} type="file" accept="image/*,image/gif" style={{ display: 'none' }} onChange={handleImageFile} />
      <input ref={audioFileRef} type="file" accept="audio/*" style={{ display: 'none' }} onChange={handleAudioFile} />
    </motion.div>
  );
}
