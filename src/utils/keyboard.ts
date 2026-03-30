// T2.2 - 键盘布局数据 (QWERTY)

import { KeyPosition, KeyboardLayout } from './types';

export const QWERTY_LAYOUT: KeyboardLayout = {
  rows: [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
  ],
  keyPositions: new Map([
    ['q', { row: 0, col: 0 }],
    ['w', { row: 0, col: 1 }],
    ['e', { row: 0, col: 2 }],
    ['r', { row: 0, col: 3 }],
    ['t', { row: 0, col: 4 }],
    ['y', { row: 0, col: 5 }],
    ['u', { row: 0, col: 6 }],
    ['i', { row: 0, col: 7 }],
    ['o', { row: 0, col: 8 }],
    ['p', { row: 0, col: 9 }],
    ['a', { row: 1, col: 0 }],
    ['s', { row: 1, col: 1 }],
    ['d', { row: 1, col: 2 }],
    ['f', { row: 1, col: 3 }],
    ['g', { row: 1, col: 4 }],
    ['h', { row: 1, col: 5 }],
    ['j', { row: 1, col: 6 }],
    ['k', { row: 1, col: 7 }],
    ['l', { row: 1, col: 8 }],
    ['z', { row: 2, col: 0 }],
    ['x', { row: 2, col: 1 }],
    ['c', { row: 2, col: 2 }],
    ['v', { row: 2, col: 3 }],
    ['b', { row: 2, col: 4 }],
    ['n', { row: 2, col: 5 }],
    ['m', { row: 2, col: 6 }],
  ]),
  handZones: {
    left: ['q', 'w', 'e', 'r', 't', 'a', 's', 'd', 'f', 'g', 'z', 'x', 'c', 'v', 'b'],
    right: ['y', 'u', 'i', 'o', 'p', 'h', 'j', 'k', 'l', 'n', 'm'],
  },
};

/**
 * 获取键位的手别
 */
export function getHandZone(key: string): 'left' | 'right' {
  return QWERTY_LAYOUT.handZones.left.includes(key.toLowerCase())
    ? 'left'
    : 'right';
}

/**
 * 获取键位之间的距离 (用于计算难度)
 */
export function getKeyDistance(key1: string, key2: string): number {
  const pos1 = QWERTY_LAYOUT.keyPositions.get(key1.toLowerCase());
  const pos2 = QWERTY_LAYOUT.keyPositions.get(key2.toLowerCase());

  if (!pos1 || !pos2) return Infinity;

  return Math.abs(pos1.row - pos2.row) + Math.abs(pos1.col - pos2.col);
}
