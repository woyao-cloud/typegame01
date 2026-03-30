// T2.6 - 深圳一年级英语词汇表 (50-100 单词)

import { WordLibrary } from '@/types';

/**
 * 深圳小学一年级英语词汇表
 * 来源：深圳市小学英语一年级教材
 */
export const GRADE_1_VOCABULARY: WordLibrary = {
  id: 'grade-1-words',
  name: '一年级词汇',
  description: '深圳市小学英语一年级核心词汇',
  language: 'en',
  words: [
    // 动物 Animals (15)
    { id: 'cat', text: 'cat', category: 'animal', translation: '猫' },
    { id: 'dog', text: 'dog', category: 'animal', translation: '狗' },
    { id: 'bird', text: 'bird', category: 'animal', translation: '鸟' },
    { id: 'fish', text: 'fish', category: 'animal', translation: '鱼' },
    { id: 'rabbit', text: 'rabbit', category: 'animal', translation: '兔子' },
    { id: 'tiger', text: 'tiger', category: 'animal', translation: '老虎' },
    { id: 'lion', text: 'lion', category: 'animal', translation: '狮子' },
    { id: 'monkey', text: 'monkey', category: 'animal', translation: '猴子' },
    { id: 'panda', text: 'panda', category: 'animal', translation: '熊猫' },
    { id: 'elephant', text: 'elephant', category: 'animal', translation: '大象' },
    { id: 'giraffe', text: 'giraffe', category: 'animal', translation: '长颈鹿' },
    { id: 'zebra', text: 'zebra', category: 'animal', translation: '斑马' },
    { id: 'bear', text: 'bear', category: 'animal', translation: '熊' },
    { id: 'fox', text: 'fox', category: 'animal', translation: '狐狸' },
    { id: 'wolf', text: 'wolf', category: 'animal', translation: '狼' },

    // 花卉 Flowers (10)
    { id: 'rose', text: 'rose', category: 'flower', translation: '玫瑰' },
    { id: 'lily', text: 'lily', category: 'flower', translation: '百合' },
    { id: 'tulip', text: 'tulip', category: 'flower', translation: '郁金香' },
    { id: 'daisy', text: 'daisy', category: 'flower', translation: '雏菊' },
    { id: 'sunflower', text: 'sunflower', category: 'flower', translation: '向日葵' },
    { id: 'orchid', text: 'orchid', category: 'flower', translation: '兰花' },
    { id: 'jasmine', text: 'jasmine', category: 'flower', translation: '茉莉' },
    { id: 'peony', text: 'peony', category: 'flower', translation: '牡丹' },
    { id: 'lotus', text: 'lotus', category: 'flower', translation: '莲花' },
    { id: 'violet', text: 'violet', category: 'flower', translation: '紫罗兰' },

    // 颜色 Colors (8)
    { id: 'red', text: 'red', category: 'color', translation: '红色' },
    { id: 'blue', text: 'blue', category: 'color', translation: '蓝色' },
    { id: 'green', text: 'green', category: 'color', translation: '绿色' },
    { id: 'yellow', text: 'yellow', category: 'color', translation: '黄色' },
    { id: 'orange', text: 'orange', category: 'color', translation: '橙色' },
    { id: 'purple', text: 'purple', category: 'color', translation: '紫色' },
    { id: 'pink', text: 'pink', category: 'color', translation: '粉色' },
    { id: 'white', text: 'white', category: 'color', translation: '白色' },

    // 数字 Numbers (10)
    { id: 'one', text: 'one', category: 'number', translation: '一' },
    { id: 'two', text: 'two', category: 'number', translation: '二' },
    { id: 'three', text: 'three', category: 'number', translation: '三' },
    { id: 'four', text: 'four', category: 'number', translation: '四' },
    { id: 'five', text: 'five', category: 'number', translation: '五' },
    { id: 'six', text: 'six', category: 'number', translation: '六' },
    { id: 'seven', text: 'seven', category: 'number', translation: '七' },
    { id: 'eight', text: 'eight', category: 'number', translation: '八' },
    { id: 'nine', text: 'nine', category: 'number', translation: '九' },
    { id: 'ten', text: 'ten', category: 'number', translation: '十' },

    // 水果 Fruits (10)
    { id: 'apple', text: 'apple', category: 'fruit', translation: '苹果' },
    { id: 'banana', text: 'banana', category: 'fruit', translation: '香蕉' },
    { id: 'orange', text: 'orange', category: 'fruit', translation: '橙子' },
    { id: 'grape', text: 'grape', category: 'fruit', translation: '葡萄' },
    { id: 'lemon', text: 'lemon', category: 'fruit', translation: '柠檬' },
    { id: 'peach', text: 'peach', category: 'fruit', translation: '桃子' },
    { id: 'pear', text: 'pear', category: 'fruit', translation: '梨' },
    { id: 'melon', text: 'melon', category: 'fruit', translation: '瓜' },
    { id: 'mango', text: 'mango', category: 'fruit', translation: '芒果' },
    { id: 'cherry', text: 'cherry', category: 'fruit', translation: '樱桃' },

    // 身体部位 Body Parts (7)
    { id: 'head', text: 'head', category: 'body', translation: '头' },
    { id: 'eye', text: 'eye', category: 'body', translation: '眼睛' },
    { id: 'ear', text: 'ear', category: 'body', translation: '耳朵' },
    { id: 'nose', text: 'nose', category: 'body', translation: '鼻子' },
    { id: 'mouth', text: 'mouth', category: 'body', translation: '嘴巴' },
    { id: 'hand', text: 'hand', category: 'body', translation: '手' },
    { id: 'foot', text: 'foot', category: 'body', translation: '脚' },
  ],
  createdAt: Date.now(),
  updatedAt: Date.now(),
  isBuiltIn: true,
};
