// T3.4 - 配置状态管理

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameConfig, AudioConfig, ThemeId } from '@/types';
import { DEFAULT_THEME } from '@/data/themes';

/**
 * 配置 Store
 */
interface ConfigStore {
  // 游戏配置
  gameConfig: GameConfig;

  // 音频配置
  audioConfig: AudioConfig;

  // 主题配置
  themeId: ThemeId;

  // Actions
  setGameConfig: (config: Partial<GameConfig>) => void;
  setAudioConfig: (config: Partial<AudioConfig>) => void;
  setTheme: (themeId: ThemeId) => void;
  reset: () => void;
}

/**
 * 默认配置
 */
const DEFAULT_GAME_CONFIG: GameConfig = {
  mode: 'letter',
  difficulty: 1,
  speed: 1,  // 默认慢速
  duration: 120,
  libraryId: 'default-letters',
};

const DEFAULT_AUDIO_CONFIG: AudioConfig = {
  volume: 0.8,  // 音量 80%
  muted: false,
  soundEnabled: true,
};

const DEFAULT_THEME_ID: ThemeId = 'animals'; // 默认主题：小动物

/**
 * 创建配置 Store
 */
export const useConfigStore = create<ConfigStore>()(
  persist(
    (set) => ({
      // 初始状态
      gameConfig: DEFAULT_GAME_CONFIG,
      audioConfig: DEFAULT_AUDIO_CONFIG,
      themeId: DEFAULT_THEME_ID,

      // 设置游戏配置
      setGameConfig: (config) =>
        set((state) => ({
          gameConfig: { ...state.gameConfig, ...config },
        })),

      // 设置音频配置
      setAudioConfig: (config) =>
        set((state) => ({
          audioConfig: { ...state.audioConfig, ...config },
        })),

      // 设置主题
      setTheme: (themeId) =>
        set(() => ({
          themeId,
        })),

      // 重置配置
      reset: () => ({
        gameConfig: DEFAULT_GAME_CONFIG,
        audioConfig: DEFAULT_AUDIO_CONFIG,
        themeId: DEFAULT_THEME_ID,
      }),
    }),
    {
      name: 'typing-game-config',
      partialize: (state) => ({
        gameConfig: state.gameConfig,
        audioConfig: state.audioConfig,
        themeId: state.themeId,
      }),
    }
  )
);
