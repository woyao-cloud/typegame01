// T7.2 - 退出确认对话框组件

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ExitConfirmDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * 退出确认对话框组件
 * 二次确认退出，防止误操作
 */
export function ExitConfirmDialog({ onConfirm, onCancel }: ExitConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4 bg-white shadow-2xl border-4 border-red-400 animate-bounce-in">
        <CardHeader className="text-center pb-4">
          <div className="text-6xl mb-4">⚠️</div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            确认退出游戏？
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 警告信息 */}
          <div className="p-4 bg-red-50 rounded-xl border-2 border-red-200">
            <p className="text-red-800 font-medium text-center">
              🚨 退出后当前游戏进度将丢失
            </p>
            <p className="text-red-600 text-sm text-center mt-2">
              确定要返回主菜单吗？
            </p>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3">
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1 h-12 text-lg"
            >
              ❌ 取消
            </Button>
            <Button
              onClick={onConfirm}
              className="flex-1 h-12 text-lg bg-red-500 hover:bg-red-600"
            >
              ✅ 确认退出
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
