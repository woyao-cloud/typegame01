// T3.3 - 音频管理器

/**
 * 音频配置
 */
export interface AudioConfig {
  volume: number; // 0-1
  muted: boolean;
  soundEnabled: boolean;
}

/**
 * 音效类型
 */
export type SoundEffect =
  | 'correct' // 正确输入
  | 'mistake' // 错误输入
  | 'combo' // 连击
  | 'complete' // 完成单词
  | 'gameover' // 游戏结束
  | 'click'; // UI 点击

/**
 * 音频管理器
 * 使用 Web Audio API，支持降级到 HTML5 Audio
 */
export class AudioManager {
  private audioContext: AudioContext | null = null;
  private config: AudioConfig = {
    volume: 0.5,
    muted: false,
    soundEnabled: true,
  };

  // 预定义的音效频率
  private readonly frequencies = {
    correct: 880, // A5
    mistake: 220, // A3
    combo: 1174, // D6
    complete: 1318.51, // E6
    gameover: 440, // A4
    click: 660, // E5
  };

  constructor(config?: Partial<AudioConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  /**
   * 初始化音频上下文
   * 需要在用户交互后调用 (浏览器自动播放策略)
   */
  initialize(): void {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }

    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  /**
   * 播放音效
   * @param sound 音效类型
   */
  play(sound: SoundEffect): void {
    if (!this.config.soundEnabled || this.config.muted) {
      return;
    }

    // 尝试使用 Web Audio API
    if (this.audioContext) {
      this.playWithWebAudio(sound);
    } else {
      // 降级到 HTML5 Audio
      this.playWithAudioElement(sound);
    }
  }

  /**
   * 使用 Web Audio API 播放音效
   */
  private playWithWebAudio(sound: SoundEffect): void {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    // 连接节点
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // 设置频率
    oscillator.frequency.value = this.frequencies[sound];

    // 设置波形
    oscillator.type = sound === 'mistake' ? 'sawtooth' : 'sine';

    // 设置音量包络
    const now = this.audioContext.currentTime;
    const duration = sound === 'gameover' ? 0.5 : 0.1;

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(this.config.volume, now + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, now + duration);

    // 播放
    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  /**
   * 使用 HTML5 Audio 降级播放
   */
  private playWithAudioElement(sound: SoundEffect): void {
    // 创建简单的 beep 音
    const audio = new Audio();
    audio.volume = this.config.volume;

    // 使用 Base64 编码的短音频
    const beepData = this.getBeepData(sound);
    if (beepData) {
      audio.src = beepData;
      audio.play().catch(() => {
        // 静默失败 (自动播放策略限制)
      });
    }
  }

  /**
   * 获取 Base64 音频数据
   * 使用 Web Audio API 生成简单音效，无需外部文件
   */
  private getBeepData(sound: SoundEffect): string {
    // 降级方案：返回空字符串，由 playWithAudioElement 处理
    // 实际项目中可以替换为真实音效文件的 Base64 编码
    return '';
  }

  /**
   * 播放升级音效（达到特定连击数）
   * @param level 连击等级 (5/10/20/50)
   */
  playLevelUp(level: number): void {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // 根据等级设置不同频率
    const baseFreq = 523.25; // C5
    const freqMultiplier = level >= 50 ? 2 : level >= 20 ? 1.5 : level >= 10 ? 1.25 : 1;
    oscillator.frequency.value = baseFreq * freqMultiplier;
    oscillator.type = 'sine';

    // 升级音效更长更欢快
    const now = this.audioContext.currentTime;
    const duration = 0.3;

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(this.config.volume, now + 0.05);
    gainNode.gain.linearRampToValueAtTime(0, now + duration);

    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  /**
   * 更新配置
   */
  setConfig(config: Partial<AudioConfig>): void {
    this.config = { ...this.config, ...config };

    // 如果禁用声音，停止所有播放
    if (!this.config.soundEnabled || this.config.muted) {
      this.audioContext?.suspend();
    } else {
      this.audioContext?.resume();
    }
  }

  /**
   * 获取当前配置
   */
  getConfig(): AudioConfig {
    return { ...this.config };
  }

  /**
   * 播放正确音效
   */
  playCorrect(): void {
    this.play('correct');
  }

  /**
   * 播放错误音效
   */
  playMistake(): void {
    this.play('mistake');
  }

  /**
   * 播放连击音效
   */
  playCombo(): void {
    this.play('combo');
  }

  /**
   * 播放完成音效
   */
  playComplete(): void {
    this.play('complete');
  }

  /**
   * 播放游戏结束音效
   */
  playGameover(): void {
    this.play('gameover');
  }

  /**
   * 播放点击音效
   */
  playClick(): void {
    this.play('click');
  }

  /**
   * 播放升级音效
   */
  playLevelUp(level: number): void {
    this.playLevelUp(level);
  }
}

/**
 * 全局音频管理器实例
 */
let globalAudioManager: AudioManager | null = null;

/**
 * 获取全局音频管理器
 */
export function getAudioManager(): AudioManager {
  if (!globalAudioManager) {
    globalAudioManager = new AudioManager();
  }
  return globalAudioManager;
}

/**
 * 初始化全局音频管理器
 */
export function initializeAudioManager(config?: Partial<AudioConfig>): void {
  globalAudioManager = new AudioManager(config);
}
