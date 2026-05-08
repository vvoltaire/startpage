'use client';

import { CardData } from '@/types';

export default function AudioCard({ card }: { card: CardData }) {
  const src = card.data.src as string;
  const name = (card.data.name as string) || 'Audio';

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '4px 14px 12px', gap: 8 }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {name}
      </span>
      {src ? (
        <audio controls style={{ width: '100%' }} src={src} />
      ) : (
        <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.28)', fontStyle: 'italic' }}>No audio — use edit mode to attach</span>
      )}
    </div>
  );
}
