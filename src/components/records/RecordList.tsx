// T6.1 - 游戏记录列表组件

'use client';

import React, { useEffect, useState } from 'react';
import { recordRepository } from '@/repositories/recordRepository';
import { GameRecord } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/Loading';

interface RecordListProps {
  limit?: number;
  showAll?: boolean;
}

/**
 * 游戏记录列表组件
 * 显示最近的游戏记录
 */
export function RecordList({ limit = 10, showAll = false }: RecordListProps) {
  const [records, setRecords] = useState<GameRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const recentRecords = await recordRepository.getRecentRecords(
        showAll ? undefined : limit
      );
      setRecords(recentRecords);
    } catch (error) {
      console.error('加载记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    // 今天
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    }

    // 昨天
    if (diff < 48 * 60 * 60 * 1000) {
      return '昨天';
    }

    // 更早
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>游戏记录</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton lines={5} />
        </CardContent>
      </Card>
    );
  }

  if (records.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>游戏记录</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">🎮</div>
          <p>还没有游戏记录</p>
          <p className="text-sm">开始游戏来创建你的第一个记录吧！</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>📊 游戏记录</span>
          {showAll && (
            <Button variant="outline" size="sm" onClick={loadRecords}>
              刷新
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {records.map((record, index) => (
            <div
              key={record.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                {/* 排名图标 */}
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-sky-100 text-sky-600 font-bold">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                </div>

                {/* 信息 */}
                <div>
                  <div className="font-medium text-gray-800">
                    {record.mode === 'letter' ? '字母练习' : '单词练习'}
                  </div>
                  <div className="text-xs text-gray-500">
                    难度：{'⭐'.repeat(record.difficulty)} · {formatDate(record.completedAt)}
                  </div>
                </div>
              </div>

              {/* 成绩 */}
              <div className="text-right">
                <div className="text-lg font-bold text-sky-600">
                  {record.score.toLocaleString()} 分
                </div>
                <div className="text-xs text-gray-500">
                  {record.wpm} WPM · {record.accuracy}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
