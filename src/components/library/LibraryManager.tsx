// T6.1 - 字库管理界面组件

'use client';

import React, { useState, useEffect } from 'react';
import { libraryRepository } from '@/repositories/libraryRepository';
import { WordLibrary, Word } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getThemeById } from '@/data/themes';
import { useConfigStore } from '@/stores/configStore';

interface LibraryManagerProps {
  onBack: () => void;
}

/**
 * 字库管理界面
 * 包含：字库选择、编辑、导入/导出功能
 */
export function LibraryManager({ onBack }: LibraryManagerProps) {
  const { themeId } = useConfigStore();
  const currentTheme = getThemeById(themeId);

  const [libraries, setLibraries] = useState<WordLibrary[]>([]);
  const [selectedLibraryId, setSelectedLibraryId] = useState<string>('');
  const [editingContent, setEditingContent] = useState<string>('');
  const [libraryName, setLibraryName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 加载字库列表
  useEffect(() => {
    loadLibraries();
  }, []);

  const loadLibraries = async () => {
    try {
      setIsLoading(true);
      const allLibraries = await libraryRepository.getAll();
      setLibraries(allLibraries);

      if (allLibraries.length > 0 && !selectedLibraryId) {
        setSelectedLibraryId(allLibraries[0].id);
        loadLibraryContent(allLibraries[0].id);
      }
    } catch (error) {
      showMessage('error', '加载字库失败：' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLibraryContent = async (libraryId: string) => {
    try {
      const words = await libraryRepository.getWords(libraryId);
      const library = await libraryRepository.getById(libraryId);
      setEditingContent(words.map(w => w.text).join(', '));
      if (library) {
        setLibraryName(library.name);
      }
    } catch (error) {
      showMessage('error', '加载字库内容失败：' + (error as Error).message);
    }
  };

  const handleSelectLibrary = (libraryId: string) => {
    setSelectedLibraryId(libraryId);
    loadLibraryContent(libraryId);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const words = editingContent
        .split(/[,，\s\n]+/)
        .filter(w => w.trim().length > 0)
        .map((text, index) => ({
          id: `word-${Date.now()}-${index}`,
          text: text.trim(),
        }));

      if (words.length === 0) {
        showMessage('error', '字库不能为空');
        return;
      }

      if (words.length > 500) {
        showMessage('error', '单个字库最多包含 500 个字符/单词');
        return;
      }

      await libraryRepository.update(selectedLibraryId, {
        name: libraryName,
        words,
        updatedAt: Date.now(),
      });

      showMessage('success', '字库保存成功');
      loadLibraries();
    } catch (error) {
      showMessage('error', '保存失败：' + (error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateNew = () => {
    const newLibrary: WordLibrary = {
      id: `library-${Date.now()}`,
      name: '新字库',
      description: '自定义字库',
      language: 'en',
      words: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isBuiltIn: false,
    };

    libraryRepository
      .create(newLibrary)
      .then(() => {
        showMessage('success', '创建成功');
        loadLibraries();
      })
      .catch((error) => {
        showMessage('error', '创建失败：' + (error as Error).message);
      });
  };

  const handleDelete = () => {
    const library = libraries.find(l => l.id === selectedLibraryId);
    if (library?.isBuiltIn) {
      showMessage('error', '不能删除内置字库');
      return;
    }

    if (window.confirm(`确定要删除字库"${library?.name}"吗？此操作不可撤销。`)) {
      libraryRepository
        .delete(selectedLibraryId)
        .then(() => {
          showMessage('success', '删除成功');
          setSelectedLibraryId('');
          loadLibraries();
        })
        .catch((error) => {
          showMessage('error', '删除失败：' + (error as Error).message);
        });
    }
  };

  const handleExport = () => {
    const library = libraries.find(l => l.id === selectedLibraryId);
    if (!library) {
      showMessage('error', '请先选择字库');
      return;
    }

    const dataStr = JSON.stringify(library, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${library.name}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showMessage('success', '导出成功');
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string) as WordLibrary;

        // 验证导入的数据
        if (!imported.id || !imported.name || !Array.isArray(imported.words)) {
          throw new Error('无效的 JSON 格式');
        }

        const newLibrary: WordLibrary = {
          ...imported,
          id: `imported-${Date.now()}`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          isBuiltIn: false,
        };

        libraryRepository
          .create(newLibrary)
          .then(() => {
            showMessage('success', '导入成功');
            loadLibraries();
          })
          .catch((error) => {
            showMessage('error', '导入失败：' + (error as Error).message);
          });
      } catch (error) {
        showMessage('error', '导入失败：无效的 JSON 格式');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const selectedLibrary = libraries.find(l => l.id === selectedLibraryId);

  return (
    <div className={`min-h-screen bg-gradient-to-b ${currentTheme?.gradientFrom || 'from-sky-300'} ${currentTheme?.gradientTo || 'to-sky-100'} p-4`}>
      <div className="max-w-4xl mx-auto space-y-4">
        {/* 顶部导航栏 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="text-2xl hover:scale-110 transition-transform spring-bounce"
            >
              ←
            </button>
            <h1 className="text-3xl font-bold text-sky-600 bounce-in">
              📚 字库管理
            </h1>
          </div>
        </div>

        {/* 消息提示 */}
        {message && (
          <div
            className={`p-4 rounded-xl border-2 cartoon-shadow ${
              message.type === 'success'
                ? 'bg-green-50 border-green-300 text-green-700'
                : 'bg-red-50 border-red-300 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* 字库选择卡片 */}
        <Card className="bg-white/95 shadow-2xl border-4 border-sky-400 dialog-slide-in cartoon-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">当前字库</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex-1 h-12 text-lg justify-between spring-bounce">
                    <span>
                      {selectedLibrary ? (
                        <>
                          {selectedLibrary.isBuiltIn && '📄 '}
                          {selectedLibrary.name} ({selectedLibrary.words.length} 个)
                        </>
                      ) : (
                        '请选择字库...'
                      )}
                    </span>
                    <span className="text-gray-400">▼</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full max-h-[300px] overflow-y-auto">
                  {libraries.map((lib) => (
                    <DropdownMenuItem
                      key={lib.id}
                      onClick={() => handleSelectLibrary(lib.id)}
                      className="p-3 cursor-pointer"
                    >
                      <div>
                        <div className="font-medium">
                          {lib.isBuiltIn && '📄 '}
                          {lib.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {lib.words.length} 个字符/单词
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                onClick={handleCreateNew}
                variant="outline"
                className="h-12 w-12 p-0 spring-bounce"
                title="新建字库"
              >
                ➕
              </Button>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-2">
              <Button
                onClick={handleExport}
                variant="outline"
                className="flex-1 h-10 spring-bounce"
                disabled={!selectedLibraryId}
              >
                📤 导出
              </Button>

              <label className="flex-1">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  className="w-full h-10 spring-bounce"
                  asChild
                >
                  <span>📥 导入</span>
                </Button>
              </label>

              <Button
                onClick={handleDelete}
                variant="outline"
                className="flex-1 h-10 text-red-600 border-red-300 hover:bg-red-50 spring-bounce"
                disabled={!selectedLibraryId || selectedLibrary?.isBuiltIn}
              >
                🗑️ 删除
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 字库编辑卡片 */}
        <Card className="bg-white/95 shadow-2xl border-4 border-sky-400 dialog-slide-in cartoon-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">字库内容</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="library-name">字库名称</Label>
              <Input
                id="library-name"
                value={libraryName}
                onChange={(e) => setLibraryName(e.target.value)}
                className="h-12 text-lg"
                maxLength={50}
                disabled={!selectedLibraryId}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="library-content">
                字库内容（用逗号、空格或换行分隔）
              </Label>
              <textarea
                id="library-content"
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
                className="w-full h-48 p-3 border-2 border-sky-200 rounded-xl focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition-all"
                placeholder="输入字母或单词，例如：a, b, c, cat, dog..."
                disabled={!selectedLibraryId}
              />
              <div className="text-sm text-gray-500">
                当前字符数：{editingContent.split(/[,，\s\n]+/).filter(w => w.trim()).length} / 500
              </div>
            </div>

            <Button
              onClick={handleSave}
              className="w-full h-12 text-lg bg-sky-500 hover:bg-sky-600 button-glow spring-bounce cartoon-shadow"
              disabled={!selectedLibraryId || isSaving || isLoading}
            >
              {isSaving ? '保存中...' : '💾 保存字库'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
