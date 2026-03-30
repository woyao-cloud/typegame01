// T5.2 - 键盘指法提示组件

import React from 'react';
import { getHandInfo } from '@/utils/hand-zone';
import { QWERTY_LAYOUT } from '@/utils/keyboard';

interface KeyboardHintProps {
  currentChar?: string | null;
  showHints?: boolean;
}

/**
 * 键盘指法提示组件
 * 显示当前字母的手别和指法区域
 */
export function KeyboardHint({ currentChar, showHints = true }: KeyboardHintProps) {
  if (!currentChar || !showHints) {
    return null;
  }

  const { hand, zone } = getHandInfo(currentChar);

  // 计算键位位置
  const keyPos = QWERTY_LAYOUT.keyPositions.get(currentChar.toLowerCase());

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-white/90 rounded-xl shadow-lg border-2 border-sky-400">
      <div className="text-center space-y-2">
        {/* 当前字母 */}
        <div className="text-4xl font-bold text-sky-600">
          {currentChar.toUpperCase()}
        </div>

        {/* 手别提示 */}
        <div
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            hand === 'left'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {hand === 'left' ? '👈 左手' : '👉 右手'}
        </div>

        {/* 指法区域 */}
        <div className="text-xs text-gray-500">
          同手区：{zone.length} 个键位
        </div>

        {/* 迷你键盘预览 */}
        <div className="mt-2 p-2 bg-gray-100 rounded-lg">
          <div className="grid grid-cols-10 gap-1 text-xs">
            {QWERTY_LAYOUT.rows[0].map((key) => (
              <span
                key={key}
                className={`w-5 h-5 flex items-center justify-center rounded ${
                  key === currentChar.toLowerCase()
                    ? 'bg-sky-500 text-white'
                    : zone.includes(key)
                    ? 'bg-sky-200 text-sky-700'
                    : 'bg-gray-300 text-gray-500'
                }`}
              >
                {key}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-9 gap-1 text-xs mt-1">
            {QWERTY_LAYOUT.rows[1].map((key) => (
              <span
                key={key}
                className={`w-5 h-5 flex items-center justify-center rounded ${
                  key === currentChar.toLowerCase()
                    ? 'bg-sky-500 text-white'
                    : zone.includes(key)
                    ? 'bg-sky-200 text-sky-700'
                    : 'bg-gray-300 text-gray-500'
                }`}
              >
                {key}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 text-xs mt-1">
            {QWERTY_LAYOUT.rows[2].map((key) => (
              <span
                key={key}
                className={`w-5 h-5 flex items-center justify-center rounded ${
                  key === currentChar.toLowerCase()
                    ? 'bg-sky-500 text-white'
                    : zone.includes(key)
                    ? 'bg-sky-200 text-sky-700'
                    : 'bg-gray-300 text-gray-500'
                }`}
              >
                {key}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
