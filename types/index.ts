export type CardType = 'note' | 'link' | 'youtube' | 'image' | 'audio' | 'todo' | 'list' | 'section' | 'folder';

export interface CardData {
  id: string;
  type: CardType;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  data: Record<string, unknown>;
  tags: string[];
  starred: boolean;
}

export interface Decoration {
  id: string;
  x: number;
  y: number;
  src: string;
  width: number;
}

export interface PipWindow {
  id: string;
  cardId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  videoId?: string;
  type: 'youtube' | 'image';
}
