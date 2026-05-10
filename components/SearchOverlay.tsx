'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { CardData } from '@/types';

const TYPE_ICON: Record<string, string> = {
  note: '≡', link: '↗', youtube: '▶', image: '▣', audio: '♫', folder: '▤',
};

function cardLabel(card: CardData): string {
  if (card.type === 'note') {
    const line = ((card.data.text as string) ?? '').split('\n')[0].trim();
    return line || 'Note';
  }
  if (card.type === 'link') return (card.data.meta as Record<string, string>)?.title || (card.data.url as string) || 'Link';
  if (card.type === 'youtube') return (card.data.meta as Record<string, string>)?.title || 'YouTube';
  if (card.type === 'image') return 'Image';
  if (card.type === 'audio') return (card.data.name as string) || 'Audio';
  return card.type;
}

function cardSearchText(card: CardData): string {
  const parts: string[] = [cardLabel(card)];
  if (card.type === 'note') parts.push((card.data.text as string) ?? '');
  if (card.type === 'link') parts.push((card.data.url as string) ?? '');
  if (card.type === 'youtube') parts.push((card.data.url as string) ?? '');
  parts.push(...card.tags);
  return parts.join(' ').toLowerCase();
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const kbdStyle: React.CSSProperties = {
  background: 'rgba(100,116,139,0.09)',
  border: '1px solid rgba(100,116,139,0.18)',
  borderRadius: 5,
  padding: '1px 5px',
  fontFamily: 'inherit',
  fontSize: 10,
};

export default function SearchOverlay() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const cards = useStore((s) => s.cards);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [open]);

  const results = query.trim().length < 1
    ? []
    : cards
        .filter((c) => c.type !== 'section' && cardSearchText(c).includes(query.toLowerCase()))
        .slice(0, 8);

  useEffect(() => { setSelected(0); }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected((v) => Math.min(v + 1, results.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelected((v) => Math.max(v - 1, 0)); }
    if (e.key === 'Enter') { setOpen(false); }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.14 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '18vh',
          }}
        >
          {/* Scrim */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(15,23,42,0.44)',
              backdropFilter: 'blur(5px)',
              WebkitBackdropFilter: 'blur(5px)',
            }}
            onClick={() => setOpen(false)}
          />

          <motion.div
            initial={{ y: -18, scale: 0.96 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: -18, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 460, damping: 34 }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 560,
              margin: '0 20px',
              background: 'rgba(255,255,255,0.97)',
              backdropFilter: 'blur(32px)',
              WebkitBackdropFilter: 'blur(32px)',
              borderRadius: 22,
              boxShadow: '0 28px 88px rgba(15,23,42,0.3), 0 2px 0 rgba(255,255,255,0.6) inset',
              overflow: 'hidden',
              border: '1px solid rgba(100,116,139,0.14)',
            }}
          >
            {/* Input row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: '15px 20px',
              gap: 14,
              borderBottom: results.length > 0 || (query.trim().length > 0 && results.length === 0)
                ? '1px solid rgba(100,116,139,0.09)'
                : 'none',
            }}>
              <span style={{ fontSize: 16, color: '#94a3b8', flexShrink: 0 }}>⌕</span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search cards, tags, notes…"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: 16,
                  color: '#1e293b',
                  fontFamily: 'inherit',
                  letterSpacing: '-0.01em',
                }}
              />
              <kbd style={{ ...kbdStyle, color: '#94a3b8', flexShrink: 0 }}>esc</kbd>
            </div>

            {/* Results */}
            {results.length > 0 && (
              <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                {results.map((card, i) => (
                  <div
                    key={card.id}
                    onClick={() => setOpen(false)}
                    onMouseEnter={() => setSelected(i)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 13,
                      padding: '11px 20px',
                      background: selected === i ? 'rgba(99,102,241,0.06)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'background 0.1s',
                      borderTop: i > 0 ? '1px solid rgba(100,116,139,0.06)' : 'none',
                    }}
                  >
                    <span style={{
                      fontSize: 13,
                      color: selected === i ? '#6366f1' : '#94a3b8',
                      flexShrink: 0,
                      width: 16,
                      textAlign: 'center',
                      transition: 'color 0.1s',
                    }}>
                      {TYPE_ICON[card.type] || '·'}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        margin: 0,
                        fontSize: 13,
                        fontWeight: 500,
                        color: '#1e293b',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {cardLabel(card)}
                      </p>
                      {card.tags.length > 0 && (
                        <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94a3b8' }}>
                          {card.tags.map(capitalize).join(' · ')}
                        </p>
                      )}
                    </div>
                    {card.starred && (
                      <span style={{ fontSize: 12, color: '#d97706', flexShrink: 0 }}>★</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {query.trim().length > 0 && results.length === 0 && (
              <div style={{
                padding: '24px 20px',
                textAlign: 'center',
                fontSize: 13,
                color: '#94a3b8',
                fontStyle: 'italic',
              }}>
                No results for &ldquo;{query}&rdquo;
              </div>
            )}

            {/* Footer hint */}
            <div style={{
              padding: '9px 20px',
              borderTop: '1px solid rgba(100,116,139,0.08)',
              display: 'flex',
              gap: 18,
              fontSize: 11,
              color: '#94a3b8',
            }}>
              <span><kbd style={kbdStyle}>↑↓</kbd> navigate</span>
              <span><kbd style={kbdStyle}>↵</kbd> select</span>
              <span><kbd style={kbdStyle}>⌘K</kbd> toggle</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
