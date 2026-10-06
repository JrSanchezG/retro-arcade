export type GameGenre = 'all' | 'classics' | 'action' | 'puzzle' | 'sports';

export type AccentColor = 'gold' | 'cyan' | 'purple';

export interface GameControl {
  key: string;
  action: string;
}

export interface ArcadeGame {
  id: string;
  title: string;
  genre: GameGenre;
  genreLabel: string;
  year: number;
  players: '1P' | '1P / 2P' | '2P';
  rating: number; // e.g. 4.9
  highScore: number;
  coverImage: string;
  previewVideo: string;
  tagline: string;
  description: string;
  difficulty: 'Fácil' | 'Medio' | 'Difícil' | 'Extremo';
  controls: GameControl[];
  accentColor: AccentColor;
  features: string[];
  pythonCode: string;
}

export interface PlayerScore {
  gameId: string;
  initials: string;
  score: number;
  date: string;
}
