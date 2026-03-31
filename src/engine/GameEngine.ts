// T3.1 - 游戏引擎核心类

import { GameState, GameConfig, Word, Difficulty, Speed, GameMode } from '@/types';
import { getAdjacentKeys } from '@/utils/adjacent-keys';
import { getSameHandZone, getHandInfo } from '@/utils/hand-zone';
import { getKeyDistance, QWERTY_LAYOUT } from '@/utils/keyboard';
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
    typedIndex: number; // 已输入字符数
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
      activeWords: [],
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
   * 支持多字母模式：用户输入任意字母，匹配到轨道上的任意字母即可消除
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

    if (this.state.status !== 'playing' || this.activeWords.length === 0) {
      return false;
    }

    // 在多字母模式下，查找是否有活跃单词匹配当前输入
    const matchingWord = this.activeWords.find((word) => {
      const expectedChar = word.text[word.typedIndex];
      return key.toLowerCase() === expectedChar.toLowerCase();
    });

    if (matchingWord) {
      // 输入正确，处理匹配的单词
      this.handleCorrectInput(key, matchingWord);
      return true;
    } else {
      // 输入错误
      this.handleMistake(key);
      return false;
    }
  }

  /**
   * 处理正确输入
   * @param key 按下的键
   * @param word 匹配的活跃单词
   */
  private handleCorrectInput(key: string, word: typeof this.activeWords[0]): void {
    // 更新该单词的已输入进度
    word.typedIndex++;

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
    if (word.typedIndex >= word.text.length) {
      this.completeWord(word);
    }

    // 更新状态中的 currentWord 指向最新匹配的单词
    this.state.currentWord = word;
    this.state.typedIndex = word.typedIndex;

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
   * 完成当前单词（旧版兼容）
   */
  private completeCurrentWord(): void {
    if (this.state.currentWord) {
      this.completeWord({
        id: this.state.currentWord.id,
        text: this.state.currentWord.text,
        track: 0,
        progress: 0,
        y: 0,
        typedIndex: this.state.typedIndex,
      });
    }
  }

  /**
   * 完成指定单词
   * @param word 要完成的单词
   */
  private completeWord(word: typeof this.activeWords[0]): void {
    // 播放完成音效
    this.audioManager.playComplete();

    // 从活跃单词列表中移除
    this.activeWords = this.activeWords.filter((w) => w.id !== word.id);

    // 如果所有单词都完成了，生成新单词
    if (this.activeWords.length === 0) {
      this.spawnWord();
    }

    this.notifyStateChange();
  }

  /**
   * 生成新单词
   * 同时生成 4 个不同的字母到 4 条轨道
   */
  private spawnWord(): void {
    if (this.wordLibrary.length === 0) {
      return;
    }

    // 选择 4 个不同的字母
    const selectedWords: Word[] = [];
    const usedTracks = new Set<number>();
    const usedIds = new Set<string>();

    // 获取可用的字母池（单字母）
    const letterPool = this.wordLibrary.filter((w) => w.text.length === 1);
    if (letterPool.length === 0) {
      return;
    }

    // 选择 4 个不同的字母，分配到 4 条不同的轨道
    for (let i = 0; i < 4 && letterPool.length > 0; i++) {
      // 过滤出未使用的字母
      const availableLetters = letterPool.filter(
        (w) => !usedIds.has(w.id) && !this.difficultyAlgorithm.isUsed(w.id)
      );

      if (availableLetters.length === 0) {
        // 如果所有字母都用过了，清空历史
        this.difficultyAlgorithm.clearHistory();
        break;
      }

      // 使用难度算法选择字母
      const selectedWord = this.difficultyAlgorithm.selectWord(
        availableLetters,
        this.config.difficulty,
        selectedWords.length > 0 ? selectedWords[selectedWords.length - 1] : null
      );

      if (!selectedWord) {
        // 降级：随机选择一个未使用的字母
        const randomIndex = Math.floor(Math.random() * availableLetters.length);
        selectedWord = availableLetters[randomIndex];
      }

      // 分配一个空闲轨道
      let track = -1;
      for (let t = 0; t < 5; t++) {
        if (!usedTracks.has(t)) {
          track = t;
          break;
        }
      }

      if (track === -1) {
        track = Math.floor(Math.random() * 5);
      }

      selectedWords.push(selectedWord);
      usedTracks.add(track);
      usedIds.add(selectedWord.id);

      // 添加到活跃单词列表
      this.activeWords.push({
        id: selectedWord.id,
        text: selectedWord.text,
        track,
        progress: 0,
        y: 0,
        typedIndex: 0,
      });
    }

    // 更新状态中的 currentWord 为第一个单词（兼容性）
    if (selectedWords.length > 0) {
      this.state.currentWord = selectedWords[0];
      this.state.typedIndex = 0;
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

    // 更新轨道上单词的进度 - 使用速度表
    const speedTable: Record<number, number> = {
      0: 0.56,  // 超慢：30 秒全程 (100% / 30s)
      1: 0.83,  // 慢速：20 秒全程 (100% / 20s)
      2: 1.67,  // 正常：10 秒全程 (100% / 10s)
      3: 3.33,  // 快速：5 秒全程 (100% / 5s)
      4: 5.56,  // 极速：3 秒全程 (100% / 3s)
    };
    const speedPercentPerSecond = speedTable[this.config.speed] || 1.67;
    const progressDelta = (deltaTime / 1000) * speedPercentPerSecond;

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
    // 找出所有到达底部的单词
    const reachedEndWords = this.activeWords.filter((word) => word.progress >= 100);

    if (reachedEndWords.length > 0) {
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
      const reachedEndIds = new Set(reachedEndWords.map((w) => w.id));
      this.activeWords = this.activeWords.filter((w) => w.progress < 100);

      // 如果所有单词都消失了，生成新单词
      if (this.activeWords.length === 0) {
        this.spawnWord();
      }

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
 * 负责根据难度等级选择单词，实现智能字母生成
 * FRD-013: 低难度时同时出现的字母在键盘上位置相近
 */
class DifficultyAlgorithm {
  // 已使用的字母记录（用于避免重复）
  private usedWords: Set<string> = new Set();
  private readonly MAX_HISTORY = 10;

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

    // 根据难度选择智能生成策略
    let selected: Word | null = null;

    if (difficulty === 1) {
      // 简单难度：选择同手区的字母
      selected = this.selectSameHandWord(filteredWords, previousWord);
    } else if (difficulty === 2) {
      // 中等难度：选择相邻键或同手区字母
      selected = this.selectAdjacentWord(filteredWords, previousWord);
    } else {
      // 困难难度：完全随机
      selected = this.getRandomWord(filteredWords, previousWord);
    }

    // 记录已使用的单词
    if (selected) {
      this.usedWords.add(selected.id);
      if (this.usedWords.size > this.MAX_HISTORY) {
        // 移除最早的记录
        const firstKey = this.usedWords.values().next().value;
        this.usedWords.delete(firstKey);
      }
    }

    return selected;
  }

  /**
   * 简单难度：选择同手区的字母
   * 确保同时出现的字母都在左手区或都在右手区
   */
  private selectSameHandWord(words: Word[], previousWord: Word | null): Word | null {
    // 获取上一个单词的手别
    let targetHand: 'left' | 'right' | null = null;

    if (previousWord && previousWord.text.length === 1) {
      targetHand = getHandInfo(previousWord.text[0]).hand;
    } else {
      // 随机选择一只手
      targetHand = Math.random() < 0.5 ? 'left' : 'right';
    }

    // 过滤出目标手区的字母
    const sameHandWords = words.filter((w) => {
      if (w.text.length !== 1) return false;
      const handInfo = getHandInfo(w.text[0]);
      return handInfo.hand === targetHand;
    });

    if (sameHandWords.length > 0) {
      // 优先选择未使用过的
      const unusedWords = sameHandWords.filter((w) => !this.usedWords.has(w.id));
      if (unusedWords.length > 0) {
        return unusedWords[Math.floor(Math.random() * unusedWords.length)];
      }
      // 如果没有未使用的，返回任意一个
      return sameHandWords[Math.floor(Math.random() * sameHandWords.length)];
    }

    // 如果目标手区没有可用字母，返回另一只手
    const otherHandWords = words.filter((w) => {
      if (w.text.length !== 1) return false;
      const handInfo = getHandInfo(w.text[0]);
      return handInfo.hand !== targetHand;
    });

    if (otherHandWords.length > 0) {
      const unusedWords = otherHandWords.filter((w) => !this.usedWords.has(w.id));
      return unusedWords.length > 0
        ? unusedWords[Math.floor(Math.random() * unusedWords.length)]
        : otherHandWords[Math.floor(Math.random() * otherHandWords.length)];
    }

    // 降级：返回任意符合难度的单词
    return this.getRandomWord(words, previousWord);
  }

  /**
   * 中等难度：选择相邻键或同手区字母
   * 字母之间有一定关联性但不完全限制在同一手区
   */
  private selectAdjacentWord(words: Word[], previousWord: Word | null): Word | null {
    if (previousWord && previousWord.text.length === 1) {
      // 获取上一个字母的相邻键
      const adjacentKeys = getAdjacentKeys(previousWord.text[0]);

      // 优先选择相邻键
      const adjacentWords = words.filter((w) => {
        if (w.text.length !== 1) return false;
        return adjacentKeys.includes(w.text[0]);
      });

      if (adjacentWords.length > 0) {
        const unusedWords = adjacentWords.filter((w) => !this.usedWords.has(w.id));
        if (unusedWords.length > 0) {
          return unusedWords[Math.floor(Math.random() * unusedWords.length)];
        }
      }
    }

    // 没有相邻键可选时，返回同手区字母
    return this.selectSameHandWord(words, previousWord);
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

    // 优先选择未使用过的单词
    const unusedWords = words.filter((w) => !this.usedWords.has(w.id));

    if (unusedWords.length > 0) {
      // 尝试选择不重复的单词
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts) {
        const randomIndex = Math.floor(Math.random() * unusedWords.length);
        const selected = unusedWords[randomIndex];

        if (!previousWord || selected.id !== previousWord.id) {
          return selected;
        }

        attempts++;
      }

      // 如果多次尝试都重复，返回任意一个未使用的
      return unusedWords[Math.floor(Math.random() * unusedWords.length)];
    }

    // 所有单词都用过了，清空历史记录后重新选择
    this.usedWords.clear();
    return words[Math.floor(Math.random() * words.length)];
  }

  /**
   * 清空使用历史
   */
  clearHistory(): void {
    this.usedWords.clear();
  }

  /**
   * 检查单词是否已使用
   */
  isUsed(wordId: string): boolean {
    return this.usedWords.has(wordId);
  }
}
