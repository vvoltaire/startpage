'use client';

import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import ColumnCard from './ColumnCard';

interface Props {
  tag: string | null;
  width: number;
  index: number;
  isDropTarget?: boolean;
}

export default function TagColumn({ tag, width, index, isDropTarget = false }: Props) {
  const cards = useStore((s) => s.cards);
  const view = useStore((s) => s.view);

  const colCards = cards
    .filter((c) => c.type !== 'section')
    .filter((c) => tag === null ? c.tags.length === 0 : c.tags.includes(tag))
    .filter((c) => view === 'home' ? c.starred : true)
    .sort((a, b) => (b.starred ? 1 : 0) - (a.starred ? 1 : 0));

  const label = tag === null ? 'Untagged' : tag;

  return (
    <div
      className={isDropTarget ? 'col-drop-target' : undefined}
      style={{
        width,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflow: 'hidden',
        transition: 'background 0.12s',
      }}
    >
      {/* Column header */}
      <div style={{
        padding: '12px 18px 10px',
        flexShrink: 0,
        borderBottom: `1px solid ${isDropTarget ? 'rgba(99,102,241,0.25)' : 'rgba(100,116,139,0.12)'}`,
        display: 'flex',
        alignItems: 'baseline',
        gap: 7,
        transition: 'border-color 0.12s',
      }}>
        <motion.span
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.065, type: 'spring', stiffness: 400, damping: 30 }}
          style={{
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '-0.01em',
            color: isDropTarget ? '#6366f1' : '#1e293b',
            transition: 'color 0.12s',
          }}
        >
          {label}
        </motion.span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.065 + 0.1 }}
          style={{ fontSize: 11, color: '#64748b', opacity: 0.7 }}
        >
          {colCards.length}
        </motion.span>

        {view === 'home' && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.065 + 0.15 }}
            style={{ fontSize: 10, color: '#94a3b8', marginLeft: 'auto', fontStyle: 'italic' }}
          >
            ★ starred
          </motion.span>
        )}
      </div>

      {/* Scrollable card body */}
      <div
        className="canvas-scroll"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px 14px 20px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          alignContent: 'start',
        }}
      >
        {colCards.map((card) => (
          <ColumnCard key={card.id} card={card} />
        ))}
        {colCards.length === 0 && (
          <div style={{
            width: '100%',
            paddingTop: 48,
            textAlign: 'center',
            fontSize: 12,
            color: isDropTarget ? 'rgba(99,102,241,0.6)' : 'rgba(100,116,139,0.5)',
            fontStyle: 'italic',
          }}>
            {isDropTarget
              ? 'Drop here to place in this section'
              : view === 'home'
                ? 'No starred items'
                : 'No cards yet'}
          </div>
        )}
      </div>
    </div>
  );
}
