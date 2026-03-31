// T6.2 - 统计面板组件

'use client';

import React, { useEffect, useState } from 'react';
import { recordRepository } from '@/repositories/recordRepository';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * 统计面板组件
 * 显示游戏统计数据
 */
export function StatisticsPanel() {
  const [stats, setStats] = useState({
    totalGames: 0,
    bestScore: 0,
    bestWPM: 0,
    averageWPM: 0,
    bestAccuracy: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const totalGames = await recordRepository.getTotalPlayCount();
      const averageWPM = await recordRepository.getAverageWPM();

      // 获取所有记录计算最佳数据
      const allRecords = await recordRepository.getAll();
      const bestScore = Math.max(...allRecords.map((r) => r.score), 0);
      const bestWPM = Math.max(...allRecords.map((r) => r.wpm), 0);
      const bestAccuracy = Math.max(...allRecords.map((r) => r.accuracy), 0);

      setStats({
        totalGames,
        bestScore,
        bestWPM,
        averageWPM: Math.round(averageWPM),
        bestAccuracy,
      });
    } catch (error) {
      console.error('加载统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>📈 统计数据</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton lines={4} />
        </CardContent>
      </Card>
    );
  }

  if (stats.totalGames === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>📈 统计数据</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* 总游戏次数 */}
          <div className="p-4 bg-sky-50 rounded-xl text-center">
            <div className="text-3xl mb-1">🎮</div>
            <div className="text-2xl font-bold text-sky-600">
              {stats.totalGames}
            </div>
            <div className="text-xs text-gray-500">游戏次数</div>
          </div>

          {/* 最佳分数 */}
          <div className="p-4 bg-yellow-50 rounded-xl text-center">
            <div className="text-3xl mb-1">🏆</div>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.bestScore.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">最佳分数</div>
          </div>

          {/* 最佳 WPM */}
          <div className="p-4 bg-green-50 rounded-xl text-center">
            <div className="text-3xl mb-1">⚡</div>
            <div className="text-2xl font-bold text-green-600">
              {stats.bestWPM}
            </div>
            <div className="text-xs text-gray-500">最佳 WPM</div>
          </div>

          {/* 平均 WPM */}
          <div className="p-4 bg-purple-50 rounded-xl text-center">
            <div className="text-3xl mb-1">📊</div>
            <div className="text-2xl font-bold text-purple-600">
              {stats.averageWPM}
            </div>
            <div className="text-xs text-gray-500">平均 WPM</div>
          </div>
        </div>

        {/* 最佳准确率 */}
        <div className="mt-4 p-4 bg-orange-50 rounded-xl text-center">
          <div className="text-3xl mb-1">🎯</div>
          <div className="text-2xl font-bold text-orange-600">
            {stats.bestAccuracy}%
          </div>
          <div className="text-xs text-gray-500">最佳准确率</div>
        </div>
      </CardContent>
    </Card>
  );
}
