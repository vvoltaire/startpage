'use client';

import { useCallback } from 'react';
import { useStore } from '@/store/useStore';
import { CardData } from '@/types';

interface Props {
  card: CardData;
}

export default function NoteCard({ card }: Props) {
  const updateCard = useStore((state) => state.updateCard);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateCard(card.id, { data: { ...card.data, text: e.target.value } });
    },
    [card.id, card.data, updateCard]
  );

  return (
    <textarea
      style={{
        width: '100%',
        height: '100%',
        background: 'transparent',
        border: 'none',
        outline: 'none',
        resize: 'none',
        color: 'rgba(0,0,0,0.7)',
        fontSize: 14,
        lineHeight: 1.6,
        padding: '0 14px 14px',
        fontFamily: 'inherit',
      }}
      placeholder="Write something..."
      value={(card.data.text as string) ?? ''}
      onChange={handleChange}
      onPointerDown={(e) => e.stopPropagation()}
    />
  );
}
