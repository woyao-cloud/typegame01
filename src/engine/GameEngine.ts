// T3.1 - 游戏引擎核心类

import { GameState, GameConfig, Word, Difficulty, Speed, GameMode } from '@/types';
import { getAdjacentKeys } from '@/utils/adjacent-keys';
import { getSameHandZone } from '@/utils/hand-zone';
import { getKeyDistance } from '@/utils/keyboard';
import { getAudioManager } from '@/utils/audio';

/**
 * 游戏引擎配置
 */
interface EngineConfig {
  onStateChange?: (state: Partial<GameState>) => void;
  onGameEnd?: (result: { score: number; wpm: number; accuracy: number }) => void;
  onMiss?: () => void;
  onComboBreak?: () => void;
}

/**
 * 游戏引擎类
 * 负责管理游戏状态、输入处理、游戏循环
 */
export class GameEngine {
  // 游戏状态
  private state: GameState = {
    status: 'idle',
    score: 0,
    combo: 0,
    elapsedTime: 0,
    currentWord: null,
    typedIndex: 0,
    mistakes: 0,
    correctChars: 0,
    totalChars: 0,
  };

  // 游戏配置
  private config: GameConfig = {
    difficulty: 1,
    speed: 2,
    duration: 120,
    mode: 'letter',
  };

  // 词库
  private wordLibrary: Word[] = [];

  // 轨道上的单词 (用于 track-based 模式)
  private activeWords: Array<{
    id: string;
    text: string;
    track: number;
    progress: number; // 0-100
    y: number;
  }> = [];

  // 游戏循环
  private gameLoopId: number | null = null;
  private lastUpdateTime: number = 0;

  // 输入防抖
  private lastKeyPressTime: number = 0;
  private lastKeyPressKey: string | null = null;
  private readonly KEY_DEBOUNCE_MS = 50;

  // 回调函数
  private onStateChange?: (state: Partial<GameState>) => void;
  private onGameEndCallback?: (result: {
    score: number;
    wpm: number;
    accuracy: number;
  }) => void;
  private onMissCallback?: () => void;
  private onComboBreakCallback?: () => void;

  // 音频管理器
  private audioManager = getAudioManager();

  // 难度算法实例
  private difficultyAlgorithm: DifficultyAlgorithm;

  constructor(config?: EngineConfig) {
    this.onStateChange = config?.onStateChange;
    this.onGameEndCallback = config?.onGameEnd;
    this.onMissCallback = config?.onMiss;
    this.onComboBreakCallback = config?.onComboBreak;
    this.difficultyAlgorithm = new DifficultyAlgorithm();
  }

  /**
   * 初始化游戏
   */
  initialize(config: GameConfig, wordLibrary: Word[]): void {
    this.config = { ...config };
    this.wordLibrary = [...wordLibrary];
    this.resetState();
  }

  /**
   * 重置游戏状态
   */
  private resetState(): void {
    this.state = {
      status: 'idle',
      score: 0,
      combo: 0,
      elapsedTime: 0,
      currentWord: null,
      typedIndex: 0,
      mistakes: 0,
      correctChars: 0,
      totalChars: 0,
    };
    this.activeWords = [];
    this.notifyStateChange();
  }

  /**
   * 开始游戏
   */
  start(): void {
    if (this.state.status !== 'idle') {
      return;
    }

    this.state.status = 'playing';
    this.lastUpdateTime = performance.now();

    // 生成第一个单词
    this.spawnWord();

    // 启动游戏循环
    this.startGameLoop();

    this.notifyStateChange();
  }

  /**
   * 暂停游戏
   */
  pause(): void {
    if (this.state.status !== 'playing') {
      return;
    }

    this.state.status = 'paused';
    this.stopGameLoop();
    this.notifyStateChange();
  }

  /**
   * 恢复游戏
   */
  resume(): void {
    if (this.state.status !== 'paused') {
      return;
    }

    this.state.status = 'playing';
    this.lastUpdateTime = performance.now();
    this.startGameLoop();
    this.notifyStateChange();
  }

  /**
   * 结束游戏
   */
  stop(): void {
    this.state.status = 'gameover';
    this.stopGameLoop();

    // 触发结束回调
    this.triggerGameEnd();
    this.notifyStateChange();
  }

  /**
   * 处理键盘输入
   * @param key 按下的键
   * @returns 是否成功处理输入
   */
  handleInput(key: string): boolean {
    // 防抖检查
    const now = performance.now();
    if (
      now - this.lastKeyPressTime < this.KEY_DEBOUNCE_MS &&
      key === this.lastKeyPressKey
    ) {
      return false;
    }

    this.lastKeyPressTime = now;
    this.lastKeyPressKey = key;

    if (this.state.status !== 'playing' || !this.state.currentWord) {
      return false;
    }

    const expectedChar = this.state.currentWord.text[this.state.typedIndex];

    if (key.toLowerCase() === expectedChar.toLowerCase()) {
      // 输入正确
      this.handleCorrectInput(key);
      return true;
    } else {
      // 输入错误
      this.handleMistake(key);
      return false;
    }
  }

  /**
   * 处理正确输入
   */
  private handleCorrectInput(key: string): void {
    this.state.typedIndex++;
    this.state.correctChars++;
    this.state.totalChars++;
    this.state.combo++;

    // 播放正确音效
    this.audioManager.playCorrect();

    // 连击音效 (每 5 连击)
    if (this.state.combo > 0 && this.state.combo % 5 === 0) {
      this.audioManager.playCombo();
    }

    // 计算单次得分
    const basePoints = 10;
    const comboMultiplier = 1 + Math.floor(this.state.combo / 5) * 0.1;
    const difficultyBonus = this.config.difficulty * 2;
    const points = Math.round(basePoints * comboMultiplier + difficultyBonus);
    this.state.score += points;

    // 检查单词是否完成
    if (this.state.typedIndex >= this.state.currentWord.text.length) {
      this.completeCurrentWord();
    }

    this.notifyStateChange();
  }

  /**
   * 处理错误输入
   */
  private handleMistake(key: string): void {
    this.state.mistakes++;
    this.state.totalChars++;
    this.state.combo = 0; // 连击中断

    // 播放错误音效
    this.audioManager.playMistake();

    // 触发连击中断回调
    if (this.onComboBreakCallback) {
      this.onComboBreakCallback();
    }

    this.notifyStateChange();
  }

  /**
   * 完成当前单词
   */
  private completeCurrentWord(): void {
    // 播放完成音效
    this.audioManager.playComplete();

    // 从活跃单词列表中移除
    this.activeWords = this.activeWords.filter(
      (w) => w.text !== this.state.currentWord?.text
    );

    // 生成新单词
    this.spawnWord();

    this.state.typedIndex = 0;
    this.notifyStateChange();
  }

  /**
   * 生成新单词
   */
  private spawnWord(): void {
    if (this.wordLibrary.length === 0) {
      return;
    }

    // 使用难度算法选择单词
    const selectedWord = this.difficultyAlgorithm.selectWord(
      this.wordLibrary,
      this.config.difficulty,
      this.state.currentWord
    );

    if (selectedWord) {
      this.state.currentWord = selectedWord;
      this.state.typedIndex = 0;

      // 添加到活跃轨道 (用于 track-based 模式)
      this.activeWords.push({
        id: selectedWord.id,
        text: selectedWord.text,
        track: Math.floor(Math.random() * 5), // 5 个轨道
        progress: 0,
        y: 0,
      });
    }
  }

  /**
   * 启动游戏循环
   */
  private startGameLoop(): void {
    if (this.gameLoopId !== null) {
      return;
    }

    const loop = (currentTime: number) => {
      const deltaTime = currentTime - this.lastUpdateTime;
      this.lastUpdateTime = currentTime;

      // 更新游戏状态
      this.update(deltaTime);

      // 检查字母是否到达底部
      this.checkLetterReachedEnd();

      // 检查游戏是否结束
      this.checkGameEnd();

      if (this.state.status === 'playing') {
        this.gameLoopId = requestAnimationFrame(loop);
      } else {
        this.gameLoopId = null;
      }
    };

    this.gameLoopId = requestAnimationFrame(loop);
  }

  /**
   * 停止游戏循环
   */
  private stopGameLoop(): void {
    if (this.gameLoopId !== null) {
      cancelAnimationFrame(this.gameLoopId);
      this.gameLoopId = null;
    }
  }

  /**
   * 更新游戏状态
   * @param deltaTime 距离上一帧的时间 (毫秒)
   */
  private update(deltaTime: number): void {
    // 更新已用时间
    this.state.elapsedTime += deltaTime;

    // 更新轨道上单词的进度
    const speedMultiplier = this.config.speed / 2;
    const progressDelta = (deltaTime / 1000) * speedMultiplier * 10; // 每秒 10% 基础进度

    this.activeWords.forEach((word) => {
      word.progress += progressDelta;
      word.y = word.progress * 3; // 每 1% 进度 = 3 像素
    });

    this.notifyStateChange();
  }

  /**
   * 检查字母是否到达底部
   */
  private checkLetterReachedEnd(): void {
    const reachedEnd = this.activeWords.some((word) => word.progress >= 100);

    if (reachedEnd) {
      // 播放 Miss 音效
      this.audioManager.playMistake();

      // 触发 Miss 回调
      if (this.onMissCallback) {
        this.onMissCallback();
      }

      // 连击中断
      this.state.combo = 0;

      if (this.onComboBreakCallback) {
        this.onComboBreakCallback();
      }

      // 移除到达底部的单词
      this.activeWords = this.activeWords.filter((w) => w.progress < 100);

      // 生成新单词
      this.spawnWord();
      this.state.typedIndex = 0;

      this.notifyStateChange();
    }
  }

  /**
   * 检查游戏是否结束
   */
  private checkGameEnd(): void {
    const durationMs = this.config.duration * 1000; // 秒转毫秒

    if (this.state.elapsedTime >= durationMs) {
      this.stop();
    }
  }

  /**
   * 触发游戏结束回调
   */
  private triggerGameEnd(): void {
    if (!this.onGameEndCallback) return;

    // 播放游戏结束音效
    this.audioManager.playGameover();

    const wpm = this.calculateWPM();
    const accuracy = this.calculateAccuracy();

    this.onGameEndCallback({
      score: this.state.score,
      wpm,
      accuracy,
    });
  }

  /**
   * 计算 WPM (每分钟单词数)
   */
  private calculateWPM(): number {
    const elapsedMinutes = this.state.elapsedTime / 1000 / 60;
    if (elapsedMinutes === 0) return 0;

    // WPM = (正确字符数 / 5) / 分钟数
    return Math.round((this.state.correctChars / 5) / elapsedMinutes);
  }

  /**
   * 计算准确率
   */
  private calculateAccuracy(): number {
    if (this.state.totalChars === 0) return 100;

    return Math.round((this.state.correctChars / this.state.totalChars) * 100);
  }

  /**
   * 通知状态变化
   */
  private notifyStateChange(): void {
    if (this.onStateChange) {
      this.onStateChange({
        status: this.state.status,
        score: this.state.score,
        combo: this.state.combo,
        elapsedTime: this.state.elapsedTime,
        currentWord: this.state.currentWord,
        typedIndex: this.state.typedIndex,
        mistakes: this.state.mistakes,
        correctChars: this.state.correctChars,
        totalChars: this.state.totalChars,
      });
    }
  }

  /**
   * 设置游戏结束回调
   */
  setOnGameEndCallback(
    callback: (result: { score: number; wpm: number; accuracy: number }) => void
  ): void {
    this.onGameEndCallback = callback;
  }

  /**
   * 获取当前状态
   */
  getState(): GameState {
    return { ...this.state };
  }

  /**
   * 获取活跃单词列表
   */
  getActiveWords(): Array<{
    id: string;
    text: string;
    track: number;
    progress: number;
    y: number;
  }> {
    return [...this.activeWords];
  }
}

/**
 * 难度算法类
 * 负责根据难度等级选择单词
 */
class DifficultyAlgorithm {
  /**
   * 根据难度选择单词
   * @param wordLibrary 词库
   * @param difficulty 难度等级 (1-3)
   * @param previousWord 上一个单词 (用于避免重复)
   */
  selectWord(
    wordLibrary: Word[],
    difficulty: Difficulty,
    previousWord: Word | null
  ): Word | null {
    if (wordLibrary.length === 0) {
      return null;
    }

    // 过滤出符合难度要求的单词
    const filteredWords = this.filterByDifficulty(wordLibrary, difficulty);

    if (filteredWords.length === 0) {
      // 如果没有符合难度的单词，返回任意一个
      return this.getRandomWord(wordLibrary, previousWord);
    }

    return this.getRandomWord(filteredWords, previousWord);
  }

  /**
   * 根据难度过滤单词
   */
  private filterByDifficulty(words: Word[], difficulty: Difficulty): Word[] {
    if (difficulty === 1) {
      // 简单：1-3 个字母
      return words.filter((w) => w.text.length <= 3);
    } else if (difficulty === 2) {
      // 中等：3-5 个字母
      return words.filter((w) => w.text.length >= 3 && w.text.length <= 5);
    } else {
      // 困难：5+ 个字母
      return words.filter((w) => w.text.length >= 5);
    }
  }

  /**
   * 随机选择一个单词 (避免与上一个重复)
   */
  private getRandomWord(words: Word[], previousWord: Word | null): Word | null {
    if (words.length === 0) return null;

    if (words.length === 1) {
      return words[0];
    }

    // 尝试选择不重复的单词
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      const randomIndex = Math.floor(Math.random() * words.length);
      const selected = words[randomIndex];

      if (!previousWord || selected.id !== previousWord.id) {
        return selected;
      }

      attempts++;
    }

    // 如果多次尝试都重复，返回任意一个
    return words[Math.floor(Math.random() * words.length)];
  }
}
