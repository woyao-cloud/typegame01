// T3.6 - 轨道管理器 (5 条平行轨道)

import { Word } from '@/types';

/**
 * 轨道上的单词
 */
export interface TrackWord {
  id: string;
  word: Word;
  track: number; // 0-4
  progress: number; // 0-100 (百分比)
  y: number; // 像素位置
  speed: number; // 像素/帧
}

/**
 * 轨道配置
 */
interface TrackConfig {
  trackCount: number;
  baseSpeed: number;
  speedMultiplier: number;
}

/**
 * 轨道管理器
 * 管理 5 条平行轨道上的单词下落
 */
export class TrackManager {
  private config: TrackConfig = {
    trackCount: 5,
    baseSpeed: 0.5, // 基础速度：每帧 0.5%
    speedMultiplier: 0.1, // 速度等级 multiplier：每级 +10%
  };

  // 活跃单词列表
  private activeWords: TrackWord[] = [];

  // 每个轨道的占用状态
  private trackOccupancy: boolean[] = [false, false, false, false, false];

  // 轨道高度 (像素)
  private trackHeight: number = 600;

  /**
   * 设置轨道高度
   */
  setTrackHeight(height: number): void {
    this.trackHeight = height;
  }

  /**
   * 设置速度等级
   * 速度等级 0-4：
   * - 0: 超慢 (30 秒全程) - baseSpeed = 0.17
   * - 1: 慢速 (20 秒全程) - baseSpeed = 0.25
   * - 2: 正常 (10 秒全程) - baseSpeed = 0.5
   * - 3: 快速 (5 秒全程) - baseSpeed = 1.0
   * - 4: 极速 (3 秒全程) - baseSpeed = 1.67
   */
  setSpeedLevel(speedLevel: number): void {
    // 速度等级 0-4
    const clampedLevel = Math.max(0, Math.min(4, speedLevel));
    const speedTable: Record<number, number> = {
      0: 0.17,  // 超慢：30 秒
      1: 0.25,  // 慢速：20 秒
      2: 0.5,   // 正常：10 秒
      3: 1.0,   // 快速：5 秒
      4: 1.67,  // 极速：3 秒
    };
    this.config.baseSpeed = speedTable[clampedLevel] || 0.5;
  }

  /**
   * 添加新单词到轨道
   * @param word 单词
   * @returns 轨道号，如果返回 -1 表示所有轨道已满
   */
  addWord(word: Word): number {
    // 查找空闲轨道
    const availableTrack = this.findAvailableTrack();

    if (availableTrack === -1) {
      return -1;
    }

    // 标记轨道为占用
    this.trackOccupancy[availableTrack] = true;

    // 创建轨道单词
    const trackWord: TrackWord = {
      id: `${word.id}-${Date.now()}`,
      word,
      track: availableTrack,
      progress: 0,
      y: 0,
      speed: this.config.baseSpeed,
    };

    this.activeWords.push(trackWord);

    return availableTrack;
  }

  /**
   * 查找空闲轨道
   * @returns 轨道号，-1 表示无空闲轨道
   */
  private findAvailableTrack(): number {
    for (let i = 0; i < this.config.trackCount; i++) {
      // 检查轨道上是否有单词接近底部 (progress > 80%)
      const hasNearBottomWord = this.activeWords.some(
        (w) => w.track === i && w.progress > 80
      );

      if (!hasNearBottomWord && !this.trackOccupancy[i]) {
        return i;
      }
    }

    // 如果所有轨道都忙，返回第一个相对最空的
    return this.findLeastOccupiedTrack();
  }

  /**
   * 查找相对最空的轨道
   */
  private findLeastOccupiedTrack(): number {
    let bestTrack = 0;
    let minWords = Infinity;

    for (let i = 0; i < this.config.trackCount; i++) {
      const wordCount = this.activeWords.filter((w) => w.track === i).length;
      if (wordCount < minWords) {
        minWords = wordCount;
        bestTrack = i;
      }
    }

    return bestTrack;
  }

  /**
   * 更新所有轨道单词的位置
   * @param deltaTime 时间增量 (毫秒)
   */
  update(deltaTime: number): void {
    const progressDelta = (deltaTime / 16) * this.config.baseSpeed; // 假设 60fps 基准

    this.activeWords.forEach((trackWord) => {
      trackWord.progress += progressDelta;
      trackWord.y = (trackWord.progress / 100) * this.trackHeight;
    });
  }

  /**
   * 移除完成的单词
   * @param wordId 单词 ID
   */
  removeWord(wordId: string): void {
    const index = this.activeWords.findIndex(
      (w) => w.word.id === wordId || w.id === wordId
    );

    if (index !== -1) {
      const trackWord = this.activeWords[index];
      this.trackOccupancy[trackWord.track] = false;
      this.activeWords.splice(index, 1);
    }
  }

  /**
   * 移除到达底部的单词
   * @returns 到达底部的单词列表
   */
  removeReachedBottom(): TrackWord[] {
    const reachedBottom: TrackWord[] = [];

    this.activeWords = this.activeWords.filter((w) => {
      if (w.progress >= 100) {
        reachedBottom.push(w);
        this.trackOccupancy[w.track] = false;
        return false;
      }
      return true;
    });

    return reachedBottom;
  }

  /**
   * 获取所有活跃单词
   */
  getActiveWords(): TrackWord[] {
    return [...this.activeWords];
  }

  /**
   * 获取指定轨道上的单词
   */
  getWordsByTrack(track: number): TrackWord[] {
    return this.activeWords.filter((w) => w.track === track);
  }

  /**
   * 检查单词是否在指定轨道
   */
  isWordInTrack(wordId: string, track: number): boolean {
    return this.activeWords.some(
      (w) => (w.word.id === wordId || w.id === wordId) && w.track === track
    );
  }

  /**
   * 获取轨道占用状态
   */
  getTrackOccupancy(): boolean[] {
    return [...this.trackOccupancy];
  }

  /**
   * 清空所有轨道
   */
  clear(): void {
    this.activeWords = [];
    this.trackOccupancy = [false, false, false, false, false];
  }

  /**
   * 获取轨道数量
   */
  getTrackCount(): number {
    return this.config.trackCount;
  }
}
