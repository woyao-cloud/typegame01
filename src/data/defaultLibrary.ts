// T2.5 - 默认词库数据 (26 个小写字母)

import { WordLibrary } from '@/types';

/**
 * 默认词库 - 26 个小写英文字母
 * 用于字母练习模式
 */
export const DEFAULT_LETTER_LIBRARY: WordLibrary = {
  id: 'default-letters',
  name: '字母练习',
  description: '26 个小写英文字母',
  language: 'en',
  words: [
    { id: 'a', text: 'a', category: 'letter' },
    { id: 'b', text: 'b', category: 'letter' },
    { id: 'c', text: 'c', category: 'letter' },
    { id: 'd', text: 'd', category: 'letter' },
    { id: 'e', text: 'e', category: 'letter' },
    { id: 'f', text: 'f', category: 'letter' },
    { id: 'g', text: 'g', category: 'letter' },
    { id: 'h', text: 'h', category: 'letter' },
    { id: 'i', text: 'i', category: 'letter' },
    { id: 'j', text: 'j', category: 'letter' },
    { id: 'k', text: 'k', category: 'letter' },
    { id: 'l', text: 'l', category: 'letter' },
    { id: 'm', text: 'm', category: 'letter' },
    { id: 'n', text: 'n', category: 'letter' },
    { id: 'o', text: 'o', category: 'letter' },
    { id: 'p', text: 'p', category: 'letter' },
    { id: 'q', text: 'q', category: 'letter' },
    { id: 'r', text: 'r', category: 'letter' },
    { id: 's', text: 's', category: 'letter' },
    { id: 't', text: 't', category: 'letter' },
    { id: 'u', text: 'u', category: 'letter' },
    { id: 'v', text: 'v', category: 'letter' },
    { id: 'w', text: 'w', category: 'letter' },
    { id: 'x', text: 'x', category: 'letter' },
    { id: 'y', text: 'y', category: 'letter' },
    { id: 'z', text: 'z', category: 'letter' },
  ],
  createdAt: Date.now(),
  updatedAt: Date.now(),
  isBuiltIn: true,
};
