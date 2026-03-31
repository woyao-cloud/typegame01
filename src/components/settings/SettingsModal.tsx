// T5.2 - 设置模态框组件

'use client';

import React from 'react';
import { useConfigStore } from '@/stores/configStore';
import { AudioSettings } from './AudioSettings';
import { ThemeSelector } from './ThemeSelector';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 设置模态框组件
 * 包含：音频设置、游戏设置、关于信息
 */
export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { gameConfig, audioConfig } = useConfigStore();

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="⚙️ 游戏设置"
    >
      <div className="space-y-6">
        {/* 主题选择 */}
        <ThemeSelector />

        {/* 当前游戏配置概览 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>🎮 当前配置</span>
              <Badge variant="info">MVP v1.0</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-lg">{gameConfig.mode === 'letter' ? '🔤' : '📝'}</span>
                <span className="text-gray-600">模式：</span>
                <span className="font-medium">
                  {gameConfig.mode === 'letter' ? '字母练习' : '单词练习'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">⭐</span>
                <span className="text-gray-600">难度：</span>
                <span className="font-medium">
                  {'⭐'.repeat(gameConfig.difficulty)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🏃</span>
                <span className="text-gray-600">速度：</span>
                <span className="font-medium">
                  {['🐢', '🚶', '🏃', '🚀'][gameConfig.speed - 1]}
                  {['慢速', '正常', '快速', '极速'][gameConfig.speed - 1]}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">⏱️</span>
                <span className="text-gray-600">时长：</span>
                <span className="font-medium">
                  {gameConfig.duration === 120 ? '2 分钟' : gameConfig.duration === 300 ? '5 分钟' : '10 分钟'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 音频设置 */}
        <AudioSettings />

        {/* 关于信息 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <span>ℹ️</span>
              关于
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 space-y-2">
            <div>
              <span className="font-medium">版本：</span>
              <span>MVP v1.0</span>
            </div>
            <div>
              <span className="font-medium">适用人群：</span>
              <span>6-10 岁儿童（小学一、二年级）</span>
            </div>
            <div>
              <span className="font-medium">技术栈：</span>
              <span>React + TypeScript + TailwindCSS</span>
            </div>
            <div className="pt-2 text-xs text-gray-500">
              儿童打字游戏 - 快乐打字，从小开始！
            </div>
          </CardContent>
        </Card>
      </div>
    </Dialog>
  );
}
