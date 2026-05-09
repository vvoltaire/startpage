'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { CardData } from '@/types';

export default function LinkCard({ card }: { card: CardData }) {
  const updateCard = useStore((state) => state.updateCard);
  const url = card.data.url as string;
  const meta = card.data.meta as Record<string, string> | undefined;
  const fetchFailed = card.data.fetchFailed as boolean | undefined;

  useEffect(() => {
    if (!url || meta || fetchFailed) return;

    fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.status === 'success') {
          updateCard(card.id, {
            data: {
              ...card.data,
              meta: {
                title: json.data.title ?? '',
                description: json.data.description ?? '',
                image: json.data.image?.url ?? '',
                favicon: json.data.logo?.url ?? '',
              },
            },
          });
        } else {
          updateCard(card.id, { data: { ...card.data, fetchFailed: true } });
        }
      })
      .catch(() => {
        updateCard(card.id, { data: { ...card.data, fetchFailed: true } });
      });
  }, [url]);

  let hostname = url;
  try { hostname = new URL(url).hostname.replace('www.', ''); } catch {}

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onPointerDown={(e) => e.stopPropagation()}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        textDecoration: 'none',
        color: 'inherit',
        overflow: 'hidden',
      }}
    >
      {/* OG image / placeholder */}
      <div style={{ flexShrink: 0, height: 110, overflow: 'hidden', position: 'relative' }}>
        {meta?.image ? (
          <img
            src={meta.image}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : !meta && !fetchFailed ? (
          /* loading skeleton */
          <div style={{ width: '100%', height: '100%', background: 'rgba(0,0,0,0.04)' }} />
        ) : (
          /* placeholder — no OG image available */
          <img
            src="/placeholder.svg"
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        )}
      </div>

      {/* Text content */}
      <div style={{ padding: '10px 14px 12px', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* Favicon + domain */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {meta?.favicon && (
            <img src={meta.favicon} alt="" style={{ width: 14, height: 14, borderRadius: 2, flexShrink: 0 }} />
          )}
          <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {hostname}
          </span>
        </div>

        {/* Title */}
        {meta?.title ? (
          <p style={{
            margin: 0,
            fontSize: 13,
            fontWeight: 600,
            color: 'rgba(0,0,0,0.75)',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: 1.4,
          }}>
            {meta.title}
          </p>
        ) : !meta && !fetchFailed ? (
          <div style={{ height: 13, borderRadius: 4, background: 'rgba(0,0,0,0.07)', width: '80%' }} />
        ) : null}

        {/* Description */}
        {meta?.description ? (
          <p style={{
            margin: 0,
            fontSize: 12,
            color: 'rgba(0,0,0,0.4)',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: 1.45,
          }}>
            {meta.description}
          </p>
        ) : !meta && !fetchFailed ? (
          <div style={{ height: 12, borderRadius: 4, background: 'rgba(0,0,0,0.05)', width: '60%' }} />
        ) : null}

        {fetchFailed && (
          <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.3)' }}>{hostname}</span>
        )}
      </div>
    </a>
  );
}
