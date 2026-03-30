// T4.5 - 主应用组件

'use client';

import React, { useEffect } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { useConfigStore } from '@/stores/configStore';
import { libraryRepository } from '@/repositories/libraryRepository';
import { MenuScreen } from '@/components/game/MenuScreen';
import { GameScreen } from '@/components/game/GameScreen';
import { getAudioManager } from '@/utils/audio';
import { ErrorBoundary } from './components/errors/ErrorBoundary';
import { StatisticsPanel } from './components/records/StatisticsPanel';
import { RecordList } from './components/records/RecordList';

/**
 * 主应用组件
 */
export default function App() {
  const [isGameStarted, setIsGameStarted] = React.useState(false);
  const { initialize } = useGameStore();
  const { gameConfig, audioConfig } = useConfigStore();

  // 初始化音频管理器
  useEffect(() => {
    const audioManager = getAudioManager();
    audioManager.setConfig(audioConfig);

    // 在用户首次交互时初始化音频上下文
    const handleFirstInteraction = () => {
      audioManager.initialize();
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [audioConfig]);

  // 初始化词库
  useEffect(() => {
    libraryRepository
      .initializeDefaults()
      .catch((err) => console.error('初始化词库失败:', err));
  }, []);

  // 开始游戏
  const handleStartGame = async () => {
    try {
      // 获取词库
      const words = await libraryRepository.getWords(gameConfig.libraryId);

      if (words.length === 0) {
        console.error('词库为空，使用默认字母库');
        // 降级到默认字母库
        const defaultWords = 'abcdefghijklmnopqrstuvwxyz'.split('').map((char) => ({
          id: char,
          text: char,
          category: 'letter',
        }));
        initialize(gameConfig, defaultWords);
      } else {
        initialize(gameConfig, words);
      }

      setIsGameStarted(true);
    } catch (error) {
      console.error('获取词库失败:', error);
      // 使用默认字母库
      const defaultWords = 'abcdefghijklmnopqrstuvwxyz'.split('').map((char) => ({
        id: char,
        text: char,
        category: 'letter',
      }));
      initialize(gameConfig, defaultWords);
      setIsGameStarted(true);
    }
  };

  // 返回菜单
  const handleBackToMenu = () => {
    setIsGameStarted(false);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-sky-100">
        {isGameStarted ? (
          <GameScreen onBackToMenu={handleBackToMenu} />
        ) : (
          <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-6">
            <div className="w-full max-w-2xl">
              <MenuScreen onStartGame={handleStartGame} />
            </div>
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatisticsPanel />
              <RecordList limit={5} />
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
