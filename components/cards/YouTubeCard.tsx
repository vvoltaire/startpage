'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { CardData } from '@/types';

export default function YouTubeCard({ card }: { card: CardData }) {
  const updateCard = useStore((state) => state.updateCard);
  const [playing, setPlaying] = useState(false);

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
