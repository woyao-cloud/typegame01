// T2.1 - 核心 TypeScript 类型定义

// 游戏状态
export type GameStatus = 'idle' | 'playing' | 'paused' | 'gameover';

// 游戏模式
export type GameMode = 'letter' | 'word';

// 难度等级 (1-3 星)
export type Difficulty = 1 | 2 | 3;

// 速度等级 (1-4 档)
export type Speed = 1 | 2 | 3 | 4;

// 游戏配置
export interface GameConfig {
  mode: GameMode;
  difficulty: Difficulty;
  speed: Speed;
  duration: number; // 秒
  libraryId: string;
}

// 单词
export interface Word {
  id: string;
  text: string;
  category?: string;
  translation?: string;
}

// 游戏状态
export interface GameState {
  status: GameStatus;
  score: number;
  combo: number;
  elapsedTime: number; // 已用时间 (毫秒)
  currentWord: Word | null;
  typedIndex: number;
  mistakes: number;
  correctChars: number;
  totalChars: number;
}

// 游戏结果
export interface GameResult {
  score: number;
  wpm: number;
  accuracy: number;
  maxCombo: number;
  correctCount: number;
  errorCount: number;
  missCount: number;
}

// 游戏记录
export interface GameRecord {
  id: string;
  libraryId: string;
  mode: GameMode;
  difficulty: Difficulty;
  score: number;
  wpm: number;
  accuracy: number;
  maxCombo: number;
  startedAt: number;
  completedAt: number;
}

// 字库
export interface WordLibrary {
  id: string;
  name: string;
  description: string;
  language: string;
  words: Word[];
  createdAt: number;
  updatedAt: number;
  isBuiltIn: boolean;
}

// 音效配置
export interface AudioConfig {
  volume: number;
  muted: boolean;
  soundEnabled: boolean;
}

// 主题配置
export type ThemeId =
  | 'animals'
  | 'flowers'
  | 'fruits'
  | 'vehicles'
  | 'school'
  | 'family'
  | 'colors'
  | 'numbers';

export interface Theme {
  id: ThemeId;
  name: string;
  description: string;
  icon: string;
  mascot: string;
  primaryColor: string;
  secondaryColor: string;
  gradientFrom: string;
  gradientTo: string;
  vocabulary: string[];
}
