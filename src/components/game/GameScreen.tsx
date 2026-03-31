// T4.1 - 游戏主界面组件

'use client';

import React, { useEffect, useCallback } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { useConfigStore } from '@/stores/configStore';
import { TrackManager } from '@/engine/TrackManager';
import { GameHUD } from './GameHUD';
import { GameOver } from './GameOver';
import { PauseMenu } from './PauseMenu';
import { ExitConfirmDialog } from './ExitConfirmDialog';
import { useKeyboard } from '@/hooks/useKeyboard';
import { getAudioManager } from '@/utils/audio';
import { getThemeById } from '@/data/themes';

interface GameScreenProps {
  onBackToMenu: () => void;
}

/**
 * 游戏主界面
 * 包含：轨道区域、HUD、游戏结束弹窗、暂停菜单、退出确认
 */
export function GameScreen({ onBackToMenu }: GameScreenProps) {
  const {
    gameState,
    config,
    handleInput,
    setOnGameEnd,
    start,
    isPaused,
    showExitConfirm,
    togglePause,
    setShowExitConfirm,
  } = useGameStore();
  const { themeId } = useConfigStore();
  const currentTheme = getThemeById(themeId);
  const audioManager = getAudioManager();

  // 游戏结束回调
  React.useEffect(() => {
    setOnGameEnd((result) => {
      console.log('Game ended:', result);
    });
  }, [setOnGameEnd]);

  // 键盘输入处理
  const handleKeyPress = useCallback((key: string) => {
    handleInput(key);
  }, [handleInput]);

  // 使用键盘 Hook
  useKeyboard({
    enabled: gameState.status === 'playing' && !isPaused,
    onKeyPress: handleKeyPress,
  });

  // 游戏开始时启动游戏
  React.useEffect(() => {
    console.log('GameScreen useEffect, gameState.status:', gameState.status);
    // 在游戏刚进入 playing 状态时启动（由 engine 的 initialize 设置）
    if (gameState.status === 'playing') {
      console.log('Game already started, skipping start()');
    } else if (gameState.status === 'idle') {
      console.log('Calling start()');
      audioManager.initialize();
      start();
    }
  }, [gameState.status]); // 监听 status 变化

  // ESC 键暂停
  React.useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && gameState.status === 'playing') {
        togglePause();
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [gameState.status, togglePause]);

  // 计算当前 WPM
  const wpm = React.useMemo(() => {
    const elapsedMinutes = gameState.elapsedTime / 1000 / 60;
    if (elapsedMinutes === 0) return 0;
    return Math.round((gameState.correctChars / 5) / elapsedMinutes);
  }, [gameState.elapsedTime, gameState.correctChars]);

  // 计算准确率
  const accuracy = React.useMemo(() => {
    if (gameState.totalChars === 0) return 100;
    return Math.round((gameState.correctChars / gameState.totalChars) * 100);
  }, [gameState.correctChars, gameState.totalChars]);

  // 计算下落位置 (基于已用时间)
  const getFallProgress = () => {
    const duration = config.duration * 1000;
    const progress = (gameState.elapsedTime % duration) / duration;
    return Math.min(progress * 100, 85); // 最多到 85% 位置
  };

  // 判断是否需要显示时间警告（剩余 30 秒）
  const isTimeWarning = React.useMemo(() => {
    const remaining = config.duration * 1000 - gameState.elapsedTime;
    return remaining <= 30000 && gameState.status === 'playing';
  }, [config.duration, gameState.elapsedTime, gameState.status]);

  // 处理退出确认
  const handleExitConfirm = () => {
    setShowExitConfirm(true);
  };

  // 处理退出执行
  const handleExitExecute = () => {
    setShowExitConfirm(false);
    onBackToMenu();
  };

  // 处理退出取消
  const handleExitCancel = () => {
    setShowExitConfirm(false);
  };

  if (gameState.status === 'gameover') {
    return (
      <GameOver
        score={gameState.score}
        wpm={wpm}
        accuracy={accuracy}
        maxCombo={gameState.combo}
        onBackToMenu={onBackToMenu}
        onRestart={() => window.location.reload()}
      />
    );
  }

  return (
    <div className={`relative w-full h-screen bg-gradient-to-b ${currentTheme?.gradientFrom || 'from-sky-200'} ${currentTheme?.gradientTo || 'to-sky-100'} overflow-hidden ${isTimeWarning ? 'time-warning' : ''}`}>
      {/* 背景装饰 - 根据主题显示不同的吉祥物 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-10 left-10 text-6xl opacity-20 mascot-bounce`}>{currentTheme?.mascot || '☁️'}</div>
        <div className={`absolute top-20 right-20 text-5xl opacity-20 mascot-float`} style={{ animationDelay: '1s' }}>{currentTheme?.mascot || '☁️'}</div>
        <div className={`absolute top-40 left-1/3 text-4xl opacity-20 mascot-bounce`} style={{ animationDelay: '0.5s' }}>{currentTheme?.mascot || '☁️'}</div>
        {/* 星星装饰 */}
        <div className="absolute top-1/4 left-1/4 text-2xl opacity-30 star-twinkle-bright" style={{ animationDelay: '0s' }}>⭐</div>
        <div className="absolute top-1/3 right-1/4 text-3xl opacity-30 star-twinkle-bright" style={{ animationDelay: '0.7s' }}>✨</div>
        <div className="absolute bottom-1/3 left-1/5 text-2xl opacity-30 star-twinkle-bright" style={{ animationDelay: '1.4s' }}>⭐</div>
      </div>

      {/* 顶部控制栏 */}
      <div className="absolute top-4 right-4 z-30 flex gap-2">
        {/* 暂停按钮 */}
        <button
          onClick={togglePause}
          className="w-12 h-12 flex items-center justify-center bg-white/90 rounded-xl shadow-lg border-2 border-sky-400 hover:bg-sky-50 transition-colors"
          title="暂停游戏 (ESC)"
        >
          <span className="text-2xl">{isPaused ? '▶️' : '⏸️'}</span>
        </button>

        {/* 退出按钮 */}
        <button
          onClick={handleExitConfirm}
          className="w-12 h-12 flex items-center justify-center bg-white/90 rounded-xl shadow-lg border-2 border-red-300 hover:bg-red-50 transition-colors"
          title="退出游戏"
        >
          <span className="text-xl">🏠</span>
        </button>
      </div>

      {/* HUD */}
      <GameHUD
        score={gameState.score}
        combo={gameState.combo}
        wpm={wpm}
        accuracy={accuracy}
        elapsedTime={gameState.elapsedTime}
        duration={config.duration}
      />

      {/* 轨道区域 */}
      <div className={`absolute inset-0 pt-24 pb-4 transition-filter ${isPaused ? 'blur-sm' : ''}`}>
        <div className="container mx-auto h-full flex px-4">
          {/* 5 条轨道 - 添加高光和卡通阴影 */}
          {[0, 1, 2, 3, 4].map((trackIndex) => (
            <div
              key={trackIndex}
              className={`flex-1 border-r border-sky-300/30 last:border-r-0 relative track-highlight rounded-lg`}
            >
              {/* 轨道起点标记 */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 text-lg opacity-50">🏁</div>

              {/* 轨道上的单词 - 多字母模式 */}
              {(gameState.activeWords || [])
                .filter((word) => word.track === trackIndex)
                .map((word) => (
                  <div
                    key={word.id}
                    className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center falling-letter-float"
                    style={{
                      top: `${(word.progress / 100) * 85}%`,
                    }}
                  >
                    {/* 卡通气球容器 */}
                    <div className="relative">
                      {/* 气球绳子 */}
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-gradient-to-b from-sky-400 to-transparent opacity-60"></div>
                      {/* 气球 emoji 背景 */}
                      <span className="text-6xl opacity-90 drop-shadow-lg transform hover:scale-110 transition-transform">🎈</span>
                      {/* 字母叠加在气球上方 */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        {/* 已输入部分 - 浅灰色 + 半透明渐隐效果 */}
                        {word.text.slice(0, word.typedIndex) && (
                          <span className="text-5xl font-black text-gray-400 opacity-40 drop-shadow-xl">
                            {word.text.slice(0, word.typedIndex)}
                          </span>
                        )}
                        {/* 待输入部分 - 黄色高亮 */}
                        {word.text.slice(word.typedIndex) && (
                          <span className="text-5xl font-black text-yellow-200 drop-shadow-xl star-twinkle-bright">
                            {word.text.slice(word.typedIndex)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>

      {/* 当前单词提示 (底部中央) - 显示所有活跃单词 */}
      {gameState.activeWords.length > 0 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 bounce-in">
          <div className="px-6 py-3 bg-white/95 rounded-2xl shadow-2xl border-4 border-sky-400 cartoon-shadow button-glow">
            <div className="text-xs text-gray-500 mb-1 text-center">当前单词</div>
            <div className="flex items-center gap-3 flex-wrap justify-center max-w-md">
              {gameState.activeWords.map((word) => (
                <div
                  key={word.id}
                  className="px-3 py-2 bg-gradient-to-r from-sky-50 to-sky-100 rounded-xl border-2 border-sky-300"
                >
                  <div className="flex items-baseline gap-0.5 font-mono">
                    {/* 已输入部分 - 绿色 */}
                    {word.text.slice(0, word.typedIndex) && (
                      <span className="text-xl font-bold text-green-600 drop-shadow-sm">
                        {word.text.slice(0, word.typedIndex)}
                      </span>
                    )}
                    {/* 待输入部分 - 黄色高亮 */}
                    {word.text.slice(word.typedIndex) && (
                      <span className="text-xl font-bold text-yellow-600 bg-yellow-100 px-1 rounded star-twinkle-bright">
                        {word.text.slice(word.typedIndex)}
                      </span>
                    )}
                  </div>
                  {/* 匹配进度条 */}
                  <div className="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-200"
                      style={{ width: `${(word.typedIndex / word.text.length) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 连击显示 - 增强版 */}
      {gameState.combo >= 5 && !isPaused && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-40">
          <div className="text-center combo-pulse">
            {/* 火焰 emoji 动画 */}
            <div className="text-7xl mb-2 animate-bounce">🔥</div>
            {/* 连击数字 */}
            <div className="text-6xl font-black text-orange-500 drop-shadow-lg combo-fire combo-number">
              {gameState.combo}
            </div>
            <div className="text-2xl font-bold text-orange-600 drop-shadow">
              连击!
            </div>
            {/* 装饰星星 */}
            <div className="flex justify-center gap-2 mt-2">
              <span className="text-xl star-twinkle-bright">⭐</span>
              <span className="text-xl star-twinkle-bright" style={{ animationDelay: '0.3s' }}>✨</span>
              <span className="text-xl star-twinkle-bright" style={{ animationDelay: '0.6s' }}>⭐</span>
            </div>
          </div>
        </div>
      )}

      {/* 暂停菜单 */}
      {isPaused && (
        <PauseMenu
          onResume={togglePause}
          onExit={() => {
            togglePause();
            handleExitConfirm();
          }}
        />
      )}

      {/* 退出确认对话框 */}
      {showExitConfirm && (
        <ExitConfirmDialog
          onConfirm={handleExitExecute}
          onCancel={handleExitCancel}
        />
      )}
    </div>
  );
}
