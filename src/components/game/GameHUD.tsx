// T4.2 - 游戏 HUD ( Heads-Up Display )

import React from 'react';

interface GameHUDProps {
  score: number;
  combo: number;
  wpm: number;
  accuracy: number;
  elapsedTime: number;
  duration: number; // 秒
}

/**
 * 游戏 HUD 组件
 * 显示：分数、连击、WPM、准确率、倒计时
 */
export function GameHUD({
  score,
  combo,
  wpm,
  accuracy,
  elapsedTime,
  duration,
}: GameHUDProps) {
  // 计算剩余时间 (elapsedTime 是毫秒，duration 是秒)
  const elapsedSeconds = Math.floor(elapsedTime / 1000);
  const remainingSeconds = Math.max(0, duration - elapsedSeconds);
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  // 连击倍率 (仅用于显示)
  const comboMultiplier = 1 + Math.floor(combo / 5) * 0.1;

  return (
    <div className="absolute top-0 left-0 right-0 z-10">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* 左侧：分数和连击 */}
          <div className="flex items-center gap-6">
            {/* 分数 */}
            <div className="flex flex-col items-center px-6 py-2 bg-white/90 rounded-xl shadow-lg">
              <span className="text-xs text-gray-500 uppercase font-medium">
                分数
              </span>
              <span className="text-3xl font-bold text-sky-600">
                {score.toLocaleString()}
              </span>
            </div>

            {/* 连击 */}
            {combo > 0 && (
              <div className="flex flex-col items-center px-6 py-2 bg-orange-100/90 rounded-xl shadow-lg border-2 border-orange-400">
                <span className="text-xs text-orange-600 uppercase font-medium">
                  连击
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-orange-600">
                    {combo}
                  </span>
                  <span className="text-sm text-orange-500">
                    x{comboMultiplier.toFixed(1)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 中央：倒计时 */}
          <div className="flex flex-col items-center px-8 py-3 bg-white/90 rounded-xl shadow-lg">
            <span className="text-xs text-gray-500 uppercase font-medium">
              剩余时间
            </span>
            <span
              className={`text-4xl font-bold ${
                remainingSeconds < 30 ? 'text-red-600 animate-pulse' : 'text-gray-800'
              }`}
            >
              {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </span>
          </div>

          {/* 右侧：WPM 和准确率 */}
          <div className="flex items-center gap-6">
            {/* WPM */}
            <div className="flex flex-col items-center px-6 py-2 bg-white/90 rounded-xl shadow-lg">
              <span className="text-xs text-gray-500 uppercase font-medium">
                WPM
              </span>
              <span className="text-3xl font-bold text-green-600">
                {wpm}
              </span>
            </div>

            {/* 准确率 */}
            <div className="flex flex-col items-center px-6 py-2 bg-white/90 rounded-xl shadow-lg">
              <span className="text-xs text-gray-500 uppercase font-medium">
                准确率
              </span>
              <span
                className={`text-3xl font-bold ${
                  accuracy >= 90
                    ? 'text-green-600'
                    : accuracy >= 70
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}
              >
                {accuracy}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
