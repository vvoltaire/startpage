'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { CardData } from '@/types';
import Card from './Card';
import AddBar from './AddBar';
import NavBubble from './NavBubble';

const CANVAS_SIZE = 10000;
const INITIAL_SCROLL = 4400;

export default function Canvas() {
  const cards = useStore((state) => state.cards);
  const addCard = useStore((state) => state.addCard);
  const containerRef = useRef<HTMLDivElement>(null);
  const isPanning = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const [panning, setPanning] = useState(false);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = INITIAL_SCROLL;
      containerRef.current.scrollTop = INITIAL_SCROLL;
    }
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-card]')) return;
    isPanning.current = true;
    setPanning(true);
    lastMouse.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning.current || !containerRef.current) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    containerRef.current.scrollLeft -= dx;
    containerRef.current.scrollTop -= dy;
  }, []);

  const stopPan = useCallback(() => {
    isPanning.current = false;
    setPanning(false);
  }, []);

  const addCardAtCenter = useCallback(
    (type: CardData['type'], data: Record<string, unknown>) => {
      if (!containerRef.current) return;
      const vw = containerRef.current.clientWidth;
      const vh = containerRef.current.clientHeight;
      const sizes: Partial<Record<CardData['type'], [number, number]>> = {
        section:  [520, 360],
        youtube:  [400, 272],
        image:    [300, 300],
        link:     [300, 240],
        note:     [300, 200],
      };
      const [w, h] = sizes[type] ?? [300, 200];
      const x = containerRef.current.scrollLeft + vw / 2 - w / 2;
      const y = containerRef.current.scrollTop + vh / 2 - h / 2;
      addCard({ type, x, y, width: w, height: h, data, tags: [], starred: false, ...(type === 'section' ? { zIndex: 1 } : {}) });
    },
    [addCard]
  );

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <div
        ref={containerRef}
        className="canvas-scroll"
        style={{
          width: '100%',
          height: '100%',
          overflow: 'auto',
          cursor: panning ? 'grabbing' : 'grab',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={stopPan}
        onMouseLeave={stopPan}
      >
        <div
          className="canvas-bg"
          style={{ width: CANVAS_SIZE, height: CANVAS_SIZE, position: 'relative' }}
        >
          {cards.map((card) => (
            <Card key={card.id} card={card} />
          ))}
        </div>
      </div>

      <NavBubble />
      <AddBar onAdd={addCardAtCenter} />
    </div>
  );
}
