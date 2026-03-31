// T4.4 - 主菜单界面

'use client';

import React, { useState } from 'react';
import { useConfigStore } from '@/stores/configStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { getThemeById } from '@/data/themes';

interface MenuScreenProps {
  onStartGame: () => void;
}

/**
 * 主菜单界面
 * 包含：开始游戏按钮、难度选择、速度选择、模式选择
 */
export function MenuScreen({ onStartGame }: MenuScreenProps) {
  const { gameConfig, setGameConfig, themeId } = useConfigStore();
  const [showSettings, setShowSettings] = useState(false);
  const currentTheme = getThemeById(themeId);

  // 难度选项
  const difficultyOptions = [
    { value: 1, label: '简单', icon: '⭐', description: '1-3 个字母' },
    { value: 2, label: '中等', icon: '⭐⭐', description: '3-5 个字母' },
    { value: 3, label: '困难', icon: '⭐⭐⭐', description: '5+ 个字母' },
  ];

  // 速度选项
  const speedOptions = [
    { value: 1, label: '慢速', icon: '🐢' },
    { value: 2, label: '正常', icon: '🚶' },
    { value: 3, label: '快速', icon: '🏃' },
    { value: 4, label: '极速', icon: '🚀' },
  ];

  // 模式选项
  const modeOptions = [
    { value: 'letter', label: '字母练习', icon: '🔤' },
    { value: 'word', label: '单词练习', icon: '📝' },
  ];

  // 时长选项 (秒)
  const durationOptions = [
    { value: 120, label: '2 分钟' },
    { value: 300, label: '5 分钟' },
    { value: 600, label: '10 分钟' },
  ];

  const currentDifficulty = difficultyOptions.find(
    (d) => d.value === gameConfig.difficulty
  );
  const currentSpeed = speedOptions.find((s) => s.value === gameConfig.speed);
  const currentMode = modeOptions.find((m) => m.value === gameConfig.mode);
  const currentDuration = durationOptions.find(
    (d) => d.value === gameConfig.duration
  );

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

      <Card className="w-full max-w-2xl bg-white/95 shadow-2xl border-4 border-sky-400 relative z-10 dialog-slide-in cartoon-shadow">
        <CardHeader className="text-center pb-4">
          {/* 标题图标 - 带脉动动画 */}
          <div className="text-8xl mb-4 combo-pulse inline-block">⌨️</div>
          <CardTitle className="text-4xl font-bold text-sky-600 bounce-in">
            儿童打字游戏
          </CardTitle>
          <p className="text-gray-500 mt-2 star-twinkle-bright">快乐打字，从小开始！</p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 游戏模式选择 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              游戏模式
            </label>
            <div className="flex gap-3">
              {modeOptions.map((mode) => (
                <Button
                  key={mode.value}
                  variant={gameConfig.mode === mode.value ? 'default' : 'outline'}
                  onClick={() =>
                    setGameConfig({ mode: mode.value as 'letter' | 'word' })
                  }
                  className={`flex-1 h-16 text-lg spring-bounce ${
                    gameConfig.mode === mode.value
                      ? 'bg-sky-500 hover:bg-sky-600 button-glow'
                      : ''
                  }`}
                >
                  <span className="mr-2">{mode.icon}</span>
                  {mode.label}
                </Button>
              ))}
            </div>
          </div>

          {/* 难度和速度选择 */}
          <div className="grid grid-cols-2 gap-4">
            {/* 难度选择 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                难度等级
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-12 text-lg justify-between spring-bounce"
                  >
                    <span>
                      <span className="mr-2">{currentDifficulty?.icon}</span>
                      {currentDifficulty?.label}
                    </span>
                    <span className="text-gray-400">▼</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  {difficultyOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() =>
                        setGameConfig({ difficulty: option.value as 1 | 2 | 3 })
                      }
                      className="p-3 cursor-pointer"
                    >
                      <div>
                        <div className="font-medium">
                          {option.icon} {option.label}
                        </div>
                        <div className="text-xs text-gray-500">
                          {option.description}
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* 速度选择 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                下落速度
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-12 text-lg justify-between spring-bounce"
                  >
                    <span>
                      <span className="mr-2">{currentSpeed?.icon}</span>
                      {currentSpeed?.label}
                    </span>
                    <span className="text-gray-400">▼</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  {speedOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() =>
                        setGameConfig({ speed: option.value as 1 | 2 | 3 | 4 })
                      }
                      className="p-3 cursor-pointer"
                    >
                      <span className="text-lg">
                        {option.icon} {option.label}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* 时长选择 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              游戏时长
            </label>
            <div className="flex gap-3">
              {durationOptions.map((duration) => (
                <Button
                  key={duration.value}
                  variant={
                    gameConfig.duration === duration.value ? 'default' : 'outline'
                  }
                  onClick={() => setGameConfig({ duration: duration.value })}
                  className={`flex-1 h-12 spring-bounce ${
                    gameConfig.duration === duration.value
                      ? 'bg-sky-500 hover:bg-sky-600 button-glow'
                      : ''
                  }`}
                >
                  {duration.label}
                </Button>
              ))}
            </div>
          </div>

          {/* 开始游戏按钮 - 带强烈发光效果 */}
          <Button
            onClick={onStartGame}
            className="w-full h-16 text-2xl font-bold bg-green-500 hover:bg-green-600 mt-6 button-glow spring-bounce cartoon-shadow"
          >
            🎮 开始游戏
          </Button>

          {/* 设置按钮 - 带弹跳效果 */}
          <div className="flex justify-center pt-2">
            <Button
              onClick={() => setShowSettings(true)}
              variant="outline"
              className="h-10 spring-bounce"
            >
              ⚙️ 游戏设置
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 设置模态框 */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
}
