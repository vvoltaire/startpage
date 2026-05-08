'use client';

import { CardData } from '@/types';

export default function ImageCard({ card }: { card: CardData }) {
  const url = card.data.url as string;

  return (
    <div
      style={{ width: '100%', height: '100%', overflow: 'hidden' }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <img
        src={url}
        alt=""
        draggable={false}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    </div>
  );
}
