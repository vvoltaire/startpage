'use client';

import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import ColumnCard from './ColumnCard';

interface Props {
  tag: string | null;
  width: number;
  index: number;
}

export default function TagColumn({ tag, width, index }: Props) {
  const cards = useStore((s) => s.cards);

  const colCards = cards
    .filter((c) => c.type !== 'section')
    .filter((c) => tag === null ? c.tags.length === 0 : c.tags.includes(tag))
    .sort((a, b) => (b.starred ? 1 : 0) - (a.starred ? 1 : 0));

  const label = tag === null ? 'Untagged' : tag;

  return (
    <div style={{
      width,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      overflow: 'hidden',
    }}>
      {/* Column header */}
      <div style={{
        padding: '12px 18px 10px',
        flexShrink: 0,
        borderBottom: '1px solid rgba(107,139,209,0.14)',
        display: 'flex',
        alignItems: 'baseline',
        gap: 7,
      }}>
        <motion.span
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.065, type: 'spring', stiffness: 400, damping: 30 }}
          style={{
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '-0.01em',
            color: 'rgba(55,85,170,0.7)',
          }}
        >
          #{label}
        </motion.span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.065 + 0.1 }}
          style={{ fontSize: 11, color: 'rgba(107,139,209,0.5)' }}
        >
          {colCards.length}
        </motion.span>
      </div>

      {/* Scrollable card body */}
      <div
        className="canvas-scroll"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px 14px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {colCards.map((card) => (
          <ColumnCard key={card.id} card={card} />
        ))}
        {colCards.length === 0 && (
          <div style={{
            paddingTop: 48,
            textAlign: 'center',
            fontSize: 12,
            color: 'rgba(107,139,209,0.4)',
            fontStyle: 'italic',
          }}>
            No cards yet
          </div>
        )}
      </div>
    </div>
  );
}
