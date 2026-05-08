'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { CardData } from '@/types';

export default function NoteCard({ card }: { card: CardData }) {
  const updateCard = useStore((state) => state.updateCard);
  const [editing, setEditing] = useState(false);
  const text = (card.data.text as string) ?? '';

  if (editing) {
    return (
      <textarea
        autoFocus
        style={{
          width: '100%', height: '100%',
          background: 'transparent', border: 'none', outline: 'none',
          resize: 'none', color: '#1e293b',
          fontSize: 14, lineHeight: 1.6,
          padding: '0 14px 14px', fontFamily: 'inherit',
        }}
        value={text}
        onChange={(e) => updateCard(card.id, { data: { ...card.data, text: e.target.value } })}
        onBlur={() => setEditing(false)}
        onKeyDown={(e) => { if (e.key === 'Escape') setEditing(false); }}
        onPointerDown={(e) => e.stopPropagation()}
      />
    );
  }

  return (
    <div
      onDoubleClick={() => setEditing(true)}
      onPointerDown={(e) => e.stopPropagation()}
      style={{ padding: '0 14px 14px', height: '100%', overflow: 'hidden', cursor: 'text', userSelect: 'none' }}
    >
      {text ? (
        text.split('\n').map((line, i) => (
          <div key={i} style={{ fontSize: 14, lineHeight: 1.6, color: '#1e293b', minHeight: '1.6em' }}>
            {line || ' '}
          </div>
        ))
      ) : (
        <span style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic' }}>Double-click to edit…</span>
      )}
    </div>
  );
}
