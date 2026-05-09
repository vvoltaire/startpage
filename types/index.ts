export type CardType = 'note' | 'link' | 'youtube' | 'image' | 'audio' | 'todo' | 'list' | 'section';

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
