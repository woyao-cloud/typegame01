# 儿童打字游戏项目 - CLAUDE.md
 - 不用过度解释基础功能；
 - 回答简洁，不加客套话；
 - 代码改动后不用总结，我可看diff
 - 优先使用简洁方案，不要过度工程
 - 先进行规划，批准前不实际执行
 - 每个任务执行后打印出用了什么SKILLs ，什么plugins及什么agents
## 项目概述

这是一个面向儿童的英语打字练习游戏网页应用，使用 TypeScript + HTML 技术栈。游戏通过趣味性的卡通形象和渐进式难度设计，帮助儿童在玩耍中练习键盘打字技能。

## 技术栈

- **语言**: TypeScript 5.x
- **构建工具**: Vite
- **UI 框架**: React 18+ (可选) 或 原生 HTML + TypeScript
- **样式**: TailwindCSS + CSS Modules
- **状态管理**: Zustand 或 React Context
- **本地存储**: IndexedDB / localStorage
- **动画**: Framer Motion 或 CSS Animations
- **图标**: Lucide React

## 项目结构

```
game01/
├── src/
│   ├── components/       # React 组件
│   │   ├── game/         # 游戏核心组件
│   │   ├── ui/           # 通用 UI 组件
│   │   ├── config/       # 配置界面组件
│   │   └── results/      # 结果展示组件
│   ├── hooks/            # 自定义 Hooks
│   ├── stores/           # 状态管理
│   ├── utils/            # 工具函数
│   ├── types/            # TypeScript 类型定义
│   ├── constants/        # 常量定义
│   ├── assets/           # 图片、音频资源
│   └── data/             # 本地字库数据
├── public/
│   └── images/           # 卡通形象图片
└── docs/                 # 项目文档
```

## 开发规范

### 代码规范
- 使用 TypeScript 严格模式
- 遵循 ESLint + Prettier 配置
- 函数最大行数：50 行
- 文件最大行数：400 行
- 嵌套深度不超过 4 层

### 命名规范
- 组件：PascalCase (如 `KeyboardDisplay.tsx`)
- 函数/变量：camelCase (如 `calculateScore`)
- 常量：UPPER_SNAKE_CASE (如 `DEFAULT_GAME_DURATION`)
- 类型：PascalCase (如 `GameConfig`)

### 提交规范
遵循 Conventional Commits:
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建/工具

## 核心功能模块

1. **配置系统** - 游戏参数配置（字库、主题、时间、难度）
2. **字库管理** - 本地字库的导入、导出、存储
3. **游戏引擎** - 字母生成、匹配逻辑、计分系统
4. **难度系统** - 基于键盘相邻性的动态难度
5. **视觉系统** - 卡通形象、动画效果、反馈机制
6. **统计系统** - 速度、正确率、历史记录

## 关键设计原则

1. **趣味性优先**: 生动的卡通形象、即时反馈、成就系统
2. **渐进式难度**: 从单字母到多字母，从相邻键到全键盘
3. **本地优先**: 所有数据本地存储，无需联网
4. **儿童友好**: 大字体、鲜艳色彩、简单交互
5. **可配置性**: 所有游戏参数可自定义

## 开发流程

1. **需求分析** → 阅读 docs/ 目录下的产品文档
2. **技术设计** → 创建技术设计文档
3. **TDD 开发** → 使用 tdd-guide agent 编写测试
4. **代码审查** → 使用 code-reviewer agent 审查代码
5. **安全审查** → 使用 security-reviewer agent (如适用)

## 重要约束

- 不依赖后端服务，纯前端应用
- 支持 PWA，可离线使用
- 图片资源使用本地文件或 base64 编码
- 字库数据使用 JSON 格式存储
- 兼容主流浏览器 (Chrome, Firefox, Safari, Edge)

## 相关文档

- [产品需求文档](./docs/product/prd.md)
- [游戏设计文档](./docs/product/game-design.md)
- [技术架构文档](./docs/technical/architecture.md)
- [数据结构文档](./docs/technical/data-structures.md)
