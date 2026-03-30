// T4.1 - 游戏主界面组件

'use client';

import React, { useEffect, useCallback } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { TrackManager } from '@/engine/TrackManager';
import { GameHUD } from './GameHUD';
import { GameOver } from './GameOver';
import { useKeyboard } from '@/hooks/useKeyboard';
import { getAudioManager } from '@/utils/audio';

interface GameScreenProps {
  onBackToMenu: () => void;
}

/**
 * 游戏主界面
 * 包含：轨道区域、HUD、游戏结束弹窗
 */
export function GameScreen({ onBackToMenu }: GameScreenProps) {
  const { gameState, config, handleInput, setOnGameEnd, start } = useGameStore();
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
    enabled: gameState.status === 'playing',
    onKeyPress: handleKeyPress,
  });

  // 游戏开始时初始化音频
  React.useEffect(() => {
    if (gameState.status === 'idle') {
      audioManager.initialize();
      start();
    }
  }, [gameState.status, audioManager, start]);

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
    <div className="relative w-full h-screen bg-gradient-to-b from-sky-200 to-sky-100 overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-6xl opacity-20 animate-bounce">☁️</div>
        <div className="absolute top-20 right-20 text-5xl opacity-20 animate-bounce" style={{ animationDelay: '1s' }}>☁️</div>
        <div className="absolute top-40 left-1/3 text-4xl opacity-20 animate-bounce" style={{ animationDelay: '0.5s' }}>☁️</div>
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
      <div className="absolute inset-0 pt-24 pb-4">
        <div className="container mx-auto h-full flex px-4">
          {/* 5 条轨道 */}
          {[0, 1, 2, 3, 4].map((trackIndex) => (
            <div
              key={trackIndex}
              className="flex-1 border-r border-sky-300/30 last:border-r-0 relative"
            >
              {/* 轨道上的单词 */}
              {gameState.currentWord && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 px-4 py-3 bg-white rounded-xl shadow-lg border-2 border-sky-400 transition-all duration-100 ease-linear"
                  style={{
                    top: `${getFallProgress()}%`,
                  }}
                >
                  {/* 已输入部分 (绿色) */}
                  <span className="text-2xl font-bold text-green-600">
                    {gameState.currentWord.text.slice(0, gameState.typedIndex)}
                  </span>
                  {/* 未输入部分 */}
                  <span className="text-2xl font-bold text-gray-800">
                    {gameState.currentWord.text.slice(gameState.typedIndex)}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 当前单词提示 (底部中央) */}
      {gameState.currentWord && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
          <div className="px-8 py-4 bg-white/95 rounded-2xl shadow-2xl border-4 border-sky-400">
            <div className="flex items-center gap-1">
              {/* 已输入部分 (绿色) */}
              <span className="text-4xl font-bold text-green-600">
                {gameState.currentWord.text.slice(0, gameState.typedIndex)}
              </span>
              {/* 未输入部分 (带下划线提示) */}
              <span className="text-4xl font-bold text-gray-800 border-b-4 border-sky-400">
                {gameState.currentWord.text.slice(gameState.typedIndex) || '_'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 连击显示 */}
      {gameState.combo >= 5 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="text-center animate-bounce">
            <div className="text-6xl font-bold text-orange-500 drop-shadow-lg">
              🔥 {gameState.combo} 连击!
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
