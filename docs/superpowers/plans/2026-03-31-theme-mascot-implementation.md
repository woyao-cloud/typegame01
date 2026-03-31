# 主题卡通形象 SVG 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将游戏界面中与字母一起显示的气球（🎈）替换为与当前主题一致的卡通形象 SVG，增强游戏的主题一致性和趣味性。

**Architecture:** 
- 创建 `ThemeMascot` React 组件，根据主题动态加载 SVG 图片
- SVG 图片放置在 `public/images/` 目录，使用 `<img>` 标签加载
- 字母显示使用 SVG 内 `<text>` 元素或通过 CSS 叠加方式实现
- 8 个主题各有独立的 SVG 文件和 CSS 动画

**Tech Stack:** TypeScript + React + TailwindCSS + SVG

**Dependencies:**
- 设计文档：`docs/superpowers/specs/2026-03-31-theme-mascot-design.md`
- 主题配置：`src/data/themes.ts`
- 游戏状态：`src/stores/gameStore.ts`
- 类型定义：`src/types/index.ts`

---

## 文件结构总览

### 新建文件
| 文件 | 描述 | 优先级 |
|-----|------|-------|
| `public/images/mascot-animals.svg` | 动物主题 SVG | P0 |
| `public/images/mascot-flowers.svg` | 鲜花主题 SVG | P1 |
| `public/images/mascot-fruits.svg` | 水果主题 SVG | P1 |
| `public/images/mascot-vehicles.svg` | 交通工具 SVG | P1 |
| `public/images/mascot-school.svg` | 学校用品 SVG | P1 |
| `public/images/mascot-family.svg` | 家庭成员 SVG | P1 |
| `public/images/mascot-colors.svg` | 颜色主题 SVG | P1 |
| `public/images/mascot-numbers.svg` | 数字主题 SVG | P1 |
| `src/components/game/ThemeMascot.tsx` | 卡通形象组件 | P0 |

### 修改文件
| 文件 | 修改内容 | 优先级 |
|-----|---------|-------|
| `src/globals.css` | 添加 8 个主题动画 CSS | P0 |
| `src/components/game/GameScreen.tsx` | 集成 ThemeMascot 组件 | P0 |

---

## 任务分解

### Task 1: 创建默认主题（动物）SVG 文件

**Files:**
- Create: `public/images/mascot-animals.svg`

**Design Spec:**
- 画布尺寸：120x120px
- 卡通形象：青蛙抱着字母牌
- 字母位置：胸前正前方（坐标约 x=60, y=85）
- 风格：扁平化卡通，圆润线条，鲜艳色彩
- 颜色：绿色系（与主题一致）

**SVG 模板参考:**
```svg
<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
  <!-- 青蛙身体 -->
  <ellipse cx="60" cy="50" rx="35" ry="30" fill="#4ade80"/>
  <!-- 青蛙眼睛 -->
  <circle cx="45" cy="35" r="10" fill="white"/>
  <circle cx="75" cy="35" r="10" fill="white"/>
  <circle cx="45" cy="35" r="5" fill="black"/>
  <circle cx="75" cy="35" r="5" fill="black"/>
  <!-- 青蛙嘴巴 -->
  <path d="M 45 60 Q 60 70 75 60" stroke="black" stroke-width="2" fill="none"/>
  <!-- 青蛙四肢 -->
  <ellipse cx="30" cy="70" rx="10" ry="15" fill="#4ade80"/>
  <ellipse cx="90" cy="70" rx="10" ry="15" fill="#4ade80"/>
  <!-- 字母牌 -->
  <rect x="40" y="75" width="40" height="30" rx="5" fill="#86efac" stroke="#22c55e" stroke-width="2"/>
  <!-- 字母占位符 - 运行时动态替换 -->
  <text x="60" y="97" text-anchor="middle" font-size="20" font-weight="bold" fill="#065f46" class="letter-display">
    A
  </text>
</svg>
```

- [ ] **Step 1: 创建动物主题 SVG 文件**

使用上述模板创建 `public/images/mascot-animals.svg`，确保：
- SVG 文件有效，可在浏览器中打开查看
- 字母显示区域预留清晰（白色或浅色背景矩形）
- `.letter-display` 类用于运行时动态更新字母

- [ ] **Step 2: 验证 SVG 文件**

Run: 在浏览器中打开 `file:///[项目路径]/public/images/mascot-animals.svg`
Expected: 显示一只绿色青蛙抱着一个白色字母牌

- [ ] **Step 3: 提交**

```bash
git add public/images/mascot-animals.svg
git commit -m "feat: add animal theme mascot SVG"
```

---

### Task 2: 创建其他 7 个主题 SVG 文件

**Files:**
- Create: `public/images/mascot-flowers.svg`
- Create: `public/images/mascot-fruits.svg`
- Create: `public/images/mascot-vehicles.svg`
- Create: `public/images/mascot-school.svg`
- Create: `public/images/mascot-family.svg`
- Create: `public/images/mascot-colors.svg`
- Create: `public/images/mascot-numbers.svg`

**Design Specifications:**

| 主题 | 主色调 | 姿态描述 | 字母位置 |
|-----|--------|---------|---------|
| 鲜花 | 粉色 | 花朵用花瓣托着字母 | 花心位置 |
| 水果 | 红色 | 苹果用叶子托着字母 | 果实前方 |
| 交通工具 | 蓝色 | 汽车用车顶行李架载着字母 | 车顶 |
| 学校用品 | 黄色 | 铅笔用手柄握着字母 | 笔尖前方 |
| 家庭成员 | 橙色 | 人物双手抱着字母 | 胸前 |
| 颜色 | 紫色 | 彩虹两端托着字母 | 彩虹弧心 |
| 数字 | 靛蓝色 | 数字角色手持字母 | 身体前方 |

- [ ] **Step 1: 批量创建 7 个主题 SVG 文件**

每个主题遵循以下规范：
- 画布 120x120px
- 包含 `.letter-display` 文本元素用于动态字母
- 使用主题主色调
- 卡通形象"抱着"或"举着"字母

- [ ] **Step 2: 验证所有 SVG 文件**

Run: 在浏览器中打开每个 SVG 文件
Expected: 每个主题显示独特的卡通形象，字母区域清晰可见

- [ ] **Step 3: 提交**

```bash
git add public/images/mascot-*.svg
git commit -m "feat: add all 8 theme mascot SVGs"
```

---

### Task 3: 添加主题动画 CSS 到 globals.css

**Files:**
- Modify: `src/globals.css`

**CSS 动画代码:**

```css
/* ========== 主题卡通形象动画 ========== */

/* 动物主题 - 跳动动画 */
@keyframes mascot-animal-hop {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.mascot-animal {
  animation: mascot-animal-hop 2s ease-in-out infinite;
}

/* 鲜花主题 - 摇曳动画 */
@keyframes mascot-flower-sway {
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
}

.mascot-flower {
  animation: mascot-flower-sway 2.5s ease-in-out infinite;
}

/* 水果主题 - 旋转动画 */
@keyframes mascot-fruit-spin {
  0%, 100% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(3deg) scale(1.05); }
}

.mascot-fruit {
  animation: mascot-fruit-spin 2s ease-in-out infinite;
}

/* 交通工具主题 - 震动动画 */
@keyframes mascot-vehicle-vibrate {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
}

.mascot-vehicle {
  animation: mascot-vehicle-vibrate 0.5s ease-in-out infinite;
}

/* 学校用品主题 - 摇晃动画 */
@keyframes mascot-school-rock {
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
}

.mascot-school {
  animation: mascot-school-rock 2s ease-in-out infinite;
}

/* 家庭成员主题 - 挥手动画 */
@keyframes mascot-family-wave {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(-5deg); }
}

.mascot-family {
  animation: mascot-family-wave 2s ease-in-out infinite;
}

/* 颜色主题 - 光晕动画 */
@keyframes mascot-color-shift {
  0%, 100% { filter: hue-rotate(0deg); }
  50% { filter: hue-rotate(30deg); }
}

.mascot-color {
  animation: mascot-color-shift 3s ease-in-out infinite;
}

/* 数字主题 - 跳动动画 */
@keyframes mascot-number-bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
}

.mascot-number {
  animation: mascot-number-bounce 1.5s ease-in-out infinite;
}

/* 字母显示样式 */
.letter-display {
  font-family: 'Microsoft YaHei', sans-serif;
  font-size: 24px;
  font-weight: bold;
}

.letter-display.typed {
  fill: #9CA3AF;
  opacity: 0.5;
}

.letter-display.pending {
  fill: #FDE047;
  filter: drop-shadow(0 0 2px rgba(253, 224, 71, 0.8));
}
```

- [ ] **Step 1: 将 CSS 动画代码添加到 globals.css 末尾**

编辑 `src/globals.css`，在文件末尾追加上述 CSS 代码

- [ ] **Step 2: 验证 CSS 语法**

Run: `npm run build`
Expected: 构建成功，无 CSS 语法错误

- [ ] **Step 3: 提交**

```bash
git add src/globals.css
git commit -m "feat: add 8 theme mascot animations CSS"
```

---

### Task 4: 创建 ThemeMascot 组件

**Files:**
- Create: `src/components/game/ThemeMascot.tsx`
- Test: 在 GameScreen 中集成测试

**Component Spec:**

```typescript
import React, { useState } from 'react';
import { ActiveWord, ThemeId } from '@/types';
import { getThemeById } from '@/data/themes';

interface ThemeMascotProps {
  themeId: ThemeId;
  word: ActiveWord;
}

/**
 * 主题卡通形象组件
 * 根据当前主题显示对应的 SVG 卡通形象，字母叠加显示
 */
export function ThemeMascot({ themeId, word }: ThemeMascotProps) {
  const [svgError, setSvgError] = useState(false);
  const theme = getThemeById(themeId);
  
  // 降级策略：SVG 加载失败时显示 emoji
  if (svgError || !theme) {
    return (
      <span className="text-6xl opacity-90 drop-shadow-lg">
        {theme?.mascot || '🎈'}
      </span>
    );
  }
  
  // 计算已输入和待输入部分
  const typedText = word.text.slice(0, word.typedIndex);
  const pendingText = word.text.slice(word.typedIndex);
  
  // 主题动画类名映射
  const themeAnimationClass = `mascot-${themeId}`;
  
  return (
    <div className={`relative ${themeAnimationClass}`}>
      {/* SVG 形象 */}
      <img
        src={`/images/mascot-${themeId}.svg`}
        alt={`${theme.name} mascot`}
        className="w-20 h-20 drop-shadow-lg"
        onError={() => setSvgError(true)}
      />
      
      {/* 字母叠加层 - 绝对定位在 SVG 上方 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none"
           style={{ paddingTop: '50px' }}>
        <div className="flex items-baseline gap-0.5 font-mono font-bold text-2xl">
          {/* 已输入部分 - 浅灰色半透明 */}
          {typedText && (
            <span className="text-gray-400 opacity-40 drop-shadow-xl">
              {typedText}
            </span>
          )}
          {/* 待输入部分 - 黄色高亮 */}
          {pendingText && (
            <span className="text-yellow-300 drop-shadow-xl star-twinkle-bright">
              {pendingText}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 1: 创建 ThemeMascot.tsx 组件文件**

将上述代码写入 `src/components/game/ThemeMascot.tsx`

- [ ] **Step 2: 验证 TypeScript 类型**

Run: `npm run build`
Expected: 无 TypeScript 类型错误

- [ ] **Step 3: 提交**

```bash
git add src/components/game/ThemeMascot.tsx
git commit -m "feat: add ThemeMascot component with SVG and fallback"
```

---

### Task 5: 修改 GameScreen 集成 ThemeMascot 组件

**Files:**
- Modify: `src/components/game/GameScreen.tsx:195-230`

**当前代码（气球 emoji 实现）:**
```tsx
{/* 卡通气球容器 */}
<div className="relative">
  {/* 气球绳子 */}
  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-gradient-to-b from-sky-400 to-transparent opacity-60"></div>
  {/* 气球 emoji 背景 */}
  <span className="text-6xl opacity-90 drop-shadow-lg transform hover:scale-110 transition-transform">🎈</span>
  {/* 字母叠加在气球上方 */}
  <div className="absolute inset-0 flex items-center justify-center">
    {/* 已输入部分 - 浅灰色 + 半透明渐隐效果 */}
    {word.text.slice(0, word.typedIndex) && (
      <span className="text-5xl font-black text-gray-400 opacity-40 drop-shadow-xl">
        {word.text.slice(0, word.typedIndex)}
      </span>
    )}
    {/* 待输入部分 - 黄色高亮 */}
    {word.text.slice(word.typedIndex) && (
      <span className="text-5xl font-black text-yellow-200 drop-shadow-xl star-twinkle-bright">
        {word.text.slice(word.typedIndex)}
      </span>
    )}
  </div>
</div>
```

**修改后代码（ThemeMascot 组件）:**
```tsx
import { ThemeMascot } from './ThemeMascot';

// ... 在轨道渲染内部 ...
{[0, 1, 2, 3, 4].map((trackIndex) => (
  <div
    key={trackIndex}
    className={`flex-1 border-r border-sky-300/30 last:border-r-0 relative track-highlight rounded-lg`}
  >
    {/* 轨道起点标记 */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 text-lg opacity-50">🏁</div>

    {/* 轨道上的单词 - 使用 ThemeMascot 组件 */}
    {(gameState.activeWords || [])
      .filter((word) => word.track === trackIndex)
      .map((word) => (
        <div
          key={word.id}
          className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center falling-letter-float"
          style={{
            top: `${(word.progress / 100) * 85}%`,
          }}
        >
          <ThemeMascot themeId={themeId} word={word} />
        </div>
      ))}
  </div>
))}
```

- [ ] **Step 1: 在 GameScreen.tsx 顶部添加 ThemeMascot 导入**

```typescript
import { ThemeMascot } from './ThemeMascot';
```

- [ ] **Step 2: 替换气球 emoji 代码为 ThemeMascot 组件**

找到轨道渲染部分（约 195-230 行），将气球 emoji 容器替换为：
```tsx
<ThemeMascot themeId={themeId} word={word} />
```

- [ ] **Step 3: 移除不再需要的气球绳子代码**

删除气球绳子的 `<div>` 元素（原 209 行）

- [ ] **Step 4: 验证构建**

Run: `npm run build`
Expected: 构建成功，无 TypeScript 错误

- [ ] **Step 5: 提交**

```bash
git add src/components/game/GameScreen.tsx
git commit -m "feat: integrate ThemeMascot component replacing balloon emoji"
```

---

### Task 6: 测试验证

**Files:**
- Test: 浏览器手动测试

**测试场景:**

| 测试项 | 操作步骤 | 预期结果 |
|-------|---------|---------|
| 默认主题显示 | 启动游戏，不更改主题 | 显示动物主题（青蛙）SVG |
| 主题切换 | 在配置界面切换不同主题 | 游戏界面卡通形象随主题变化 |
| SVG 降级 | 临时删除一个 SVG 文件 | 显示对应主题的 emoji |
| 字母匹配 | 输入字母 | 已输入部分变浅灰色，待输入部分黄色高亮 |
| 多字母单词 | 选择单词模式 | 完整单词显示在卡通形象上 |
| 动画效果 | 观察下落字母 | 每个主题有不同动画效果 |
| 性能测试 | 同时多个字母下落 | 动画流畅，无明显卡顿 |

- [ ] **Step 1: 启动开发服务器**

Run: `npm run dev`
Expected: 服务器启动，显示本地 URL

- [ ] **Step 2: 浏览器测试默认主题**

打开浏览器访问开发服务器 URL
Expected: 游戏界面显示动物主题 SVG（青蛙）

- [ ] **Step 3: 测试主题切换**

在配置界面切换到其他主题（如鲜花、水果等）
Expected: 游戏界面卡通形象切换为对应主题 SVG

- [ ] **Step 4: 测试字母匹配显示**

开始游戏，输入字母
Expected: 已输入字母变浅灰色半透明，待输入字母黄色高亮

- [ ] **Step 5: 测试 SVG 降级**

临时重命名一个 SVG 文件，刷新页面
Expected: 显示对应主题的 emoji（如🌻）

- [ ] **Step 6: 记录测试结果**

在计划文档末尾添加测试结果记录

---

## 依赖关系图

```
Task 1 (动物 SVG) ─┬─> Task 2 (其他 SVG) ─┬─> Task 3 (CSS 动画)
                   │                       │
                   └───────────────────────┘
                              ↓
                    Task 4 (ThemeMascot 组件)
                              ↓
                    Task 5 (GameScreen 集成)
                              ↓
                    Task 6 (测试验证)
```

---

## 执行策略

### 推荐：Subagent-Driven Execution

每个任务由独立 subagent 执行，任务间进行 review：

1. **Task 1-2**: 设计 subagent 创建 SVG 资源
2. **Task 3**: CSS subagent 添加动画
3. **Task 4**: React subagent 创建组件
4. **Task 5**: 集成 subagent 修改 GameScreen
5. **Task 6**: 手动测试验证

### 备选：Inline Execution

在当前会话中按顺序执行所有任务。

---

## 风险与缓解

| 风险 | 影响 | 缓解措施 |
|-----|------|---------|
| SVG 设计质量不佳 | 中 | 使用 AI 生成工具，或先用 emoji 占位 |
| 动画性能问题 | 中 | 使用 CSS transform，避免重排 |
| 组件集成问题 | 低 | 保留原有气球代码作为注释备份 |
| TypeScript 类型错误 | 低 | 确保导入正确的类型定义 |

---

## 验收标准

### 功能验收
- [ ] 8 个主题各有独立的 SVG 卡通形象
- [ ] 卡通形象与字母一起下落
- [ ] 字母清晰可见，可读性良好
- [ ] 已输入字母显示浅灰色半透明效果
- [ ] 待输入字母显示黄色高亮效果
- [ ] SVG 加载失败时降级到 emoji 显示

### 视觉验收
- [ ] SVG 形象风格统一，符合儿童审美
- [ ] 每个主题动画效果独特且明显
- [ ] 动画流畅，无卡顿
- [ ] 下落过程保持稳定，无抖动

### 性能验收
- [ ] SVG 文件大小 < 20KB/个
- [ ] 动画帧率 ≥ 55fps
- [ ] 无明显内存泄漏
- [ ] 首次加载：WiFi 下 < 1 秒

---

## 变更记录

| 版本 | 日期 | 变更内容 |
|-----|------|---------|
| v1.0 | 2026-03-31 | 初始实现计划 |
