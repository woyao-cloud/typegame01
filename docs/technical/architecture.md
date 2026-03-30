# 技术架构文档

## 儿童打字游戏

---

## 1. 技术选型

### 1.1 核心技术栈

| 层级 | 技术 | 版本 | 选型理由 |
|-----|------|------|---------|
| 语言 | TypeScript | 5.x | 类型安全、智能提示 |
| 构建 | Vite | 5.x | 快速开发、热更新 |
| UI | React | 18.x | 组件化、生态丰富 |
| 样式 | TailwindCSS | 3.x | 快速原型、一致性 |
| 状态 | Zustand | 4.x | 轻量、简单 |
| 存储 | localforage | 1.x | IndexedDB 封装 |

### 1.2 备选方案

| 方案 | 优点 | 缺点 | 决策 |
|-----|------|------|------|
| React + Vite | 生态好、性能优 | 需要学习曲线 | ✅ 首选 |
| Vue + Vite | 上手简单 | 生态略小 | 备选 |
| Svelte | 体积小 | 生态较小 | ❌ |
| 原生 TS | 无框架依赖 | 代码量大 | ❌ |

---

## 2. 系统架构

### 2.1 整体架构图

```
┌─────────────────────────────────────────────────────────┐
│                     Presentation Layer                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ 开始界面    │  │ 配置界面    │  │ 游戏界面        │  │
│  │ StartScreen │  │ ConfigScreen│  │ GameScreen      │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ 结果界面    │  │ 字库管理    │  │ 成就界面        │  │
│  │ ResultScreen│  │ LibraryMgr  │  │ Achievement     │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────┤
│                     Business Logic Layer                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ 游戏引擎    │  │ 难度管理器  │  │ 计分系统        │  │
│  │ GameEngine  │  │ Difficulty  │  │ ScoreSystem     │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ 匹配逻辑    │  │ 键盘映射    │  │ 连击系统        │  │
│  │ MatchLogic  │  │ KeyboardMap │  │ ComboSystem     │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────┤
│                     Data Access Layer                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ 字库存储    │  │ 游戏记录    │  │ 配置存储        │  │
│  │ LibraryRepo │  │ RecordRepo  │  │ ConfigRepo      │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
│                     (IndexedDB / localStorage)           │
└─────────────────────────────────────────────────────────┘
```

### 2.2 组件层级关系

```
App
├── Router (页面路由)
│   ├── HomeRoute
│   ├── GameRoute
│   └── ConfigRoute
├── Store Provider (Zustand)
│   ├── GameStore
│   ├── ConfigStore
│   └── StatsStore
└── Theme Provider
```

---

## 3. 核心模块设计

### 3.1 游戏引擎模块

```typescript
// src/engine/GameEngine.ts

interface GameEngine {
  // 生命周期
  start(config: GameConfig): void;
  pause(): void;
  resume(): void;
  stop(): void;

  // 游戏状态
  getState(): GameState;
  getScore(): number;
  getCombo(): number;

  // 输入处理
  handleKeyPress(key: string): void;

  // 事件
  onScoreChange(callback: (score: number) => void): void;
  onGameOver(callback: (result: GameResult) => void): void;
}
```

**状态机**:
```
IDLE → PLAYING → PAUSED → PLAYING → GAME_OVER → IDLE
```

### 3.2 难度管理模块

```typescript
// src/engine/DifficultyManager.ts

class DifficultyManager {
  private keyboardLayout: string[][] = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm']
  ];

  getAvailableChars(targetChar: string, difficulty: number): string[] {
    switch (difficulty) {
      case 1: // 简单：相邻键
        return this.getAdjacentKeys(targetChar);
      case 2: // 中等：同手区
        return this.getSameHandKeys(targetChar);
      case 3: // 困难：全键盘
        return this.getAllKeys();
    }
  }

  private findKeyPosition(char: string): { row: number; col: number } {
    // 查找字符在键盘中的位置
  }

  private getAdjacentKeys(char: string): string[] {
    // 返回上下左右相邻的键
  }
}
```

### 3.3 匹配逻辑模块

```typescript
// src/engine/MatchLogic.ts

interface MatchResult {
  isMatch: boolean;
  matchedLength: number;
  isComplete: boolean;
}

class MatchLogic {
  checkMatch(
    input: string,
    target: string,
    requiredLength: number
  ): MatchResult {
    const matchedLength = this.calculateMatchLength(input, target);

    return {
      isMatch: matchedLength >= requiredLength,
      matchedLength,
      isComplete: input === target
    };
  }

  private calculateMatchLength(input: string, target: string): number {
    let length = 0;
    for (let i = 0; i < Math.min(input.length, target.length); i++) {
      if (input[i] === target[i]) {
        length++;
      } else {
        break;
      }
    }
    return length;
  }
}
```

### 3.4 计分系统模块

```typescript
// src/engine/ScoreSystem.ts

interface ScoreConfig {
  correctScore: number;      // 正确输入得分 (默认 10)
  comboBonus: number;        // 连击奖励 (默认 5)
  missPenalty: number;       // 超时惩罚 (默认 -5)
  comboThreshold: number;    // 连击阈值 (默认 5)
}

class ScoreSystem {
  private score: number = 0;
  private combo: number = 0;
  private maxCombo: number = 0;

  addCorrect(): number {
    this.combo++;
    this.maxCombo = Math.max(this.maxCombo, this.combo);

    const bonus = this.combo >= 5 ? this.combo * this.comboBonus : 0;
    this.score += 10 + bonus;

    return this.score;
  }

  addMiss(): void {
    this.combo = 0;
    this.score = Math.max(0, this.score - 5);
  }

  reset(): void {
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
  }
}
```

---

## 4. 数据结构设计

### 4.1 核心类型定义

```typescript
// src/types/index.ts

// 字库
interface WordLibrary {
  id: string;
  name: string;
  characters: string[];
  isDefault: boolean;
  createdAt: number;
  updatedAt: number;
}

// 游戏主题
interface GameTheme {
  id: string;
  name: string;
  icon: string;
  color: string;
  backgroundImage: string;
  characterImages: string[];
  vocabulary: string[];
}

// 游戏配置
interface GameConfig {
  libraryId: string;
  themeId: string;
  difficulty: Difficulty;
  duration: number;
  speed: Speed;
  minMatchLength: number;
}

type Difficulty = 1 | 2 | 3;  // 简单、中等、困难
type Speed = 1 | 2 | 3 | 4;   // 超慢、慢、中、快

// 游戏状态
interface GameState {
  status: 'idle' | 'playing' | 'paused' | 'gameover';
  score: number;
  combo: number;
  wpm: number;
  accuracy: number;
  timeRemaining: number;
  currentWord: string | null;
  typedInput: string;
}

// 游戏记录
interface GameRecord {
  id: string;
  config: GameConfig;
  score: number;
  wpm: number;
  accuracy: number;
  maxCombo: number;
  correctCount: number;
  missCount: number;
  timestamp: number;
}
```

### 4.2 默认数据

```typescript
// src/data/defaultLibrary.ts

export const DEFAULT_LIBRARY: WordLibrary = {
  id: 'default',
  name: '默认字库',
  characters: 'abcdefghijklmnopqrstuvwxyz'.split(''),
  isDefault: true,
  createdAt: Date.now(),
  updatedAt: Date.now()
};

// src/data/defaultThemes.ts

export const DEFAULT_THEMES: GameTheme[] = [
  {
    id: 'animals',
    name: '🐸 小动物',
    icon: '🐸',
    color: '#4ade80',
    backgroundImage: '/images/themes/animals-bg.png',
    characterImages: [
      '/images/characters/frog.png',
      '/images/characters/rabbit.png',
      '/images/characters/cat.png',
      '/images/characters/dog.png'
    ],
    vocabulary: ['frog', 'rabbit', 'cat', 'dog', 'bird', 'duck']
  },
  // ... 其他主题
];
```

---

## 5. 状态管理设计

### 5.1 Zustand Store

```typescript
// src/stores/gameStore.ts

import { create } from 'zustand';

interface GameStore {
  // State
  gameState: GameState;
  config: GameConfig | null;

  // Actions
  startGame: (config: GameConfig) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  stopGame: () => void;
  handleKeyPress: (key: string) => void;
  updateTimer: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: {
    status: 'idle',
    score: 0,
    combo: 0,
    wpm: 0,
    accuracy: 0,
    timeRemaining: 0,
    currentWord: null,
    typedInput: ''
  },
  config: null,

  startGame: (config) => {
    // 初始化游戏
  },

  handleKeyPress: (key) => {
    const { gameState, config } = get();
    // 处理按键逻辑
  },

  // ... 其他 actions
}));
```

---

## 6. 存储层设计

### 6.1 存储方案对比

| 方案 | 容量 | 同步 | 适用场景 |
|-----|------|------|---------|
| localStorage | 5MB | 同步 | 简单配置 |
| IndexedDB | 不限 | 异步 | 大量数据 |
| FileSystem | 不限 | 异步 | 文件导出 |

### 6.2  Repository 实现

```typescript
// src/repositories/libraryRepository.ts

import localforage from 'localforage';

const LIBRARY_STORE = 'word_libraries';

export const libraryRepository = {
  async getAll(): Promise<WordLibrary[]> {
    const keys = await localforage.keys();
    const libraries = await Promise.all(
      keys.map(key => localforage.getItem<WordLibrary>(key))
    );
    return libraries.filter((l): l is WordLibrary => l !== null);
  },

  async save(library: WordLibrary): Promise<void> {
    await localforage.setItem(LIBRARY_STORE + '_' + library.id, library);
  },

  async delete(id: string): Promise<void> {
    await localforage.removeItem(LIBRARY_STORE + '_' + id);
  },

  async export(id: string): Promise<string> {
    const library = await localforage.getItem<WordLibrary>(
      LIBRARY_STORE + '_' + id
    );
    return JSON.stringify(library, null, 2);
  },

  async import(json: string): Promise<WordLibrary> {
    const library = JSON.parse(json) as WordLibrary;
    library.id = crypto.randomUUID();
    library.updatedAt = Date.now();
    await this.save(library);
    return library;
  }
};
```

---

## 7. 文件结构

```
game01/
├── public/
│   └── images/
│       ├── characters/      # 卡通形象
│       ├── themes/          # 主题背景
│       └── icons/           # 图标
├── src/
│   ├── components/
│   │   ├── screens/
│   │   │   ├── StartScreen.tsx
│   │   │   ├── ConfigScreen.tsx
│   │   │   ├── GameScreen.tsx
│   │   │   └── ResultScreen.tsx
│   │   ├── game/
│   │   │   ├── FallingLetter.tsx
│   │   │   ├── KeyboardDisplay.tsx
│   │   │   ├── ScoreBoard.tsx
│   │   │   └── CharacterDisplay.tsx
│   │   ├── config/
│   │   │   ├── LibrarySelector.tsx
│   │   │   ├── ThemeSelector.tsx
│   │   │   ├── DifficultySelector.tsx
│   │   │   └── SpeedSelector.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       └── Modal.tsx
│   ├── engine/
│   │   ├── GameEngine.ts
│   │   ├── DifficultyManager.ts
│   │   ├── MatchLogic.ts
│   │   └── ScoreSystem.ts
│   ├── stores/
│   │   ├── gameStore.ts
│   │   ├── configStore.ts
│   │   └── statsStore.ts
│   ├── repositories/
│   │   ├── libraryRepository.ts
│   │   ├── recordRepository.ts
│   │   └── configRepository.ts
│   ├── hooks/
│   │   ├── useGame.ts
│   │   ├── useKeyPress.ts
│   │   └── useTimer.ts
│   ├── types/
│   │   └── index.ts
│   ├── data/
│   │   ├── defaultLibrary.ts
│   │   ├── defaultThemes.ts
│   │   └── vocabulary.ts
│   ├── utils/
│   │   ├── keyboard.ts
│   │   ├── wpm.ts
│   │   └── storage.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── docs/
│   ├── product/
│   │   ├── prd.md
│   │   └── game-design.md
│   └── technical/
│       ├── architecture.md
│       └── data-structures.md
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

---

## 8. 性能优化策略

### 8.1 渲染优化
- 使用 React.memo 缓存组件
- 虚拟列表处理大量下落字母
- requestAnimationFrame 处理动画

### 8.2 输入优化
- 键盘事件防抖 (50ms)
- Web Workers 处理复杂计算
- 预加载主题资源

### 8.3 存储优化
- IndexedDB 存储大量数据
- localStorage 存储配置
- 定期清理过期数据

---

## 9. 开发里程碑

### Phase 1: MVP (2 周)
- [ ] 基础游戏循环
- [ ] 默认字库
- [ ] 简单难度
- [ ] 基础计分

### Phase 2: 完整功能 (2 周)
- [ ] 完整难度系统
- [ ] 主题系统
- [ ] 字库管理
- [ ] 结果统计

### Phase 3: 优化 polish (1 周)
- [ ] 动画效果
- [ ] 音效系统
- [ ] 成就系统
- [ ] PWA 支持
