// T7.1 - 暂停菜单组件

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PauseMenuProps {
  onResume: () => void;
  onExit: () => void;
}

/**
 * 暂停菜单组件
 * 显示在游戏暂停时，提供继续和退出选项
 */
export function PauseMenu({ onResume, onExit }: PauseMenuProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm blur-fade-in">
      <Card className="w-full max-w-md mx-4 bg-white shadow-2xl border-4 border-sky-400 dialog-slide-in cartoon-shadow">
        <CardHeader className="text-center pb-4">
          {/* 暂停图标 - 带脉动动画 */}
          <div className="text-6xl mb-4 combo-pulse inline-block">⏸️</div>
          <CardTitle className="text-3xl font-bold text-gray-800 bounce-in">
            游戏暂停
          </CardTitle>
          <p className="text-gray-500 mt-2">
            休息一下，准备好了吗？
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 继续游戏按钮 - 带发光效果 */}
          <Button
            onClick={onResume}
            className="w-full h-14 text-xl bg-green-500 hover:bg-green-600 button-glow spring-bounce"
          >
            ▶️ 继续游戏
          </Button>

          {/* 退出游戏按钮 */}
          <Button
            onClick={onExit}
            variant="outline"
            className="w-full h-14 text-xl border-red-300 text-red-600 hover:bg-red-50 spring-bounce"
          >
            🏠 退出游戏
          </Button>

          {/* 提示信息 - 带闪烁背景 */}
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200 star-twinkle-bright">
            <p className="text-sm text-yellow-700 text-center">
              💡 提示：退出游戏将返回主菜单，当前游戏进度将不保存
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
