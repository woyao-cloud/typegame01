// T5.1 - 音频设置组件

'use client';

import React from 'react';
import { useConfigStore } from '@/stores/configStore';
import { getAudioManager } from '@/utils/audio';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

/**
 * 音频设置组件
 * 控制音量、静音、音效开关
 */
export function AudioSettings() {
  const { audioConfig, setAudioConfig } = useConfigStore();
  const audioManager = getAudioManager();

  // 同步配置到音频管理器
  React.useEffect(() => {
    audioManager.setConfig(audioConfig);
  }, [audioConfig]);

  // 测试音效
  const handleTestSound = () => {
    audioManager.playClick();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <span>🔊</span>
          音频设置
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 音量控制 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="volume" className="text-sm font-medium">
              音量
            </Label>
            <span className="text-sm text-gray-500">
              {Math.round(audioConfig.volume * 100)}%
            </span>
          </div>
          <input
            type="range"
            id="volume"
            min="0"
            max="100"
            value={audioConfig.volume * 100}
            onChange={(e) =>
              setAudioConfig({ volume: parseInt(e.target.value) / 100 })
            }
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* 静音开关 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{audioConfig.muted ? '🔇' : '🔊'}</span>
            <Label htmlFor="muted" className="text-sm font-medium">
              静音
            </Label>
          </div>
          <button
            onClick={() => setAudioConfig({ muted: !audioConfig.muted })}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              audioConfig.muted ? 'bg-gray-400' : 'bg-sky-500'
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                audioConfig.muted ? 'left-1' : 'left-7'
              }`}
            />
          </button>
        </div>

        {/* 音效开关 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎵</span>
            <Label htmlFor="soundEnabled" className="text-sm font-medium">
              音效
            </Label>
          </div>
          <button
            onClick={() =>
              setAudioConfig({ soundEnabled: !audioConfig.soundEnabled })
            }
            className={`relative w-12 h-6 rounded-full transition-colors ${
              !audioConfig.soundEnabled ? 'bg-gray-400' : 'bg-sky-500'
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                !audioConfig.soundEnabled ? 'left-1' : 'left-7'
              }`}
            />
          </button>
        </div>

        {/* 测试音效按钮组 */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            onClick={() => audioManager.playCorrect()}
            variant="outline"
            size="sm"
            disabled={!audioConfig.soundEnabled || audioConfig.muted}
          >
            ✅ 正确
          </Button>
          <Button
            onClick={() => audioManager.playMistake()}
            variant="outline"
            size="sm"
            disabled={!audioConfig.soundEnabled || audioConfig.muted}
          >
            ❌ 错误
          </Button>
          <Button
            onClick={handleTestSound}
            variant="outline"
            size="sm"
            disabled={!audioConfig.soundEnabled || audioConfig.muted}
          >
            🔔 点击
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
