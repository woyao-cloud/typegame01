// T8.1 - 主题系统数据

/**
 * 主题类型
 */
export type ThemeId =
  | 'animals'
  | 'flowers'
  | 'fruits'
  | 'vehicles'
  | 'school'
  | 'family'
  | 'colors'
  | 'numbers';

/**
 * 主题配置
 */
export interface Theme {
  id: ThemeId;
  name: string;
  description: string;
  icon: string;
  mascot: string; // 吉祥物 SVG 路径或 emoji
  mascotImage: string; // 吉祥物 SVG 图片路径
  primaryColor: string; // 主色调 (Tailwind 类名)
  secondaryColor: string; // 次要色调
  gradientFrom: string; // 渐变起始色
  gradientTo: string; // 渐变结束色
  vocabulary: string[]; // 主题词汇
}

/**
 * 8 种主题包配置
 */
export const THEMES: Theme[] = [
  {
    id: 'animals',
    name: '小动物',
    description: '可爱的动物朋友们',
    icon: '🐸',
    mascot: '🐸',
    mascotImage: '/images/mascot-animals.svg',
    primaryColor: 'bg-green-500',
    secondaryColor: 'bg-green-100',
    gradientFrom: 'from-green-200',
    gradientTo: 'to-green-100',
    vocabulary: [
      'frog', 'cat', 'dog', 'bird', 'fish', 'rabbit',
      'tiger', 'lion', 'monkey', 'panda', 'elephant',
    ],
  },
  {
    id: 'flowers',
    name: '鲜花',
    description: '美丽的花朵',
    icon: '🌻',
    mascot: '🌻',
    mascotImage: '/images/mascot-flowers.svg',
    primaryColor: 'bg-pink-500',
    secondaryColor: 'bg-pink-100',
    gradientFrom: 'from-pink-200',
    gradientTo: 'to-pink-100',
    vocabulary: [
      'rose', 'lily', 'tulip', 'daisy', 'sunflower',
      'orchid', 'jasmine', 'peony', 'lotus', 'violet',
    ],
  },
  {
    id: 'fruits',
    name: '水果',
    description: '美味的水果',
    icon: '🍎',
    mascot: '🍎',
    mascotImage: '/images/mascot-fruits.svg',
    primaryColor: 'bg-red-500',
    secondaryColor: 'bg-red-100',
    gradientFrom: 'from-red-200',
    gradientTo: 'to-red-100',
    vocabulary: [
      'apple', 'banana', 'orange', 'grape', 'lemon',
      'peach', 'pear', 'melon', 'mango', 'cherry',
    ],
  },
  {
    id: 'vehicles',
    name: '交通工具',
    description: '各种交通工具',
    icon: '🚗',
    mascot: '🚗',
    mascotImage: '/images/mascot-vehicles.svg',
    primaryColor: 'bg-blue-500',
    secondaryColor: 'bg-blue-100',
    gradientFrom: 'from-blue-200',
    gradientTo: 'to-blue-100',
    vocabulary: [
      'car', 'bus', 'bike', 'train', 'plane',
      'ship', 'boat', 'truck', 'taxi', 'van',
    ],
  },
  {
    id: 'school',
    name: '学校用品',
    description: '学习好伙伴',
    icon: '✏️',
    mascot: '✏️',
    mascotImage: '/images/mascot-school.svg',
    primaryColor: 'bg-yellow-500',
    secondaryColor: 'bg-yellow-100',
    gradientFrom: 'from-yellow-200',
    gradientTo: 'to-yellow-100',
    vocabulary: [
      'pen', 'book', 'ruler', 'pencil', 'bag',
      'desk', 'chair', 'map', 'globe', 'ink',
    ],
  },
  {
    id: 'family',
    name: '家庭成员',
    description: '温暖的家庭',
    icon: '👨‍👩‍👧',
    mascot: '🏠',
    mascotImage: '/images/mascot-family.svg',
    primaryColor: 'bg-orange-500',
    secondaryColor: 'bg-orange-100',
    gradientFrom: 'from-orange-200',
    gradientTo: 'to-orange-100',
    vocabulary: [
      'mom', 'dad', 'baby', 'sister', 'brother',
      'grandma', 'grandpa', 'uncle', 'aunt', 'cousin',
    ],
  },
  {
    id: 'colors',
    name: '颜色',
    description: '彩虹的颜色',
    icon: '🌈',
    mascot: '🌈',
    mascotImage: '/images/mascot-colors.svg',
    primaryColor: 'bg-purple-500',
    secondaryColor: 'bg-purple-100',
    gradientFrom: 'from-purple-200',
    gradientTo: 'to-purple-100',
    vocabulary: [
      'red', 'blue', 'green', 'yellow', 'orange',
      'purple', 'pink', 'white', 'black', 'brown',
    ],
  },
  {
    id: 'numbers',
    name: '数字',
    description: '有趣的数字',
    icon: '🔢',
    mascot: '1️⃣',
    mascotImage: '/images/mascot-numbers.svg',
    primaryColor: 'bg-indigo-500',
    secondaryColor: 'bg-indigo-100',
    gradientFrom: 'from-indigo-200',
    gradientTo: 'to-indigo-100',
    vocabulary: [
      'one', 'two', 'three', 'four', 'five',
      'six', 'seven', 'eight', 'nine', 'ten',
    ],
  },
];

/**
 * 默认主题
 */
export const DEFAULT_THEME: Theme = THEMES[0]; // 小动物主题

/**
 * 根据 ID 获取主题
 */
export function getThemeById(id: string): Theme | undefined {
  return THEMES.find((t) => t.id === id);
}

/**
 * 获取主题词汇库
 */
export function getThemeVocabulary(themeId: string): string[] {
  const theme = getThemeById(themeId);
  return theme ? theme.vocabulary : DEFAULT_THEME.vocabulary;
}
