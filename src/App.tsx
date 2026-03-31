// T4.5 - 主应用组件

'use client';

import React, { useEffect, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { useConfigStore } from '@/stores/configStore';
import { libraryRepository } from '@/repositories/libraryRepository';
import { StartScreen } from '@/components/game/StartScreen';
import { MenuScreen } from '@/components/game/MenuScreen';
import { GameScreen } from '@/components/game/GameScreen';
import { GameOver } from '@/components/game/GameOver';
import { RecordList } from '@/components/records/RecordList';
import { StatisticsPanel } from '@/components/records/StatisticsPanel';
import { LibraryManager } from '@/components/library/LibraryManager';
import { getAudioManager } from '@/utils/audio';
import { ErrorBoundary } from './components/errors/ErrorBoundary';
import { getThemeById } from '@/data/themes';

/**
 * 应用页面类型
 */
type AppScreen = 'start' | 'config' | 'game' | 'history' | 'library';

/**
 * 主应用组件
 */
export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('start');
  const { initialize, gameState, reset } = useGameStore();
  const { gameConfig, audioConfig, themeId } = useConfigStore();
  const currentTheme = getThemeById(themeId);

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

  // 开始游戏（从开始界面）
  const handleStartGameFromStart = () => {
    setCurrentScreen('config');
  };

  // 开始游戏（从配置界面）
  const handleStartGameFromConfig = async () => {
    try {
      // 获取词库
      const words = await libraryRepository.getWords(gameConfig.libraryId);

      if (words.length === 0) {
        console.error('词库为空，使用默认字母库');
        const defaultWords = 'abcdefghijklmnopqrstuvwxyz'.split('').map((char) => ({
          id: char,
          text: char,
          category: 'letter',
        }));
        initialize(gameConfig, defaultWords);
      } else {
        initialize(gameConfig, words);
      }

      setCurrentScreen('game');
    } catch (error) {
      console.error('获取词库失败:', error);
      const defaultWords = 'abcdefghijklmnopqrstuvwxyz'.split('').map((char) => ({
        id: char,
        text: char,
        category: 'letter',
      }));
      initialize(gameConfig, defaultWords);
      setCurrentScreen('game');
    }
  };

  // 返回开始界面
  const handleBackToStart = () => {
    reset();
    setCurrentScreen('start');
  };

  // 返回配置界面
  const handleBackToConfig = () => {
    setCurrentScreen('config');
  };

  // 查看历史记录
  const handleViewHistory = () => {
    setCurrentScreen('history');
  };

  // 管理字库
  const handleManageLibrary = () => {
    setCurrentScreen('library');
  };

  // 游戏结束后返回
  const handleGameEndBackToMenu = () => {
    reset();
    setCurrentScreen('start');
  };

  // 渲染当前屏幕
  const renderScreen = () => {
    switch (currentScreen) {
      case 'start':
        return (
          <StartScreen
            onStartGame={handleStartGameFromStart}
            onManageLibrary={handleManageLibrary}
            onViewHistory={handleViewHistory}
          />
        );

      case 'config':
        return (
          <MenuScreen
            onStartGame={handleStartGameFromConfig}
            onBack={handleBackToStart}
          />
        );

      case 'game':
        return (
          <GameScreen onBackToMenu={handleBackToStart} />
        );

      case 'history':
        return (
          <div className="min-h-screen bg-gradient-to-b from-sky-300 to-sky-100 p-4">
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={handleBackToStart}
                  className="text-2xl hover:scale-110 transition-transform"
                >
                  ←
                </button>
                <h1 className="text-3xl font-bold text-sky-600">历史记录</h1>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatisticsPanel />
                <RecordList limit={20} showAll />
              </div>
            </div>
          </div>
        );

      case 'library':
        return (
          <LibraryManager onBack={handleBackToStart} />
        );

      default:
        return null;
    }
  };

  return (
    <ErrorBoundary>
      <div className={`min-h-screen bg-gradient-to-b ${currentTheme?.gradientFrom || 'from-sky-200'} ${currentTheme?.gradientTo || 'to-sky-100'} transition-colors duration-1000`}>
        {renderScreen()}
      </div>
    </ErrorBoundary>
  );
}
