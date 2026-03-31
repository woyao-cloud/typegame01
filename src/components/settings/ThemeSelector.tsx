// T8.2 - 主题选择器组件

'use client';

import React from 'react';
import { useConfigStore } from '@/stores/configStore';
import { THEMES, getThemeById } from '@/data/themes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ThemeSelectorProps {
  onThemeChange?: (themeId: string) => void;
}

/**
 * 主题选择器组件
 * 提供 8 种主题包选择
 */
export function ThemeSelector({ onThemeChange }: ThemeSelectorProps) {
  const { themeId, setTheme } = useConfigStore();

  const handleThemeSelect = (id: string) => {
    setTheme(id as any);
    onThemeChange?.(id);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <span>🎨</span>
          选择主题
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {THEMES.map((theme) => {
            const isSelected = themeId === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => handleThemeSelect(theme.id)}
                className={`
                  relative p-4 rounded-xl border-2 transition-all duration-200
                  ${isSelected
                    ? 'border-sky-500 bg-sky-50 shadow-lg scale-105'
                    : 'border-gray-200 bg-white hover:border-sky-300 hover:shadow-md'
                  }
                `}
              >
                {/* 选中标志 */}
                {isSelected && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-sky-500 rounded-full flex items-center justify-center text-white text-sm shadow">
                    ✓
                  </div>
                )}

                {/* 主题图标 */}
                <div className="text-4xl mb-2">{theme.icon}</div>

                {/* 主题名称 */}
                <div className="font-medium text-gray-800 text-sm">
                  {theme.name}
                </div>

                {/* 主题描述 */}
                <div className="text-xs text-gray-500 mt-1">
                  {theme.description}
                </div>

                {/* 主题色预览 */}
                <div className="flex gap-1 mt-2 justify-center">
                  <div className={`w-4 h-4 rounded-full ${theme.primaryColor}`} />
                  <div className={`w-4 h-4 rounded-full ${theme.secondaryColor}`} />
                </div>
              </button>
            );
          })}
        </div>

        {/* 当前主题信息 */}
        <div className="mt-4 p-3 bg-sky-50 rounded-lg border border-sky-200">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getThemeById(themeId)?.icon}</span>
            <span className="text-sm text-sky-700 font-medium">
              当前主题：{getThemeById(themeId)?.name}
            </span>
          </div>
          <div className="text-xs text-sky-600 mt-1">
            包含词汇：{getThemeById(themeId)?.vocabulary.length} 个单词
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
