// T4.4 - 开始界面组件

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getThemeById } from '@/data/themes';
import { useConfigStore } from '@/stores/configStore';

interface StartScreenProps {
  onStartGame: () => void;
  onManageLibrary: () => void;
  onViewHistory: () => void;
}

/**
 * 开始界面
 * 包含：Logo、卡通形象、三个主要按钮（开始游戏、字库管理、历史记录）
 */
export function StartScreen({ onStartGame, onManageLibrary, onViewHistory }: StartScreenProps) {
  const { themeId } = useConfigStore();
  const currentTheme = getThemeById(themeId);

  return (
    <div className={`min-h-screen bg-gradient-to-b ${currentTheme?.gradientFrom || 'from-sky-300'} ${currentTheme?.gradientTo || 'to-sky-100'} flex items-center justify-center p-4 relative overflow-hidden`}>
      {/* 背景装饰 - 漂浮的吉祥物和星星 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-10 left-10 text-6xl opacity-20 mascot-bounce`}>{currentTheme?.mascot || '🐸'}</div>
        <div className={`absolute top-20 right-20 text-5xl opacity-20 mascot-float`} style={{ animationDelay: '1s' }}>{currentTheme?.mascot || '🌻'}</div>
        <div className={`absolute bottom-20 left-1/4 text-4xl opacity-20 mascot-bounce`} style={{ animationDelay: '0.5s' }}>{currentTheme?.mascot || '🚗'}</div>
        <div className={`absolute bottom-10 right-1/3 text-3xl opacity-20 mascot-float`} style={{ animationDelay: '1.5s' }}>{currentTheme?.mascot || '✏️'}</div>
        <div className="absolute top-1/4 left-1/3 text-2xl opacity-30 star-twinkle-bright" style={{ animationDelay: '0.2s' }}>⭐</div>
        <div className="absolute top-1/2 right-1/4 text-2xl opacity-30 star-twinkle-bright" style={{ animationDelay: '0.8s' }}>✨</div>
        <div className="absolute bottom-1/3 left-1/2 text-2xl opacity-30 star-twinkle-bright" style={{ animationDelay: '1.2s' }}>⭐</div>
      </div>

      <Card className="w-full max-w-md bg-white/95 shadow-2xl border-4 border-sky-400 relative z-10 dialog-slide-in cartoon-shadow">
        <CardContent className="p-8 text-center space-y-8">
          {/* Logo 区域 */}
          <div className="space-y-4">
            {/* 主图标 - 带脉动动画 */}
            <div className="text-7xl mb-4 combo-pulse inline-block">⌨️</div>

            {/* 标题 */}
            <h1 className="text-4xl md:text-5xl font-black text-sky-600 bounce-in">
              儿童打字游戏
            </h1>

            {/* 副标题 */}
            <p className="text-gray-500 text-lg star-twinkle-bright">
              快乐打字，从小开始！
            </p>
          </div>

          {/* 卡通形象展示 */}
          <div className="py-4">
            <div className="text-8xl mascot-bounce inline-block">
              {currentTheme?.mascot || '🐸'}
            </div>
          </div>

          {/* 主要功能按钮 */}
          <div className="space-y-4 pt-4">
            {/* 开始游戏按钮 - 主按钮，带发光效果 */}
            <Button
              onClick={onStartGame}
              className="w-full h-16 text-2xl font-bold bg-green-500 hover:bg-green-600 button-glow spring-bounce cartoon-shadow"
            >
              🎮 开始游戏
            </Button>

            {/* 字库管理按钮 */}
            <Button
              onClick={onManageLibrary}
              variant="outline"
              className="w-full h-14 text-xl border-sky-300 text-sky-600 hover:bg-sky-50 spring-bounce"
            >
              📚 字库管理
            </Button>

            {/* 历史记录按钮 */}
            <Button
              onClick={onViewHistory}
              variant="outline"
              className="w-full h-14 text-xl border-purple-300 text-purple-600 hover:bg-purple-50 spring-bounce"
            >
              🏆 历史记录
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 底部版权信息 */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-gray-400 text-sm">
        © 2026 儿童打字游戏 · 专为 6-10 岁儿童设计
      </div>
    </div>
  );
}
