# 儿童打字游戏

一个专为儿童设计的打字练习游戏，支持字母练习和单词练习模式。

## 功能特性

- **字母练习**: 26 个小写字母的基础练习
- **单词练习**: 深圳小学一年级英语词汇（60+ 单词）
- **难度分级**: 3 个难度等级（基于单词长度）
- **速度调节**: 4 档下落速度
- **游戏时长**: 2/5/10 分钟可选
- **音效系统**: 正确/错误/连击/完成音效
- **游戏记录**: 自动保存成绩并显示统计

## 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite 5
- **状态管理**: Zustand
- **样式**: TailwindCSS
- **存储**: IndexedDB (localforage)

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 项目结构

```
src/
├── App.tsx                 # 主应用组件
├── main.tsx               # 入口文件
├── globals.css            # 全局样式
├── components/
│   ├── game/              # 游戏组件
│   │   ├── GameScreen.tsx
│   │   ├── GameHUD.tsx
│   │   ├── GameOver.tsx
│   │   ├── MenuScreen.tsx
│   │   └── KeyboardHint.tsx
│   ├── ui/                # 基础 UI 组件
│   ├── settings/          # 设置组件
│   └── records/           # 记录组件
├── engine/                # 游戏引擎
│   ├── GameEngine.ts
│   └── TrackManager.ts
├── stores/                # Zustand 状态管理
│   ├── gameStore.ts
│   └── configStore.ts
├── repositories/          # 数据仓库
│   ├── libraryRepository.ts
│   ├── recordRepository.ts
│   └── validation.ts
├── utils/                 # 工具函数
│   ├── keyboard.ts        # 键盘布局数据
│   ├── adjacent-keys.ts   # 相邻键算法
│   ├── hand-zone.ts       # 同手区算法
│   ├── audio.ts           # 音频管理
│   └── storage.ts         # 存储封装
├── data/                  # 静态数据
│   ├── defaultLibrary.ts  # 默认字母库
│   └── vocabulary.ts      # 一年级词汇
├── hooks/                 # React Hooks
│   └── useKeyboard.ts
└── types/                 # TypeScript 类型
    └── index.ts
```

## 游戏说明

### 难度等级
- ⭐ 简单：1-3 个字母
- ⭐⭐ 中等：3-5 个字母
- ⭐⭐⭐ 困难：5+ 个字母

### 速度等级
- 🐢 慢速
- 🚶 正常
- 🏃 快速
- 🚀 极速

### 计分规则
- 基础分：10 分/字符
- 连击奖励：每 5 连击 +10% 倍率
- 难度奖励：难度等级 × 2 分

## 开发文档

详细的技术文档位于 `docs/` 目录：
- [产品需求文档](docs/product/prd.md)
- [功能需求文档](docs/product/frd.md)
- [非功能需求文档](docs/product/nfrd.md)
- [UI 规格说明](docs/product/ui-spec.md)
- [系统架构](docs/technical/architecture.md)
- [任务清单](docs/technical/task-list.md)

## 许可证

MIT
