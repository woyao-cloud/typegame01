// T4.3 - 游戏结束界面

import React from 'react';
import { useConfigStore } from '@/stores/configStore';
import { getThemeById } from '@/data/themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GameOverProps {
  score: number;
  wpm: number;
  accuracy: number;
  maxCombo: number;
  onBackToMenu: () => void;
  onRestart: () => void;
}

/**
 * 游戏结束界面
 * 显示最终成绩和统计数据
 */
export function GameOver({
  score,
  wpm,
  accuracy,
  maxCombo,
  onBackToMenu,
  onRestart,
}: GameOverProps) {
  // 评定等级
  const getRank = (): { grade: string; color: string; emoji: string; message: string } => {
    const combinedScore = wpm * 0.5 + accuracy * 0.3 + maxCombo * 0.2;

    if (combinedScore >= 80) {
      return { grade: 'S', color: 'text-yellow-500', emoji: '🏆', message: '太棒了！打字小能手！' };
    } else if (combinedScore >= 60) {
      return { grade: 'A', color: 'text-green-500', emoji: '🌟', message: '做得很好！继续加油！' };
    } else if (combinedScore >= 40) {
      return { grade: 'B', color: 'text-blue-500', emoji: '👍', message: '不错哦！有进步！' };
    } else if (combinedScore >= 20) {
      return { grade: 'C', color: 'text-orange-500', emoji: '💪', message: '继续努力！你会更好的！' };
    } else {
      return { grade: 'D', color: 'text-red-500', emoji: '📚', message: '多练习就会进步！加油！' };
    }
  };

  const rank = getRank();
  const { themeId } = useConfigStore();
  const currentTheme = getThemeById(themeId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm blur-fade-in">
      {/* 庆祝彩带 - 增强动画 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-4xl mascot-bounce">🎉</div>
        <div className="absolute top-20 right-20 text-4xl mascot-float" style={{ animationDelay: '0.5s' }}>🎊</div>
        <div className="absolute bottom-20 left-1/4 text-4xl mascot-bounce" style={{ animationDelay: '1s' }}>✨</div>
        <div className="absolute bottom-30 right-1/4 text-4xl mascot-float" style={{ animationDelay: '0.7s' }}>🌈</div>
        {/* 额外星星装饰 */}
        <div className="absolute top-1/4 left-1/3 text-3xl star-twinkle-bright" style={{ animationDelay: '0.2s' }}>⭐</div>
        <div className="absolute top-1/2 right-1/3 text-3xl star-twinkle-bright" style={{ animationDelay: '0.8s' }}>✨</div>
        <div className="absolute bottom-1/4 left-1/2 text-3xl star-twinkle-bright" style={{ animationDelay: '1.2s' }}>⭐</div>
      </div>

      <Card className="w-full max-w-lg mx-4 bg-white shadow-2xl border-4 border-sky-400 relative z-10 dialog-slide-in cartoon-shadow">
        <CardHeader className="text-center pb-2">
          {/* 主题吉祥物图片 - 带弹跳动画 */}
          <div className="flex justify-center mb-4 mascot-bounce">
            <img
              src={currentTheme?.mascotImage || '/images/mascot.svg'}
              alt={currentTheme?.name || '吉祥物'}
              className="w-32 h-32 object-contain"
            />
          </div>
          {/* 等级 emoji - 带脉动 */}
          <div className="text-6xl mb-2 combo-pulse inline-block">{rank.emoji}</div>
          <CardTitle className="text-3xl font-bold text-gray-800 bounce-in">
            游戏结束
          </CardTitle>
          <p className={`text-lg font-bold ${rank.color} mt-2 star-twinkle-bright`}>
            {rank.message}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 等级评定 - 增强视觉效果 */}
          <div className="text-center py-4 bg-gradient-to-r from-sky-100 to-sky-50 rounded-xl border-2 border-sky-200 cartoon-shadow">
            <div className="text-sm text-gray-500 mb-2">最终等级</div>
            <div className={`text-8xl font-bold ${rank.color} drop-shadow-lg star-twinkle-bright`}>
              {rank.grade}
            </div>
          </div>

          {/* 统计数据 - 带发光效果 */}
          <div className="grid grid-cols-2 gap-3">
            {/* 分数 */}
            <div className="p-3 bg-sky-50 rounded-xl text-center border-2 border-sky-200 button-glow spring-bounce">
              <div className="text-xs text-gray-500 mb-1">🎯 得分</div>
              <div className="text-2xl font-bold text-sky-600 coin-collect">
                {score.toLocaleString()}
              </div>
            </div>

            {/* WPM */}
            <div className="p-3 bg-green-50 rounded-xl text-center border-2 border-green-200 button-glow spring-bounce">
              <div className="text-xs text-gray-500 mb-1">⚡ 速度</div>
              <div className="text-2xl font-bold text-green-600">{wpm}</div>
            </div>

            {/* 准确率 */}
            <div className="p-3 bg-purple-50 rounded-xl text-center border-2 border-purple-200 button-glow spring-bounce">
              <div className="text-xs text-gray-500 mb-1">🎯 准确率</div>
              <div
                className={`text-2xl font-bold ${
                  accuracy >= 90
                    ? 'text-green-600'
                    : accuracy >= 70
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}
              >
                {accuracy}%
              </div>
            </div>

            {/* 最大连击 - 带火焰效果 */}
            <div className="p-3 bg-orange-50 rounded-xl text-center border-2 border-orange-200 button-glow spring-bounce">
              <div className="text-xs text-gray-500 mb-1">🔥 连击</div>
              <div className="text-2xl font-bold text-orange-600 combo-fire">{maxCombo}</div>
            </div>
          </div>

          {/* 操作按钮 - 带弹跳效果 */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onBackToMenu}
              className="flex-1 h-12 text-lg spring-bounce"
            >
              🏠 返回菜单
            </Button>
            <Button
              onClick={onRestart}
              className="flex-1 h-12 text-lg bg-sky-500 hover:bg-sky-600 spring-bounce button-glow"
            >
              🔄 再来一局
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
