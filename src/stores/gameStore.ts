// T3.2 - Zustand 游戏状态管理

import { create } from 'zustand';
import { GameState, GameConfig, Word, GameRecord } from '@/types';
import { GameEngine } from '@/engine/GameEngine';
import { recordRepository } from '@/repositories/recordRepository';

/**
 * 游戏状态 Store
 */
interface GameStore {
  // 状态
  gameState: GameState;

  // 配置
  config: GameConfig;

  // 引擎实例
  engine: GameEngine | null;

  // UI 状态
  isPaused: boolean;
  showExitConfirm: boolean;

  // Actions
  initialize: (config: GameConfig, wordLibrary: Word[]) => void;
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  handleInput: (key: string) => boolean;
  reset: () => void;

  // 暂停控制
  togglePause: () => void;
  setShowExitConfirm: (show: boolean) => void;

  // 回调设置
  setOnGameEnd: (
    callback: (result: { score: number; wpm: number; accuracy: number }) => void
  ) => void;
}

/**
 * 创建游戏 Store
 */
export const useGameStore = create<GameStore>((set, get) => ({
  // 初始状态
  gameState: {
    status: 'idle',
    score: 0,
    combo: 0,
    elapsedTime: 0,
    currentWord: null,
    typedIndex: 0,
    activeWords: [],
    mistakes: 0,
    correctChars: 0,
    totalChars: 0,
  },

  config: {
    difficulty: 1,
    speed: 2,
    duration: 120,
    mode: 'letter',
  },

  engine: null,

  // UI 状态
  isPaused: false,
  showExitConfirm: false,

  // 初始化游戏
  initialize: (config: GameConfig, wordLibrary: Word[]) => {
    const engine = new GameEngine({
      onStateChange: (state) => {
        set({ gameState: { ...get().gameState, ...state } });
      },
    });

    engine.initialize(config, wordLibrary);

    set({
      engine,
      config,
      gameState: engine.getState(),
    });
  },

  // 开始游戏
  start: () => {
    const { engine } = get();
    if (engine) {
      engine.start();
    }
  },

  // 暂停游戏
  pause: () => {
    const { engine } = get();
    if (engine) {
      engine.pause();
    }
  },

  // 恢复游戏
  resume: () => {
    const { engine } = get();
    if (engine) {
      engine.resume();
    }
  },

  // 停止游戏
  stop: () => {
    const { engine } = get();
    if (engine) {
      engine.stop();
    }
  },

  // 处理输入
  handleInput: (key: string): boolean => {
    const { engine } = get();
    if (!engine) return false;
    return engine.handleInput(key);
  },

  // 重置游戏
  reset: () => {
    const { config } = get();
    // 重新初始化会重置状态
    set((state) => ({
      gameState: {
        status: 'idle',
        score: 0,
        combo: 0,
        elapsedTime: 0,
        currentWord: null,
        typedIndex: 0,
        activeWords: [],
        mistakes: 0,
        correctChars: 0,
        totalChars: 0,
      },
    }));
  },

  // 设置游戏结束回调
  setOnGameEnd: (callback) => {
    const { engine, config, gameState } = get();
    if (engine) {
      engine.setOnGameEndCallback((result) => {
        // 保存游戏记录
        const record: GameRecord = {
          id: `record-${Date.now()}`,
          libraryId: config.libraryId,
          mode: config.mode,
          difficulty: config.difficulty,
          score: result.score,
          wpm: result.wpm,
          accuracy: result.accuracy,
          maxCombo: gameState.combo,
          startedAt: Date.now() - gameState.elapsedTime,
          completedAt: Date.now(),
        };

        recordRepository
          .create(record)
          .catch((err) => console.error('保存游戏记录失败:', err));

        // 调用原始回调
        callback(result);
      });
    }
  },

  // 切换暂停状态
  togglePause: () => {
    const { isPaused, engine } = get();
    const newPaused = !isPaused;

    if (newPaused) {
      // 暂停游戏
      if (engine) {
        engine.pause();
      }
    } else {
      // 恢复游戏
      if (engine) {
        engine.resume();
      }
    }

    set({ isPaused: newPaused });
  },

  // 设置退出确认对话框显示状态
  setShowExitConfirm: (show: boolean) => {
    set({ showExitConfirm: show });
  },
}));
