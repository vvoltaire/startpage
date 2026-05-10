'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { CardData } from '@/types';

function PopOutIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="4.5" width="6.5" height="6.5" rx="1.2" stroke="white" strokeWidth="1.4"/>
      <path d="M7 1h4v4" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="11" y1="1" x2="6" y2="6" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

export default function YouTubeCard({ card }: { card: CardData }) {
  const updateCard = useStore((state) => state.updateCard);
  const openPip = useStore((s) => s.openPip);
  const [playing, setPlaying] = useState(false);
  const [thumbHover, setThumbHover] = useState(false);

  const videoId = card.data.videoId as string;
  const meta = card.data.meta as { title?: string; channel?: string } | undefined;

  useEffect(() => {
    if (!videoId || meta) return;
    const url = card.data.url as string;
    fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`)
      .then((r) => r.json())
      .then((d) => {
        updateCard(card.id, {
          data: { ...card.data, meta: { title: d.title ?? '', channel: d.author_name ?? '' } },
        });
      })
      .catch(() => {});
  }, [videoId]);

  const handlePopOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    openPip({
      id: crypto.randomUUID(),
      cardId: card.id,
      x: vw - 400 - 24,
      y: vh - 262 - 24,
      width: 400,
      height: 262,
      title: meta?.title || 'YouTube',
      videoId,
      type: 'youtube',
    });
  };

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {playing ? (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          style={{ flex: 1, border: 'none', display: 'block', width: '100%' }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <div
          onClick={() => setPlaying(true)}
          onMouseEnter={() => setThumbHover(true)}
          onMouseLeave={() => setThumbHover(false)}
          style={{ flex: 1, position: 'relative', cursor: 'pointer', overflow: 'hidden', minHeight: 0 }}
        >
          <img
            src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
            alt=""
            draggable={false}
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            }}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          {/* Scrim */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.12)' }} />

          {/* Play button */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'rgba(255,255,255,0.92)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 16px rgba(0,0,0,0.25)',
              transition: 'transform 0.15s',
              transform: thumbHover ? 'scale(1.08)' : 'scale(1)',
            }}>
              <div style={{
                width: 0, height: 0,
                borderTop: '9px solid transparent',
                borderBottom: '9px solid transparent',
                borderLeft: '15px solid rgba(0,0,0,0.75)',
                marginLeft: 4,
              }} />
            </div>
          </div>

          {/* Pop-out PiP button */}
          <button
            onClick={handlePopOut}
            title="Pop out"
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 30,
              height: 30,
              borderRadius: 8,
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: thumbHover ? 1 : 0,
              transform: thumbHover ? 'scale(1)' : 'scale(0.8)',
              transition: 'opacity 0.18s, transform 0.18s',
              pointerEvents: thumbHover ? 'auto' : 'none',
            }}
          >
            <PopOutIcon />
          </button>
        </div>
      )}

      {!playing && (
        <div style={{ padding: '8px 14px 10px', flexShrink: 0 }}>
          {meta?.title ? (
            <>
              <p style={{
                margin: 0, fontSize: 12, fontWeight: 600,
                color: 'rgba(0,0,0,0.72)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {meta.title}
              </p>
              {meta.channel && (
                <p style={{ margin: '2px 0 0', fontSize: 11, color: 'rgba(0,0,0,0.35)' }}>
                  {meta.channel}
                </p>
              )}
            </>
          ) : (
            <div style={{ height: 12, borderRadius: 4, background: 'rgba(0,0,0,0.07)', width: '70%' }} />
          )}
        </div>
      )}
    </div>
  );
}
