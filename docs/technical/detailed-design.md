# 详细技术设计文档

## 儿童打字游戏 - MVP 版本

| 文档信息 | |
|---------|------|
| 版本号 | v1.0 |
| 创建日期 | 2026-03-30 |
| 基于文档 | FRD v1.0, NFRD v1.0, UI-SPEC v1.0 |

---

## 1. 系统架构概览

### 1.1 分层架构图

```
┌─────────────────────────────────────────────────────────┐
│                   Presentation Layer                     │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Screens (Start, Config, Game, Result, Library)    │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │ UI Components (Button, Card, Select, Display)     │  │
│  └───────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────┤
│                   Business Logic Layer                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ GameEngine  │  │ MatchLogic  │  │ ScoreSystem     │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ Difficulty  │  │ ComboSystem │  │ TimerService    │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────┤
│                   State Management Layer                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ GameStore   │  │ ConfigStore │  │ StatsStore      │  │
│  │ (Zustand)   │  │ (Zustand)   │  │ (Zustand)       │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────┤
│                   Data Access Layer                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ LibraryRepo │  │ RecordRepo  │  │ ConfigRepo      │  │
│  │ (IndexedDB) │  │ (IndexedDB) │  │ (localStorage)  │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────┤
│                   Utilities Layer                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ Keyboard    │  │ Audio       │  │ WPM Calculator  │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 2. 模块详细设计

### 2.1 游戏引擎模块 (GameEngine)

**职责**: 控制游戏生命周期，协调各子系统

```typescript
// src/engine/GameEngine.ts

import { GameState, GameConfig, GameStatus } from '@/types';
import { MatchLogic } from './MatchLogic';
import { ScoreSystem } from './ScoreSystem';
import { TimerService } from './TimerService';

// HIGH FIX #4: 游戏结束回调类型
export type GameEndCallback = (result: GameResult) => void | Promise<void>;

export class GameEngine {
  private state: GameState;
  private config: GameConfig | null = null;
  private matchLogic: MatchLogic;
  private scoreSystem: ScoreSystem;
  private timerService: TimerService;

  // 键盘去重相关 (CRITICAL FIX #3)
  private lastKeyPressTime = 0;
  private lastKeyPressKey = '';
  private static readonly KEY_DEBOUNCE_MS = 50; // 防抖阈值

  // 轨道终点检测相关 (CRITICAL FIX #1)
  private static readonly TRACK_END_Y = 100; // 轨道终点百分比
  private letterCheckInterval: NodeJS.Timeout | null = null;

  // 游戏结束回调 (HIGH FIX #4)
  private onGameEndCallback: GameEndCallback | null = null;

  constructor() {
    this.matchLogic = new MatchLogic();
    this.scoreSystem = new ScoreSystem();
    this.timerService = new TimerService();
    this.state = this.createInitialState();
  }

  /**
   * 设置游戏结束回调 (HIGH FIX #4)
   * 用于在游戏结束时保存记录
   */
  setOnGameEndCallback(callback: GameEndCallback): void {
    this.onGameEndCallback = callback;
  }

  // 生命周期方法
  start(config: GameConfig): void {
    this.config = config;
    this.state = this.createInitialState();
    this.timerService.start(config.duration, this.onTimeUp.bind(this));
    this.spawnLetter();
    this.startGameLoop(); // CRITICAL FIX #1: 启动游戏循环
  }

  pause(): void {
    this.state.status = 'paused';
    this.timerService.pause();
    this.stopGameLoop(); // 暂停时停止游戏循环
  }

  resume(): void {
    this.state.status = 'playing';
    this.timerService.resume();
    this.startGameLoop(); // 恢复时重启游戏循环
  }

  stop(): void {
    this.state.status = 'gameover';
    this.timerService.stop();
    this.stopGameLoop(); // CRITICAL FIX #1: 停止游戏循环
  }

  // 输入处理 (带键盘去重 - CRITICAL FIX #3)
  handleKeyPress(key: string): void {
    if (this.state.status !== 'playing') return;

    // 键盘去重逻辑：防止按住键时连续触发
    const now = Date.now();
    if (key === this.lastKeyPressKey && now - this.lastKeyPressTime < GameEngine.KEY_DEBOUNCE_MS) {
      return; // 去重：忽略 50ms 内的重复按键
    }
    this.lastKeyPressTime = now;
    this.lastKeyPressKey = key;

    const result = this.matchLogic.check(
      key,
      this.state.currentWord,
      this.state.typedInput,
      this.config?.difficulty ?? 1
    );

    if (result.isMatch) {
      this.handleMatchSuccess(result);
    } else {
      this.handleMatchFailure();
    }
  }

  // 内部方法
  private spawnLetter(): void {
    // 根据难度生成字母
    if (!this.config) return;

    const difficultyManager = new DifficultyManager();
    const targetChar = difficultyManager.generateTarget(
      this.getVocabulary(),
      this.config.difficulty,
      this.config.mode
    );

    const letter: FallingLetter = {
      id: crypto.randomUUID(),
      char: targetChar,
      x: Math.random() * 80 + 10, // 10%-90% 横向位置
      y: 0, // 从顶部开始
      speed: this.getLetterSpeed(),
      createdAt: Date.now()
    };

    this.state.fallingLetters.push(letter);
  }

  /**
   * 检查字母是否到达轨道终点 (CRITICAL FIX #1)
   * FRD-004-R5: 字母到达终点前未输入，判定为 Miss
   */
  private checkLetterReachedEnd(): void {
    const lettersToRemove: string[] = [];

    for (const letter of this.state.fallingLetters) {
      if (letter.y >= GameEngine.TRACK_END_Y) {
        // 字母到达终点，判定为 Miss
        this.scoreSystem.addMiss();
        this.state.missCount++;
        this.state.combo = 0; // 重置连击
        lettersToRemove.push(letter.id);
      }
    }

    // 移除到达终点的字母
    this.state.fallingLetters = this.state.fallingLetters.filter(
      l => !lettersToRemove.includes(l.id)
    );
  }

  /**
   * 更新字母位置 (CRITICAL FIX #1)
   */
  private updateLetterPositions(): void {
    for (const letter of this.state.fallingLetters) {
      // 根据速度更新 Y 坐标 (每帧移动)
      letter.y += (letter.speed / 16); // 假设 60fps
    }
    this.checkLetterReachedEnd();
  }

  /**
   * 启动游戏循环 (CRITICAL FIX #1)
   */
  private startGameLoop(): void {
    // 每 16ms 更新一次 (约 60fps)
    this.letterCheckInterval = setInterval(() => {
      if (this.state.status === 'playing') {
        this.updateLetterPositions();
      }
    }, 16);
  }

  private stopGameLoop(): void {
    if (this.letterCheckInterval) {
      clearInterval(this.letterCheckInterval);
      this.letterCheckInterval = null;
    }
  }

  private handleMatchSuccess(result: MatchResult): void {
    this.scoreSystem.addCorrect();
    this.state.combo = this.scoreSystem.getCombo();
    this.state.correctCount++;
    this.state.score = this.scoreSystem.getStats().score;
    // 移除已匹配的字母
    if (result.isComplete && this.state.fallingLetters.length > 0) {
      this.state.fallingLetters.shift();
    }
  }

  private handleMatchFailure(): void {
    this.scoreSystem.addError();
    this.state.errorCount++;
    // 播放错误反馈（由 UI 层处理）
  }

  private onTimeUp(): void {
    this.stop();
    // HIGH FIX #4: 触发游戏结束回调，保存记录
    this.triggerGameEnd();
  }

  /**
   * 触发游戏结束事件并保存记录 (HIGH FIX #4)
   */
  private async triggerGameEnd(): Promise<void> {
    const result = this.getResult();
    if (this.onGameEndCallback) {
      await this.onGameEndCallback(result);
    }
  }

  /**
   * 获取当前字库的词汇表
   */
  private getVocabulary(): string[] {
    // 从字库获取词汇，此处为伪代码
    // 实际实现需要从 repository 读取
    return [];
  }

  /**
   * 根据速度配置获取字母下落速度
   */
  private getLetterSpeed(): number {
    if (!this.config) return 20;
    // 速度等级：1=超慢，2=慢，3=中，4=快
    const speedMap: Record<number, number> = { 1: 10, 2: 20, 3: 40, 4: 80 };
    return speedMap[this.config.speed] || 20;
  }

  private createInitialState(): GameState {
    return {
      status: 'idle',
      score: 0,
      combo: 0,
      maxCombo: 0,
      wpm: 0,
      accuracy: 1,
      timeRemaining: 0,
      currentWord: null,
      typedInput: '',
      correctCount: 0,
      errorCount: 0,
      missCount: 0,
      fallingLetters: []
    };
  }

  // 状态获取
  getState(): GameState {
    return { ...this.state };
  }

  getResult(): GameResult {
    return {
      score: this.state.score,
      wpm: this.state.wpm,
      accuracy: this.state.accuracy,
      maxCombo: this.state.maxCombo,
      correctCount: this.state.correctCount,
      errorCount: this.state.errorCount,
      missCount: this.state.missCount
    };
  }
}
```

**类图**:
```
┌─────────────────────────────────────────┐
│            GameEngine                   │
├─────────────────────────────────────────┤
│ - state: GameState                      │
│ - config: GameConfig                    │
│ - matchLogic: MatchLogic                │
│ - scoreSystem: ScoreSystem              │
│ - timerService: TimerService            │
├─────────────────────────────────────────┤
│ + start(config): void                   │
│ + pause(): void                         │
│ + resume(): void                        │
│ + stop(): void                          │
│ + handleKeyPress(key): void             │
│ + getState(): GameState                 │
│ + getResult(): GameResult               │
└─────────────────────────────────────────┘
          ▲
          │ 使用
    ┌─────┴─────┐
    │           │
┌────────┐  ┌────────┐
│ Match  │  │ Score  │
│ Logic  │  │ System │
└────────┘  └────────┘
```

---

### 2.2 匹配逻辑模块 (MatchLogic)

**职责**: 处理键盘输入与目标的匹配判定

```typescript
// src/engine/MatchLogic.ts

export interface MatchResult {
  isMatch: boolean;
  matchedLength: number;
  isComplete: boolean;
  newInput: string;
}

export class MatchLogic {
  /**
   * 检查输入是否匹配目标
   * @param key - 按下的键
   * @param target - 目标单词/字母
   * @param currentInput - 当前已输入内容
   * @param difficulty - 难度等级
   */
  check(
    key: string,
    target: string | null,
    currentInput: string,
    difficulty: number
  ): MatchResult {
    if (!target) {
      return { isMatch: false, matchedLength: 0, isComplete: false, newInput: '' };
    }

    const newInput = currentInput + key.toLowerCase();
    const requiredLength = this.getRequiredLength(target, difficulty);
    const matchedLength = this.calculateMatchLength(newInput, target);

    return {
      isMatch: matchedLength >= requiredLength,
      matchedLength,
      isComplete: newInput === target,
      newInput: matchedLength > 0 ? newInput : ''
    };
  }

  /**
   * 根据难度获取需要匹配的字母数
   */
  private getRequiredLength(target: string, difficulty: number): number {
    switch (difficulty) {
      case 1: return 1;  // 简单：首字母
      case 2: return Math.min(3, Math.ceil(target.length / 2));  // 中等：一半
      case 3: return target.length;  // 困难：完整
      default: return 1;
    }
  }

  /**
   * 计算匹配长度
   */
  private calculateMatchLength(input: string, target: string): number {
    let length = 0;
    for (let i = 0; i < Math.min(input.length, target.length); i++) {
      if (input[i] === target[i]) {
        length++;
      } else {
        break;
      }
    }
    return length;
  }

  /**
   * 计算进度百分比
   */
  getProgress(input: string, target: string): number {
    if (target.length === 0) return 0;
    const matched = this.calculateMatchLength(input, target);
    return (matched / target.length) * 100;
  }
}
```

---

### 2.3 计分系统模块 (ScoreSystem)

**职责**: 管理得分、连击、统计

```typescript
// src/engine/ScoreSystem.ts

export interface ScoreStats {
  score: number;
  combo: number;
  maxCombo: number;
  correctCount: number;
  errorCount: number;
}

export class ScoreSystem {
  private score: number = 0;
  private combo: number = 0;
  private maxCombo: number = 0;
  private correctCount: number = 0;
  private errorCount: number = 0;

  // 配置常量
  private static readonly CORRECT_SCORE = 10;
  private static readonly COMBO_BONUS = 5;
  private static readonly COMBO_THRESHOLD = 5;
  private static readonly MISS_PENALTY = 5;

  addCorrect(): number {
    this.correctCount++;
    this.combo++;
    this.maxCombo = Math.max(this.maxCombo, this.combo);

    let points = ScoreSystem.CORRECT_SCORE;

    // 连击奖励
    if (this.combo >= ScoreSystem.COMBO_THRESHOLD) {
      points += this.combo * ScoreSystem.COMBO_BONUS;
    }

    this.score += points;
    return this.score;
  }

  addError(): void {
    this.errorCount++;
    this.combo = 0;
  }

  addMiss(): void {
    this.errorCount++;
    this.combo = 0;
    this.score = Math.max(0, this.score - ScoreSystem.MISS_PENALTY);
  }

  getStats(): ScoreStats {
    return {
      score: this.score,
      combo: this.combo,
      maxCombo: this.maxCombo,
      correctCount: this.correctCount,
      errorCount: this.errorCount
    };
  }

  getCombo(): number {
    return this.combo;
  }

  reset(): void {
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.correctCount = 0;
    this.errorCount = 0;
  }
}
```

---

### 2.4 难度管理模块 (DifficultyManager)

**职责**: 根据难度生成可用的字母范围

```typescript
// src/engine/DifficultyManager.ts

import { QWERTY_LAYOUT, KeyboardLayout } from '@/utils/keyboard';

export class DifficultyManager {
  private layout: KeyboardLayout = QWERTY_LAYOUT;

  /**
   * 根据难度和目标字母获取可用字符集
   */
  getAvailableChars(targetChar: string, difficulty: number): string[] {
    const normalizedChar = targetChar.toLowerCase();

    switch (difficulty) {
      case 1:
        return this.getAdjacentKeys(normalizedChar);
      case 2:
        return this.getSameHandZone(normalizedChar);
      case 3:
        return this.getAllKeys();
      default:
        return this.getAdjacentKeys(normalizedChar);
    }
  }

  /**
   * 获取相邻键 (简单难度)
   */
  private getAdjacentKeys(char: string): string[] {
    const pos = this.layout.keyPositions.get(char);
    if (!pos) return [char];

    const neighbors: string[] = [];
    const { row, col } = pos;

    // 上排相邻
    if (row > 0) {
      const aboveRow = this.layout.rows[row - 1];
      if (col < aboveRow.length) neighbors.push(aboveRow[col]);
      if (col > 0 && col - 1 < aboveRow.length) neighbors.push(aboveRow[col - 1]);
    }

    // 下排相邻
    if (row < this.layout.rows.length - 1) {
      const belowRow = this.layout.rows[row + 1];
      if (col < belowRow.length) neighbors.push(belowRow[col]);
      if (col > 0 && col - 1 < belowRow.length) neighbors.push(belowRow[col - 1]);
    }

    // 左右相邻
    const currentRow = this.layout.rows[row];
    if (col > 0) neighbors.push(currentRow[col - 1]);
    if (col < currentRow.length - 1) neighbors.push(currentRow[col + 1]);

    // 去重并添加目标字符本身
    return [...new Set([...neighbors, char])];
  }

  /**
   * 获取同手区字符 (中等难度)
   */
  private getSameHandZone(char: string): string[] {
    const isLeftHand = this.layout.handZones.left.includes(char);
    return isLeftHand
      ? this.layout.handZones.left
      : this.layout.handZones.right;
  }

  /**
   * 获取全键盘 (困难难度)
   */
  private getAllKeys(): string[] {
    return this.layout.rows.flat();
  }

  /**
   * 为单词练习生成目标
   */
  generateTarget(
    vocabulary: string[],
    difficulty: number,
    mode: 'letter' | 'word'
  ): string {
    if (mode === 'letter') {
      const allChars = this.getAllKeys();
      const randomIndex = Math.floor(Math.random() * allChars.length);
      return allChars[randomIndex];
    }

    // 单词模式：根据难度选择合适长度的单词
    const filteredVocab = vocabulary.filter(word => {
      if (difficulty === 1) return word.length <= 3;
      if (difficulty === 2) return word.length <= 5;
      return true;
    });

    const randomIndex = Math.floor(Math.random() * filteredVocab.length);
    return filteredVocab[randomIndex];
  }
}
```

---

### 2.5 键盘工具模块 (Keyboard Utils)

```typescript
// src/utils/keyboard.ts

export interface KeyPosition {
  row: number;
  col: number;
}

export interface KeyboardLayout {
  rows: string[][];
  keyPositions: Map<string, KeyPosition>;
  handZones: {
    left: string[];
    right: string[];
  };
}

export const QWERTY_LAYOUT: KeyboardLayout = {
  rows: [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm']
  ],
  keyPositions: new Map([
    ['q', { row: 0, col: 0 }],
    ['w', { row: 0, col: 1 }],
    ['e', { row: 0, col: 2 }],
    ['r', { row: 0, col: 3 }],
    ['t', { row: 0, col: 4 }],
    ['y', { row: 0, col: 5 }],
    ['u', { row: 0, col: 6 }],
    ['i', { row: 0, col: 7 }],
    ['o', { row: 0, col: 8 }],
    ['p', { row: 0, col: 9 }],
    ['a', { row: 1, col: 0 }],
    ['s', { row: 1, col: 1 }],
    ['d', { row: 1, col: 2 }],
    ['f', { row: 1, col: 3 }],
    ['g', { row: 1, col: 4 }],
    ['h', { row: 1, col: 5 }],
    ['j', { row: 1, col: 6 }],
    ['k', { row: 1, col: 7 }],
    ['l', { row: 1, col: 8 }],
    ['z', { row: 2, col: 0 }],
    ['x', { row: 2, col: 1 }],
    ['c', { row: 2, col: 2 }],
    ['v', { row: 2, col: 3 }],
    ['b', { row: 2, col: 4 }],
    ['n', { row: 2, col: 5 }],
    ['m', { row: 2, col: 6 }]
  ]),
  handZones: {
    left: ['q', 'w', 'e', 'r', 't', 'a', 's', 'd', 'f', 'g', 'z', 'x', 'c', 'v', 'b'],
    right: ['y', 'u', 'i', 'o', 'p', 'h', 'j', 'k', 'l', 'n', 'm']
  }
};

/**
 * 获取键位的手别
 */
export function getHandZone(key: string): 'left' | 'right' {
  return QWERTY_LAYOUT.handZones.left.includes(key.toLowerCase())
    ? 'left'
    : 'right';
}

/**
 * 获取键位之间的距离 (用于计算难度)
 */
export function getKeyDistance(key1: string, key2: string): number {
  const pos1 = QWERTY_LAYOUT.keyPositions.get(key1.toLowerCase());
  const pos2 = QWERTY_LAYOUT.keyPositions.get(key2.toLowerCase());

  if (!pos1 || !pos2) return Infinity;

  return Math.abs(pos1.row - pos2.row) + Math.abs(pos1.col - pos2.col);
}
```

---

### 2.6 定时器服务 (TimerService)

```typescript
// src/engine/TimerService.ts

export class TimerService {
  private remainingSeconds: number = 0;
  private intervalId: NodeJS.Timeout | null = null;
  private isPaused: boolean = false;
  private onTimeUpCallback: (() => void) | null = null;

  start(durationSeconds: number, onTimeUp: () => void): void {
    this.remainingSeconds = durationSeconds;
    this.isPaused = false;
    this.onTimeUpCallback = onTimeUp;

    this.intervalId = setInterval(() => {
      if (!this.isPaused) {
        this.remainingSeconds--;

        if (this.remainingSeconds <= 0) {
          this.stop();
          this.onTimeUpCallback?.();
        }
      }
    }, 1000);
  }

  pause(): void {
    this.isPaused = true;
  }

  resume(): void {
    this.isPaused = false;
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.remainingSeconds = 0;
  }

  getRemainingSeconds(): number {
    return this.remainingSeconds;
  }

  getFormattedTime(): string {
    const minutes = Math.floor(this.remainingSeconds / 60);
    const seconds = this.remainingSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}
```

---

### 2.7 WPM 计算工具

```typescript
// src/utils/wpm.ts

/**
 * 计算 WPM (Words Per Minute)
 * 标准：5 个字符 = 1 个单词
 *
 * HIGH FIX #6: 参数名从 durationSeconds 改为 elapsedSeconds
 * 因为游戏过程中 WPM 是实时计算的，应该使用"已用时间"而非"总时长"
 */
export function calculateWPM(correctChars: number, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0) return 0;

  const words = correctChars / 5;
  const minutes = elapsedSeconds / 60;

  return Math.round(words / minutes);
}

/**
 * 计算正确率
 */
export function calculateAccuracy(correct: number, errors: number): number {
  const total = correct + errors;
  if (total === 0) return 1;

  return Math.round((correct / total) * 100) / 100;
}
```

---

### 2.8 音频管理器 (AudioManager) - HIGH FIX #5

**职责**: 管理游戏音效播放，支持音量控制和静音模式

```typescript
// src/utils/AudioManager.ts

export type SoundType = 'correct' | 'error' | 'combo' | 'levelup';

export interface AudioConfig {
  volume: number;        // 0.0 - 1.0
  muted: boolean;
  soundEnabled: boolean; // 用户开关
}

export class AudioManager {
  private config: AudioConfig;
  private audioElements: Map<SoundType, HTMLAudioElement>;
  private isInitialized: boolean = false;

  constructor() {
    this.config = {
      volume: 0.6,
      muted: false,
      soundEnabled: true
    };
    this.audioElements = new Map();
  }

  /**
   * 初始化音频管理器
   * 预加载所有音效文件
   */
  initialize(): void {
    if (this.isInitialized) return;

    // FRD-009: 四种音效
    const soundFiles: Record<SoundType, string> = {
      correct: '/audio/correct.mp3',    // 清脆高音，0.2s
      error: '/audio/error.mp3',        // 低沉提示，0.3s
      combo: '/audio/combo.mp3',        // 胜利音效，0.5s
      levelup: '/audio/levelup.mp3'     // 庆祝音效，1.0s
    };

    for (const [type, file] of Object.entries(soundFiles)) {
      const audio = new Audio(file);
      audio.preload = 'auto';
      this.audioElements.set(type as SoundType, audio);
    }

    this.isInitialized = true;
  }

  /**
   * 播放音效
   * @param type - 音效类型
   * @param override - 是否覆盖静音设置（用于测试）
   */
  play(type: SoundType, override: boolean = false): void {
    if (!this.isInitialized) {
      this.initialize();
    }

    // 检查是否允许播放
    if (!override && (this.config.muted || !this.config.soundEnabled)) {
      return;
    }

    const audio = this.audioElements.get(type);
    if (audio) {
      audio.currentTime = 0; // 从头播放
      audio.volume = this.config.volume;

      // 处理播放失败（如浏览器自动播放限制）
      audio.play().catch(err => {
        console.warn(`Audio play failed: ${type}`, err);
      });
    }
  }

  /**
   * 播放正确音效
   */
  playCorrect(): void {
    this.play('correct');
  }

  /**
   * 播放错误音效
   */
  playError(): void {
    this.play('error');
  }

  /**
   * 播放连击音效
   */
  playCombo(): void {
    this.play('combo');
  }

  /**
   * 播放升级音效
   */
  playLevelUp(): void {
    this.play('levelup');
  }

  /**
   * 设置音量
   * @param volume - 0.0 到 1.0
   */
  setVolume(volume: number): void {
    this.config.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * 设置静音
   */
  setMuted(muted: boolean): void {
    this.config.muted = muted;
  }

  /**
   * 设置音效开关
   */
  setSoundEnabled(enabled: boolean): void {
    this.config.soundEnabled = enabled;
  }

  /**
   * 获取当前配置
   */
  getConfig(): AudioConfig {
    return { ...this.config };
  }

  /**
   * 清理资源
   */
  dispose(): void {
    for (const audio of this.audioElements.values()) {
      audio.pause();
      audio.src = '';
    }
    this.audioElements.clear();
    this.isInitialized = false;
  }
}

// 单例模式
let audioManagerInstance: AudioManager | null = null;

export function getAudioManager(): AudioManager {
  if (!audioManagerInstance) {
    audioManagerInstance = new AudioManager();
  }
  return audioManagerInstance;
}
```

**音效规格**（FRD-009）:

| 类型 | 文件名 | 时长 | 音量 | 描述 |
|-----|-------|------|------|------|
| correct | correct.mp3 | 0.2s | 60% | 清脆高音，正确输入时 |
| error | error.mp3 | 0.3s | 50% | 低沉提示，错误输入时 |
| combo | combo.mp3 | 0.5s | 70% | 胜利音效，连击达成时 |
| levelup | levelup.mp3 | 1.0s | 70% | 庆祝音效，升级时 |

**备选方案**（风险缓解）:

```typescript
// 如果音频文件加载失败，使用 Web Audio API 生成简单音效
function generateFallbackSound(type: SoundType): void {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  switch (type) {
    case 'correct':
      oscillator.frequency.value = 800; // 高音
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      ctx.currentTime += 0.2;
      break;
    case 'error':
      oscillator.frequency.value = 200; // 低音
      oscillator.type = 'square';
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
      ctx.currentTime += 0.3;
      break;
  }

  oscillator.start();
  oscillator.stop(ctx.currentTime + 0.5);
}
```

---

## 3. 状态管理设计

### 3.1 GameStore

```typescript
// src/stores/gameStore.ts

import { create } from 'zustand';
import { GameState, GameConfig, GameResult } from '@/types';
import { GameEngine } from '@/engine/GameEngine';

interface GameStore {
  // State
  gameState: GameState;
  config: GameConfig | null;
  engine: GameEngine | null;

  // Actions
  startGame: (config: GameConfig) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  stopGame: () => void;
  handleKeyPress: (key: string) => void;
  updateGameState: (updates: Partial<GameState>) => void;

  // Selectors
  getScore: () => number;
  getCombo: () => number;
  getTimeRemaining: () => string;
}

// HIGH FIX #4: 游戏结束回调集成
async function saveGameRecord(result: GameResult): Promise<void> {
  const { recordRepository } = await import('@/repositories/recordRepository');

  const record: GameRecord = {
    id: crypto.randomUUID(),
    config: get().config!,
    result,
    timestamp: Date.now()
  };

  await recordRepository.save(record);
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: {
    status: 'idle',
    score: 0,
    combo: 0,
    maxCombo: 0,
    wpm: 0,
    accuracy: 1,
    timeRemaining: 0,
    currentWord: null,
    typedInput: '',
    correctCount: 0,
    errorCount: 0,
    missCount: 0,
    fallingLetters: []
  },
  config: null,
  engine: null,

  startGame: (config) => {
    const engine = new GameEngine();

    // HIGH FIX #4: 设置游戏结束回调，自动保存记录
    engine.setOnGameEndCallback(async (result) => {
      await saveGameRecord(result);
    });

    engine.start(config);

    set({
      config,
      engine,
      gameState: engine.getState()
    });

    // 启动游戏循环
    const gameLoop = setInterval(() => {
      const state = get().engine?.getState();
      if (state) {
        set({ gameState: state });
      }
      if (state?.status === 'gameover') {
        clearInterval(gameLoop);
      }
    }, 100);
  },

  pauseGame: () => {
    get().engine?.pause();
    set({ gameState: get().engine?.getState() ?? get().gameState });
  },

  resumeGame: () => {
    get().engine?.resume();
    set({ gameState: get().engine?.getState() ?? get().gameState });
  },

  stopGame: () => {
    get().engine?.stop();
    set({ gameState: get().engine?.getState() ?? get().gameState });
  },

  handleKeyPress: (key) => {
    get().engine?.handleKeyPress(key);
    set({ gameState: get().engine?.getState() ?? get().gameState });
  },

  updateGameState: (updates) => {
    set({ gameState: { ...get().gameState, ...updates } });
  },

  getScore: () => get().gameState.score,
  getCombo: () => get().gameState.combo,
  getTimeRemaining: () => {
    const seconds = get().gameState.timeRemaining;
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  }
}));
```

### 3.2 ConfigStore

```typescript
// src/stores/configStore.ts

import { create } from 'zustand';
import { GameConfig } from '@/types';

interface ConfigStore {
  // 当前配置
  currentConfig: Partial<GameConfig>;

  // 预设配置
  presets: {
    beginner: GameConfig;
    intermediate: GameConfig;
    advanced: GameConfig;
  };

  // Actions
  setGameMode: (mode: 'letter' | 'word') => void;
  setDifficulty: (difficulty: 1 | 2 | 3) => void;
  setSpeed: (speed: 1 | 2 | 3 | 4) => void;
  setDuration: (duration: number) => void;
  setLibrary: (libraryId: string) => void;
  resetToPreset: (preset: 'beginner' | 'intermediate' | 'advanced') => void;
}

export const useConfigStore = create<ConfigStore>((set) => ({
  currentConfig: {
    mode: 'letter',
    difficulty: 1,
    speed: 2,
    duration: 300,
    libraryId: 'default'
  },

  presets: {
    beginner: {
      mode: 'letter',
      difficulty: 1,
      speed: 2,
      duration: 120,
      libraryId: 'default'
    },
    intermediate: {
      mode: 'word',
      difficulty: 2,
      speed: 3,
      duration: 300,
      libraryId: 'default'
    },
    advanced: {
      mode: 'word',
      difficulty: 3,
      speed: 4,
      duration: 600,
      libraryId: 'default'
    }
  },

  setGameMode: (mode) =>
    set(state => ({
      currentConfig: { ...state.currentConfig, mode }
    })),

  setDifficulty: (difficulty) =>
    set(state => ({
      currentConfig: { ...state.currentConfig, difficulty }
    })),

  setSpeed: (speed) =>
    set(state => ({
      currentConfig: { ...state.currentConfig, speed }
    })),

  setDuration: (duration) =>
    set(state => ({
      currentConfig: { ...state.currentConfig, duration }
    })),

  setLibrary: (libraryId) =>
    set(state => ({
      currentConfig: { ...state.currentConfig, libraryId }
    })),

  resetToPreset: (preset) =>
    set(state => ({
      currentConfig: { ...state.presets[preset] }
    }))
}));
```

---

## 4. 数据流设计

### 4.1 游戏开始流程

```
用户点击"开始游戏"
         │
         ▼
┌─────────────────┐
│ ConfigScreen    │ 读取配置表单数据
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ ConfigStore     │ 保存配置到 Store
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ GameEngine      │ 初始化游戏引擎
│ .start(config)  │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ GameStore       │ 更新游戏状态为 playing
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ GameScreen      │ 渲染游戏界面
└─────────────────┘
```

### 4.2 键盘输入处理流程

```
用户按下键盘
         │
         ▼
┌─────────────────┐
│ KeyboardEvent   │ 捕获 keydown 事件
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ GameEngine      │ 处理输入
│ .handleKeyPress │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ MatchLogic      │ 检查匹配
│ .check()        │
└─────────────────┘
         │
         ├──────────────┐
         │ 匹配成功     │ 匹配失败
         ▼              ▼
┌─────────────┐  ┌─────────────┐
│ScoreSystem  │  │ScoreSystem  │
│.addCorrect()│  │.addError()  │
└─────────────┘  └─────────────┘
         │              │
         ▼              ▼
┌─────────────────────────────┐
│     GameStore 更新状态       │
│  score, combo, accuracy...  │
└─────────────────────────────┘
         │
         ▼
┌─────────────────┐
│ GameScreen      │ 重新渲染
│ - 字母高亮      │
│ - 分数更新      │
│ - 连击动画      │
└─────────────────┘
```

### 4.3 游戏结束流程

```
计时器归零
         │
         ▼
┌─────────────────┐
│ TimerService    │ 触发 onTimeUp
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ GameEngine      │ 停止游戏
│ .stop()         │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ GameEngine      │ 计算最终统计
│ .getResult()    │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ RecordRepo      │ 保存游戏记录
│ .save(result)   │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ ResultScreen    │ 显示结果界面
└─────────────────┘
```

---

## 5. 接口定义

### 5.1 公共类型接口

```typescript
// src/types/index.ts

// 游戏状态
export type GameStatus = 'idle' | 'playing' | 'paused' | 'gameover';

// 游戏模式
export type GameMode = 'letter' | 'word';

// 难度等级
export type Difficulty = 1 | 2 | 3;

// 速度等级
export type Speed = 1 | 2 | 3 | 4;

// 游戏配置
export interface GameConfig {
  mode: GameMode;
  difficulty: Difficulty;
  speed: Speed;
  duration: number;
  libraryId: string;
}

// 游戏状态
export interface GameState {
  status: GameStatus;
  score: number;
  combo: number;
  maxCombo: number;
  wpm: number;
  accuracy: number;
  timeRemaining: number;
  currentWord: string | null;
  typedInput: string;
  correctCount: number;
  errorCount: number;
  missCount: number;
  fallingLetters: FallingLetter[];
}

// 下落字母
export interface FallingLetter {
  id: string;
  char: string;
  x: number;
  y: number;
  speed: number;
  createdAt: number;
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
  config: GameConfig;
  result: GameResult;
  timestamp: number;
}

// 字库
export interface WordLibrary {
  id: string;
  name: string;
  type: 'letter' | 'word';
  characters: string[];
  isDefault: boolean;
  createdAt: number;
  updatedAt: number;
}
```

---

## 6. 存储层设计

### 6.1 Repository 接口

```typescript
// src/repositories/types.ts

export interface Repository<T, ID = string> {
  getAll(): Promise<T[]>;
  getById(id: ID): Promise<T | null>;
  save(entity: T): Promise<void>;
  delete(id: ID): Promise<void>;
}
```

### 6.2 字库 Repository

```typescript
// src/repositories/libraryRepository.ts

import localforage from 'localforage';
import { WordLibrary } from '@/types';
import { Repository } from './types';

const STORE_PREFIX = 'library_';

// CRITICAL FIX #2: 字库验证函数
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * 验证字库数据的有效性 (FRD-002-R3, FRD-002-R4)
 */
export function validateWordLibrary(data: unknown): ValidationResult {
  const errors: string[] = [];

  // 1. JSON 结构验证
  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['无效的 JSON 格式'] };
  }

  const lib = data as Partial<WordLibrary>;

  // 2. 必填字段验证
  if (!lib.name || typeof lib.name !== 'string') {
    errors.push('缺少必填字段：name');
  } else if (lib.name.length > 50) {
    errors.push('字库名称不能超过 50 个字符');
  }

  if (!lib.characters || !Array.isArray(lib.characters)) {
    errors.push('缺少必填字段：characters');
  } else {
    // 3. 字符数量验证 (FRD-002-R4: 最多 500 个)
    if (lib.characters.length > 500) {
      errors.push('字库最多包含 500 个字符/单词');
    }

    // 4. 字符类型验证 (FRD-002-R2: 只允许字母和基本标点)
    const validCharRegex = /^[a-zA-Z\s.,!?;:'"-]+$/;
    for (let i = 0; i < lib.characters.length; i++) {
      const char = lib.characters[i];
      if (typeof char !== 'string') {
        errors.push(`第 ${i + 1} 个字符必须是字符串类型`);
      } else if (!validCharRegex.test(char)) {
        errors.push(`第 ${i + 1} 个字符包含非法字符：${char}`);
      }
    }
  }

  // 5. 类型一致性验证
  if (lib.type && !['letter', 'word'].includes(lib.type)) {
    errors.push('type 字段必须是 "letter" 或 "word"');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export const libraryRepository: Repository<WordLibrary> = {
  async getAll(): Promise<WordLibrary[]> {
    const keys = await localforage.keys();
    const libraryKeys = keys.filter(k => k.startsWith(STORE_PREFIX));
    const libraries = await Promise.all(
      libraryKeys.map(k => localforage.getItem<WordLibrary>(k))
    );
    return libraries.filter((l): l is WordLibrary => l !== null);
  },

  async getById(id: string): Promise<WordLibrary | null> {
    return await localforage.getItem<WordLibrary>(STORE_PREFIX + id);
  },

  async save(library: WordLibrary): Promise<void> {
    // 保存前验证 (CRITICAL FIX #2)
    const result = validateWordLibrary(library);
    if (!result.isValid) {
      throw new LibraryError('字库验证失败', result.errors);
    }

    library.updatedAt = Date.now();
    await localforage.setItem(STORE_PREFIX + library.id, library);
  },

  async delete(id: string): Promise<void> {
    await localforage.removeItem(STORE_PREFIX + id);
  },

  /**
   * 导入字库（带验证）(CRITICAL FIX #2)
   */
  async import(json: string): Promise<WordLibrary> {
    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch (e) {
      throw new LibraryError('JSON 解析失败', e);
    }

    const validation = validateWordLibrary(parsed);
    if (!validation.isValid) {
      throw new LibraryError('字库验证失败', validation.errors);
    }

    const library = parsed as WordLibrary;
    library.id = crypto.randomUUID();
    library.createdAt = Date.now();
    library.updatedAt = Date.now();

    await this.save(library);
    return library;
  }
};
```

### 6.3 游戏记录 Repository

```typescript
// src/repositories/recordRepository.ts

import localforage from 'localforage';
import { GameRecord } from '@/types';

const STORE_PREFIX = 'record_';
const MAX_RECORDS = 100;

export const recordRepository = {
  async getAll(): Promise<GameRecord[]> {
    const keys = await localforage.keys();
    const recordKeys = keys.filter(k => k.startsWith(STORE_PREFIX));
    const records = await Promise.all(
      recordKeys.map(k => localforage.getItem<GameRecord>(k))
    );
    return records
      .filter((r): r is GameRecord => r !== null)
      .sort((a, b) => b.timestamp - a.timestamp);
  },

  async save(record: GameRecord): Promise<void> {
    await localforage.setItem(STORE_PREFIX + record.id, record);

    // 清理旧记录
    const allRecords = await this.getAll();
    if (allRecords.length > MAX_RECORDS) {
      const toDelete = allRecords.slice(MAX_RECORDS);
      for (const r of toDelete) {
        await localforage.removeItem(STORE_PREFIX + r.id);
      }
    }
  },

  async delete(id: string): Promise<void> {
    await localforage.removeItem(STORE_PREFIX + id);
  },

  async getRecent(count: number): Promise<GameRecord[]> {
    const all = await this.getAll();
    return all.slice(0, count);
  }
};
```

---

## 7. 组件设计

### 7.1 组件树结构

```
App
├── Router
│   ├── StartScreen
│   │   ├── Logo
│   │   ├── Character
│   │   └── Button[]
│   ├── ConfigScreen
│   │   ├── ModeSelector
│   │   ├── DifficultySelector
│   │   ├── SpeedSelector
│   │   ├── DurationSelector
│   │   └── LibrarySelector
│   ├── GameScreen
│   │   ├── StatusBar
│   │   │   ├── Timer
│   │   │   ├── Score
│   │   │   ├── Combo
│   │   │   └── Accuracy
│   │   ├── TrackContainer
│   │   │   └── FallingLetter[]
│   │   ├── Character
│   │   └── KeyboardDisplay
│   ├── ResultScreen
│   │   ├── ScoreCard
│   │   ├── StatsGrid
│   │   └── ActionButtons
│   └── LibraryScreen
│       ├── LibraryList
│       └── LibraryEditor
└── Provider
    ├── ZustandProvider
    └── ThemeProvider
```

---

## 8. 错误处理设计

### 8.1 错误类型定义

```typescript
// src/types/errors.ts

export class GameError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'GameError';
  }
}

export class LibraryError extends GameError {
  constructor(message: string, public details?: unknown) {
    super(message, 'LIBRARY_ERROR');
    this.name = 'LibraryError';
  }
}

export class StorageError extends GameError {
  constructor(message: string, public cause?: unknown) {
    super(message, 'STORAGE_ERROR');
    this.name = 'StorageError';
  }
}
```

### 8.2 错误边界

```typescript
// src/components/ErrorBoundary.tsx

import React from 'react';

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>出错了</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            重新加载
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## 9. 性能优化策略

### 9.1 渲染优化

```typescript
// 使用 React.memo 缓存组件
const FallingLetter = React.memo(({ letter, speed }: Props) => {
  return (
    <div
      className="falling-letter"
      style={{
        transform: `translateY(${letter.y}px)`,
        transition: `transform ${speed}ms linear`
      }}
    >
      {letter.char}
    </div>
  );
});

// 使用 useMemo 缓存计算结果
const availableChars = useMemo(() => {
  return difficultyManager.getAvailableChars(target, difficulty);
}, [target, difficulty]);
```

### 9.2 动画优化

```css
/* 使用 transform 而非 top/left */
.falling-letter {
  will-change: transform;
  transform: translateY(0);
}

/* 使用 CSS 动画而非 JS */
@keyframes fall {
  from { transform: translateY(0); }
  to { transform: translateY(100%); }
}
```

---

## 10. 验收标准对照表

| FRD 编号 | 功能 | 技术实现 | 验收方式 |
|---------|------|---------|---------|
| FRD-001 | 游戏模式 | ConfigStore.mode | 单元测试 |
| FRD-002 | 字库管理 | libraryRepository | E2E 测试 |
| FRD-003 | 难度系统 | DifficultyManager | 单元测试 |
| FRD-004 | 轨道系统 | TrackContainer | 视觉验收 |
| FRD-005 | 匹配逻辑 | MatchLogic | 单元测试 |
| FRD-006 | 计分系统 | ScoreSystem | 单元测试 |
| FRD-007 | 时间控制 | TimerService | 单元测试 |
| FRD-008 | 速度配置 | ConfigStore.speed | 视觉验收 |
| FRD-009 | 音效系统 | AudioManager | 手动测试 |
| FRD-010 | 游戏统计 | recordRepository | E2E 测试 |
| FRD-011 | 中文界面 | i18n strings | 视觉验收 |

---

## 11. 待决策事项

| 编号 | 事项 | 影响范围 | 建议 |
|-----|------|---------|------|
| TBD-001 | 音效素材来源 | Phase 8 | 使用免费素材库 |
| TBD-002 | 卡通形象来源 | Phase 5 | 先用 emoji 替代 |
| TBD-003 | 是否支持 PWA | Phase 12 | MVP 可选 |
| TBD-004 | 路由库选择 | Phase 4 | React Router |
