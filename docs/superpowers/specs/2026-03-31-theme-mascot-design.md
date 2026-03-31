# 主题卡通形象设计文档

## 变更概述

将游戏界面中与字母一起显示的气球（🎈）替换为与当前主题一致的卡通形象 SVG，增强游戏的主题一致性和趣味性。

## 设计目标

1. **主题一致性**：卡通形象与用户选择的主题保持一致
2. **视觉吸引力**：使用精美的 SVG 图形替代简单 emoji
3. **趣味动画**：每个主题有独特的动画效果，增强儿童游戏体验
4. **字母可读性**：确保字母清晰可见，不影响游戏核心玩法

---

## 架构设计

### 组件结构

```
GameScreen
  └─ ThemeMascot (新建组件)
      ├─ SVG 形象 (根据主题动态加载)
      └─ 字母显示区 (叠加在 SVG 上方)
```

### 文件结构

```
public/
└── images/
    ├── mascot-animals.svg
    ├── mascot-flowers.svg
    ├── mascot-fruits.svg
    ├── mascot-vehicles.svg
    ├── mascot-school.svg
    ├── mascot-family.svg
    ├── mascot-colors.svg
    └── mascot-numbers.svg

src/
├── components/
│   └── game/
│       └── ThemeMascot.tsx (新建)
├── styles/
│   └── globals.css (追加主题动画 CSS)
└── data/
    └── themes.ts (已有 mascotImage 字段)
```

---

## SVG 设计规范

### 尺寸规范

| 属性 | 值 |
|-----|-----|
| SVG 画布尺寸 | 120x120px |
| 卡通形象主体 | 80x80px |
| 字母显示区域 | 40x40px（位于形象手部/前方） |
| 安全边距 | 10px |

### 设计风格

- **风格**：扁平化卡通风格
- **线条**：圆润柔和，无尖锐边角
- **色彩**：鲜艳明亮，符合儿童审美
- **表情**：友好微笑，大眼睛

### 姿态设计

每个主题的卡通形象设计为"抱着"或"举着"字母的姿态：

| 主题 | 姿态描述 | 字母位置 |
|-----|---------|---------|
| 动物 | 青蛙双手举着字母牌 | 胸前正前方 |
| 鲜花 | 花朵用花瓣托着字母 | 花心位置 |
| 水果 | 苹果用叶子托着字母 | 果实前方 |
| 交通工具 | 汽车用车顶行李架载着字母 | 车顶 |
| 学校用品 | 铅笔用手柄握着字母 | 笔尖前方 |
| 家庭成员 | 人物双手抱着字母 | 胸前 |
| 颜色 | 彩虹两端托着字母 | 彩虹弧心 |
| 数字 | 数字角色手持字母 | 身体前方 |

### SVG 实现方案

使用 SVG `<foreignObject>` 嵌入 HTML 字母，或使用动态 `useColor` 属性：

```svg
<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
  <!-- 卡通形象主体 -->
  <g class="mascot-body">
    <!-- 形象设计 -->
  </g>
  <!-- 字母显示区 - 使用 SVG text 元素 -->
  <text x="60" y="85" text-anchor="middle" 
        class="letter-display" 
        style="font-size: 24px; font-weight: bold;">
    {letter}
  </text>
</svg>
```

---

## 主题特色动画

### 动画规范

| 主题 | 动画名称 | 效果描述 | CSS 类名 |
|-----|---------|---------|---------|
| 动物 | `mascot-animal-hop` | 轻微上下跳动，耳朵摆动 | `mascot-animal` |
| 鲜花 | `mascot-flower-sway` | 左右摇曳，花瓣旋转 | `mascot-flower` |
| 水果 | `mascot-fruit-spin` | 轻微旋转，光泽闪烁 | `mascot-fruit` |
| 交通工具 | `mascot-vehicle-vibrate` | 轻微震动，尾气效果 | `mascot-vehicle` |
| 学校用品 | `mascot-school-rock` | 铅笔摇晃，书本翻页 | `mascot-school` |
| 家庭成员 | `mascot-family-wave` | 手臂挥手动作 | `mascot-family` |
| 颜色 | `mascot-color-shift` | 彩虹光晕，色彩变换 | `mascot-color` |
| 数字 | `mascot-number-bounce` | 数字跳动效果 | `mascot-number` |

### 动画参数

所有主题动画共享以下基础参数：

| 属性 | 值 |
|-----|-----|
| 动画时长 | 2-3 秒循环 |
| 缓动函数 | ease-in-out |
| 下落基础动画 | 保留现有 `falling-letter-float` |

### CSS 动画实现示例

```css
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
```

---

## 组件实现

### ThemeMascot 组件接口

```typescript
import { ActiveWord, ThemeId } from '@/types';

interface ThemeMascotProps {
  themeId: ThemeId;      // 当前主题 ID
  word: ActiveWord;      // 活跃单词对象（包含 text, typedIndex, progress, track）
}
```

### 组件实现要点

1. 根据 `themeId` 动态加载对应 SVG（使用 `import()` 或 `<img>` 标签）
2. SVG 内使用 `<text>` 元素显示字母
3. 字母颜色根据 `typedIndex` 动态变化：
   - 已输入部分：`#9CA3AF` (gray-400), `opacity: 0.5`
   - 待输入部分：`#FDE047` (yellow-300), 带发光效果
4. 应用主题对应的 CSS 动画类
5. 下落位置由 `progress` 控制，复用现有逻辑

### 降级策略（错误处理）

```typescript
const [svgError, setSvgError] = useState(false);

if (svgError) {
  // 降级到 emoji 显示
  return (
    <span className="text-6xl">{currentTheme?.mascot}</span>
  );
}

return (
  <img
    src={`/images/mascot-${themeId}.svg`}
    onError={() => setSvgError(true)}
    className={`mascot-${themeCategory}`}
  />
);
```

### 使用示例

```tsx
<ThemeMascot
  themeId={themeId}
  word={word}
/>
```

---

## 数据流

```
useConfigStore (themeId)
       ↓
GameScreen (读取主题 + activeWords)
       ↓
ThemeMascot (渲染 SVG + 字母)
       ↓
SVG 形象 + 主题动画 CSS
```

---

## 多字母单词处理

当前游戏支持多字母单词模式（如 "frog"）。处理方式：

- **单个 ActiveWord 对应一个 ThemeMascot**
- 完整单词显示在同一个吉祥物上
- 已输入/待输入部分分别着色

示例：输入 "frog"，当前已输入 "fr"
```
已输入 "fr" → 浅灰色半透明
待输入 "og" → 黄色高亮
```

---

## 验收标准

### 功能验收

- [ ] 8 个主题各有独立的 SVG 卡通形象
- [ ] 卡通形象与字母一起下落
- [ ] 字母清晰可见，可读性良好
- [ ] 已输入字母显示浅灰色半透明效果 (`#9CA3AF`, `opacity-40`)
- [ ] 待输入字母显示黄色高亮效果 (`#FDE047`)
- [ ] SVG 加载失败时降级到 emoji 显示

### 视觉验收

- [ ] SVG 形象风格统一，符合儿童审美
- [ ] 每个主题动画效果独特且明显
- [ ] 动画流畅，无卡顿
- [ ] 下落过程保持稳定，无抖动
- [ ] 多字母单词显示完整

### 性能验收

- [ ] SVG 文件大小 < 20KB/个
- [ ] 动画帧率 ≥ 55fps（允许偶尔掉帧）
- [ ] 无明显内存泄漏
- [ ] 首次加载：WiFi 下 < 1 秒，3G 网络下 < 3 秒

---

## 无障碍设计

- [ ] SVG 添加 `aria-label` 属性：`aria-label={`字母 ${letter}，主题：${themeName}`}`
- [ ] 色盲用户可通过形状/位置区分已输入/待输入状态
- [ ] 支持 `prefers-reduced-motion`：减少动画幅度

---

## 依赖关系

- 依赖主题系统 (`themes.ts`)
- 依赖游戏状态管理 (`gameStore`, `ActiveWord` 类型)
- 依赖现有下落动画系统 (`falling-letter-float`)

---

## 风险与缓解

| 风险 | 影响 | 缓解措施 |
|-----|------|---------|
| SVG 设计工作量大 | 高 | 分批创建，优先实现默认主题（动物） |
| 动画性能问题 | 中 | 使用 CSS transform，避免重排 |
| 字母可读性受影响 | 中 | 设计阶段预留足够字母空间，使用高对比度颜色 |
| 文件大小过大 | 低 | 优化 SVG 路径，使用 SVGO 压缩工具 |
| SVG 加载失败 | 低 | 降级到 emoji 显示 |

---

## 后续扩展

1. **连击特效**：连击达到阈值时，卡通形象有特殊表情/动作
2. **错误反馈**：输入错误时，卡通形象显示困惑表情
3. **成功庆祝**：完整匹配时，卡通形象有庆祝动画
4. **声音同步**：动画与音效同步触发

---

## 文档变更记录

| 版本 | 日期 | 变更内容 |
|-----|------|---------|
| v1.0 | 2026-03-31 | 初始设计文档 |
| v1.1 | 2026-03-31 | 修复审查问题：组件接口对齐、路径规范、动画实现、错误处理 |
