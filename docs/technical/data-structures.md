# 数据结构文档

## 儿童打字游戏

---

## 1. 核心数据结构

### 1.1 字库 (WordLibrary)

```typescript
interface WordLibrary {
  /** 唯一标识符 (UUID) */
  id: string;

  /** 字库名称，如 "默认字库"、"一年级词汇" */
  name: string;

  /** 字符列表，如 ["a", "b", "c", ...] */
  characters: string[];

  /** 是否为系统默认字库 */
  isDefault: boolean;

  /** 创建时间戳 */
  createdAt: number;

  /** 最后更新时间戳 */
  updatedAt: number;

  /** 字库描述 (可选) */
  description?: string;

  /** 适用年级 (可选) */
  gradeLevel?: 1 | 2;
}
```

**存储键名**: `library_{id}`

**示例数据**:
```json
{
  "id": "lib_001",
  "name": "默认字库",
  "characters": ["a", "b", "c", "d", "e", "f", "g"],
  "isDefault": true,
  "createdAt": 1711785600000,
  "updatedAt": 1711785600000
}
```

---

### 1.2 游戏主题 (GameTheme)

```typescript
interface GameTheme {
  /** 主题 ID */
  id: string;

  /** 主题名称，如 "🐸 小动物" */
  name: string;

  /** 主题图标 (emoji) */
  icon: string;

  /** 主题主色调 (hex 颜色) */
  color: string;

  /** 背景图片 URL */
  backgroundImage: string;

  /** 卡通形象图片 URLs */
  characterImages: string[];

  /** 主题词汇列表 */
  vocabulary: string[];

  /** 适用年级 */
  gradeLevel?: 1 | 2;

  /** 是否已解锁 */
  isUnlocked: boolean;
}
```

**示例数据**:
```json
{
  "id": "animals",
  "name": "🐸 小动物",
  "icon": "🐸",
  "color": "#4ade80",
  "backgroundImage": "/images/themes/animals-bg.png",
  "characterImages": [
    "/images/characters/frog.png",
    "/images/characters/rabbit.png",
    "/images/characters/cat.png",
    "/images/characters/dog.png"
  ],
  "vocabulary": ["frog", "rabbit", "cat", "dog", "bird"],
  "gradeLevel": 1,
  "isUnlocked": true
}
```

---

### 1.3 游戏配置 (GameConfig)

```typescript
interface GameConfig {
  /** 选中的字库 ID */
  libraryId: string;

  /** 选中的主题 ID */
  themeId: string;

  /** 难度等级：1=简单，2=中等，3=困难 */
  difficulty: Difficulty;

  /** 游戏时长 (秒) */
  duration: number;

  /** 速度等级：1=超慢，2=慢，3=中，4=快 */
  speed: Speed;

  /** 最小匹配字母数 */
  minMatchLength: number;

  /** 是否启用音效 */
  soundEnabled: boolean;

  /** 是否启用动画 */
  animationEnabled: boolean;
}

type Difficulty = 1 | 2 | 3;
type Speed = 1 | 2 | 3 | 4;
```

**配置预设**:
```typescript
const PRESET_CONFIGS = {
  beginner: {
    difficulty: 1 as Difficulty,
    speed: 2 as Speed,
    minMatchLength: 1,
    duration: 120 // 2 分钟
  },
  intermediate: {
    difficulty: 2 as Difficulty,
    speed: 3 as Speed,
    minMatchLength: 2,
    duration: 300 // 5 分钟
  },
  advanced: {
    difficulty: 3 as Difficulty,
    speed: 4 as Speed,
    minMatchLength: 4,
    duration: 600 // 10 分钟
  }
};
```

---

### 1.4 游戏状态 (GameState)

```typescript
interface GameState {
  /** 游戏状态 */
  status: GameStatus;

  /** 当前得分 */
  score: number;

  /** 当前连击数 */
  combo: number;

  /** 最大连击数 */
  maxCombo: number;

  /** 每分钟单词数 (实时计算) */
  wpm: number;

  /** 正确率 (0-1) */
  accuracy: number;

  /** 剩余时间 (秒) */
  timeRemaining: number;

  /** 当前目标单词 */
  currentWord: string | null;

  /** 已输入的字符 */
  typedInput: string;

  /** 正确输入次数 */
  correctCount: number;

  /** 错误输入次数 */
  errorCount: number;

  /** 超时未输入次数 */
  missCount: number;

  /** 当前下落的字母列表 */
  fallingLetters: FallingLetter[];
}

type GameStatus = 'idle' | 'playing' | 'paused' | 'gameover';

interface FallingLetter {
  id: string;
  char: string;
  x: number;        // 横坐标 (0-100%)
  y: number;        // 纵坐标 (0-100%)
  speed: number;    // 下落速度
  createdAt: number;
}
```

---

### 1.5 游戏记录 (GameRecord)

```typescript
interface GameRecord {
  /** 记录 ID */
  id: string;

  /** 游戏配置快照 */
  config: GameConfig;

  /** 最终得分 */
  score: number;

  /** 每分钟单词数 */
  wpm: number;

  /** 正确率 (0-1) */
  accuracy: number;

  /** 最大连击数 */
  maxCombo: number;

  /** 正确输入次数 */
  correctCount: number;

  /** 错误输入次数 */
  errorCount: number;

  /** 超时次数 */
  missCount: number;

  /** 游戏时间戳 */
  timestamp: number;

  /** 游戏时长 (秒) */
  actualDuration: number;
}
```

**存储键名**: `record_{id}`

**索引**: 按 `timestamp` 降序排列

---

## 2. 键盘数据结构

### 2.1 键盘布局映射

```typescript
// src/utils/keyboard.ts

interface KeyboardLayout {
  rows: string[][];
  keyPositions: Map<string, { row: number; col: number }>;
  handZones: {
    left: string[];
    right: string[];
  };
}

export const QWERTY_LAYOUT: KeyboardLayout = {
  rows: [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm']
  ],
  keyPositions: new Map([
    ['q', { row: 0, col: 0 }],
    ['w', { row: 0, col: 1 }],
    ['e', { row: 0, col: 2 }],
    // ... 其他键位
  ]),
  handZones: {
    left: ['q', 'w', 'e', 'r', 't', 'a', 's', 'd', 'f', 'g', 'z', 'x', 'c', 'v', 'b'],
    right: ['y', 'u', 'i', 'o', 'p', 'h', 'j', 'k', 'l', 'n', 'm']
  }
};
```

### 2.2 相邻键计算

```typescript
interface AdjacentKeys {
  up: string[];
  down: string[];
  left: string[];
  right: string[];
  all: string[];
}

function getAdjacentKeys(char: string): AdjacentKeys {
  const pos = QWERTY_LAYOUT.keyPositions.get(char.toLowerCase());
  if (!pos) return { up: [], down: [], left: [], right: [], all: [] };

  const result: AdjacentKeys = {
    up: [],
    down: [],
    left: [],
    right: [],
    all: []
  };

  // 上方相邻
  if (pos.row > 0) {
    const aboveRow = QWERTY_LAYOUT.rows[pos.row - 1];
    if (aboveRow[pos.col]) result.up.push(aboveRow[pos.col]);
    if (aboveRow[pos.col - 1]) result.up.push(aboveRow[pos.col - 1]);
    if (aboveRow[pos.col + 1]) result.up.push(aboveRow[pos.col + 1]);
  }

  // 下方相邻
  if (pos.row < 2) {
    const belowRow = QWERTY_LAYOUT.rows[pos.row + 1];
    if (belowRow[pos.col]) result.down.push(belowRow[pos.col]);
    if (belowRow[pos.col - 1]) result.down.push(belowRow[pos.col - 1]);
    if (belowRow[pos.col + 1]) result.down.push(belowRow[pos.col + 1]);
  }

  // 左侧相邻
  if (pos.col > 0) {
    result.left.push(QWERTY_LAYOUT.rows[pos.row][pos.col - 1]);
  }

  // 右侧相邻
  if (pos.col < QWERTY_LAYOUT.rows[pos.row].length - 1) {
    result.right.push(QWERTY_LAYOUT.rows[pos.row][pos.col + 1]);
  }

  result.all = [...result.up, ...result.down, ...result.left, ...result.right];

  return result;
}
```

---

## 3. 词汇数据

### 3.1 年级词汇表

```typescript
// src/data/vocabulary.ts

interface VocabularyItem {
  word: string;
  translation: string;
  gradeLevel: 1 | 2;
  themeId: string;
  frequency: number; // 出现频率权重
}

export const GRADE_1_VOCABULARY: VocabularyItem[] = [
  // 小动物主题
  { word: 'frog', translation: '青蛙', gradeLevel: 1, themeId: 'animals', frequency: 10 },
  { word: 'cat', translation: '猫', gradeLevel: 1, themeId: 'animals', frequency: 10 },
  { word: 'dog', translation: '狗', gradeLevel: 1, themeId: 'animals', frequency: 10 },
  { word: 'rabbit', translation: '兔子', gradeLevel: 1, themeId: 'animals', frequency: 8 },
  { word: 'bird', translation: '鸟', gradeLevel: 1, themeId: 'animals', frequency: 8 },
  { word: 'duck', translation: '鸭子', gradeLevel: 1, themeId: 'animals', frequency: 8 },

  // 鲜花主题
  { word: 'flower', translation: '花', gradeLevel: 1, themeId: 'flowers', frequency: 10 },
  { word: 'rose', translation: '玫瑰', gradeLevel: 1, themeId: 'flowers', frequency: 8 },
  { word: 'tulip', translation: '郁金香', gradeLevel: 1, themeId: 'flowers', frequency: 6 },

  // 水果主题
  { word: 'apple', translation: '苹果', gradeLevel: 1, themeId: 'fruits', frequency: 10 },
  { word: 'banana', translation: '香蕉', gradeLevel: 1, themeId: 'fruits', frequency: 10 },
  { word: 'orange', translation: '橙子', gradeLevel: 1, themeId: 'fruits', frequency: 8 },
  { word: 'grape', translation: '葡萄', gradeLevel: 1, themeId: 'fruits', frequency: 8 },

  // 交通工具主题
  { word: 'car', translation: '汽车', gradeLevel: 1, themeId: 'vehicles', frequency: 10 },
  { word: 'bus', translation: '公交车', gradeLevel: 1, themeId: 'vehicles', frequency: 10 },
  { word: 'bike', translation: '自行车', gradeLevel: 1, themeId: 'vehicles', frequency: 8 },
  { word: 'train', translation: '火车', gradeLevel: 1, themeId: 'vehicles', frequency: 8 }
];

export const GRADE_2_VOCABULARY: VocabularyItem[] = [
  // 学校用品主题
  { word: 'pen', translation: '钢笔', gradeLevel: 2, themeId: 'school', frequency: 10 },
  { word: 'book', translation: '书', gradeLevel: 2, themeId: 'school', frequency: 10 },
  { word: 'ruler', translation: '尺子', gradeLevel: 2, themeId: 'school', frequency: 8 },
  { word: 'bag', translation: '书包', gradeLevel: 2, themeId: 'school', frequency: 8 },

  // 家庭成员主题
  { word: 'mom', translation: '妈妈', gradeLevel: 2, themeId: 'family', frequency: 10 },
  { word: 'dad', translation: '爸爸', gradeLevel: 2, themeId: 'family', frequency: 10 },
  { word: 'sister', translation: '姐妹', gradeLevel: 2, themeId: 'family', frequency: 8 },
  { word: 'brother', translation: '兄弟', gradeLevel: 2, themeId: 'family', frequency: 8 },

  // 颜色主题
  { word: 'red', translation: '红色', gradeLevel: 2, themeId: 'colors', frequency: 10 },
  { word: 'blue', translation: '蓝色', gradeLevel: 2, themeId: 'colors', frequency: 10 },
  { word: 'green', translation: '绿色', gradeLevel: 2, themeId: 'colors', frequency: 10 },
  { word: 'yellow', translation: '黄色', gradeLevel: 2, themeId: 'colors', frequency: 10 },

  // 数字主题
  { word: 'one', translation: '一', gradeLevel: 2, themeId: 'numbers', frequency: 10 },
  { word: 'two', translation: '二', gradeLevel: 2, themeId: 'numbers', frequency: 10 },
  { word: 'three', translation: '三', gradeLevel: 2, themeId: 'numbers', frequency: 10 },
  { word: 'four', translation: '四', gradeLevel: 2, themeId: 'numbers', frequency: 10 }
];
```

---

## 4. 统计数据结构

### 4.1 用户统计

```typescript
interface UserStats {
  /** 总游戏局数 */
  totalGames: number;

  /** 总游戏时长 (秒) */
  totalPlayTime: number;

  /** 平均 WPM */
  averageWpm: number;

  /** 平均正确率 */
  averageAccuracy: number;

  /** 最高得分 */
  highScore: number;

  /** 最大连击记录 */
  maxComboRecord: number;

  /** 获得的成就 IDs */
  achievements: string[];

  /** 连续登录天数 */
  streakDays: number;

  /** 最后登录时间 */
  lastLoginDate: string; // YYYY-MM-DD

  /** 各主题游戏次数 */
  themeStats: Record<string, ThemeStat>;

  /** 最近 30 天游戏记录 */
  dailyStats: DailyStat[];
}

interface ThemeStat {
  playCount: number;
  bestScore: number;
  bestWpm: number;
}

interface DailyStat {
  date: string; // YYYY-MM-DD
  playCount: number;
  totalScore: number;
}
```

### 4.2 WPM 计算公式

```typescript
// WPM = (正确输入的字符数 / 5) / 游戏时长 (分钟)
function calculateWPM(correctChars: number, durationSeconds: number): number {
  if (durationSeconds <= 0) return 0;

  const words = correctChars / 5; // 标准单词长度为 5 字符
  const minutes = durationSeconds / 60;

  return Math.round(words / minutes);
}

// 正确率 = 正确输入 / (正确输入 + 错误输入)
function calculateAccuracy(correct: number, errors: number): number {
  const total = correct + errors;
  if (total === 0) return 1;

  return Math.round((correct / total) * 100) / 100;
}
```

---

## 5. 成就数据结构

### 5.1 成就定义

```typescript
interface Achievement {
  /** 成就 ID */
  id: string;

  /** 成就名称 */
  name: string;

  /** 成就描述 */
  description: string;

  /** 成就图标 */
  icon: string;

  /** 达成条件类型 */
  conditionType: AchievementCondition;

  /** 达成条件阈值 */
  threshold: number;

  /** 成就稀有度 */
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

type AchievementCondition =
  | 'total_games'       // 总游戏局数
  | 'high_score'        // 最高得分
  | 'accuracy'          // 正确率
  | 'wpm'               // WPM 速度
  | 'combo'             // 连击数
  | 'streak_days'       // 连续登录
  | 'theme_master';     // 主题精通

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_game',
    name: '第一次尝试',
    description: '完成第一局游戏',
    icon: '🏅',
    conditionType: 'total_games',
    threshold: 1,
    rarity: 'common'
  },
  {
    id: 'sharpshooter',
    name: '神枪手',
    description: '单局正确率达到 100%',
    icon: '🎯',
    conditionType: 'accuracy',
    threshold: 100,
    rarity: 'rare'
  },
  {
    id: 'speedster',
    name: '快手王',
    description: 'WPM 超过 30',
    icon: '⚡',
    conditionType: 'wpm',
    threshold: 30,
    rarity: 'rare'
  },
  {
    id: 'combo_master',
    name: '连击大师',
    description: '单局连击达到 50',
    icon: '🔥',
    conditionType: 'combo',
    threshold: 50,
    rarity: 'epic'
  },
  {
    id: 'dedicated',
    name: '坚持就是胜利',
    description: '连续登录 7 天',
    icon: '📅',
    conditionType: 'streak_days',
    threshold: 7,
    rarity: 'rare'
  },
  {
    id: 'word_master',
    name: '单词大师',
    description: '完成所有主题的游戏',
    icon: '🎓',
    conditionType: 'theme_master',
    threshold: 8,
    rarity: 'legendary'
  }
];
```

---

## 6. 数据持久化策略

### 6.1 存储分层

| 数据类型 | 存储方案 | 更新频率 | 容量估算 |
|---------|---------|---------|---------|
| 字库数据 | IndexedDB | 低 | < 100KB |
| 游戏记录 | IndexedDB | 高 | < 1MB |
| 用户配置 | localStorage | 中 | < 10KB |
| 统计数据 | IndexedDB | 中 | < 50KB |
| 成就进度 | IndexedDB | 中 | < 10KB |

### 6.2 数据清理策略

```typescript
// 保留最近 1000 条游戏记录
const MAX_RECORDS = 1000;

async function cleanupOldRecords(): Promise<void> {
  const records = await recordRepository.getAll();

  if (records.length > MAX_RECORDS) {
    // 按时间排序，删除最早的记录
    const sorted = records.sort((a, b) => b.timestamp - a.timestamp);
    const toDelete = sorted.slice(MAX_RECORDS);

    for (const record of toDelete) {
      await recordRepository.delete(record.id);
    }
  }
}
```

### 6.3 数据备份/恢复

```typescript
// 导出所有数据
async function exportAllData(): Promise<string> {
  const data = {
    version: '1.0',
    exportDate: Date.now(),
    libraries: await libraryRepository.getAll(),
    records: await recordRepository.getAll(),
    stats: await statsRepository.get(),
    achievements: await achievementRepository.getProgress()
  };

  return JSON.stringify(data, null, 2);
}

// 导入数据
async function importAllData(json: string): Promise<void> {
  const data = JSON.parse(json);

  // 验证数据格式
  // 导入各模块数据
  // 更新本地存储
}
```

---

## 7. 键盘相邻性查询表

### 7.1 预计算相邻表

```typescript
// 预计算的键盘相邻表 (简单难度使用)
export const ADJACENCY_MAP: Record<string, string[]> = {
  'q': ['w', 'a'],
  'w': ['q', 'e', 'a', 's'],
  'e': ['w', 'r', 's', 'd'],
  'r': ['e', 't', 'd', 'f'],
  't': ['r', 'y', 'f', 'g'],
  'y': ['t', 'u', 'g', 'h'],
  'u': ['y', 'i', 'h', 'j'],
  'i': ['u', 'o', 'j', 'k'],
  'o': ['i', 'p', 'k', 'l'],
  'p': ['o', 'l'],
  'a': ['q', 'w', 's', 'z'],
  's': ['a', 'w', 'e', 'd', 'z', 'x'],
  'd': ['s', 'e', 'r', 'f', 'x', 'c'],
  'f': ['d', 'r', 't', 'g', 'c', 'v'],
  'g': ['f', 't', 'y', 'h', 'v', 'b'],
  'h': ['g', 'y', 'u', 'j', 'b', 'n'],
  'j': ['h', 'u', 'i', 'k', 'n', 'm'],
  'k': ['j', 'i', 'o', 'l', 'm'],
  'l': ['k', 'o', 'p'],
  'z': ['a', 's', 'x'],
  'x': ['z', 's', 'd', 'c'],
  'c': ['x', 'd', 'f', 'v'],
  'v': ['c', 'f', 'g', 'b'],
  'b': ['v', 'g', 'h', 'n'],
  'n': ['b', 'h', 'j', 'm'],
  'm': ['n', 'j', 'k']
};
```

---

## 8. 速度配置表

```typescript
// 速度配置 (字母停留时间，单位：毫秒)
export const SPEED_CONFIG: Record<number, {
  fallDuration: number;
  spawnInterval: number;
  name: string;
  icon: string;
}> = {
  1: {
    fallDuration: 30000,  // 30 秒
    spawnInterval: 5000,  // 5 秒生成一个
    name: '超慢',
    icon: '🐌'
  },
  2: {
    fallDuration: 20000,  // 20 秒
    spawnInterval: 3000,  // 3 秒生成一个
    name: '慢',
    icon: '🚶'
  },
  3: {
    fallDuration: 10000,  // 10 秒
    spawnInterval: 2000,  // 2 秒生成一个
    name: '中',
    icon: '🏃'
  },
  4: {
    fallDuration: 5000,   // 5 秒
    spawnInterval: 1000,  // 1 秒生成一个
    name: '快',
    icon: '🚀'
  }
};
```

---

## 9. 难度配置表

```typescript
// 难度配置
export const DIFFICULTY_CONFIG: Record<number, {
  stars: string;
  name: string;
  charRange: 'adjacent' | 'sameHand' | 'fullKeyboard';
  minMatchLength: number;
  description: string;
}> = {
  1: {
    stars: '⭐',
    name: '简单',
    charRange: 'adjacent',
    minMatchLength: 1,
    description: '只出现相邻字母，适合初学者'
  },
  2: {
    stars: '⭐⭐',
    name: '中等',
    charRange: 'sameHand',
    minMatchLength: 2,
    description: '出现同手区字母，需要一定基础'
  },
  3: {
    stars: '⭐⭐⭐',
    name: '困难',
    charRange: 'fullKeyboard',
    minMatchLength: 3,
    description: '全键盘随机，挑战极限'
  }
};
```
