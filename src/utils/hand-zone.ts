// T2.4 - 同手区算法

import { QWERTY_LAYOUT } from './keyboard';

/**
 * 获取目标字母的同手区字符 (中等难度使用)
 * 同手区定义：同一只手负责敲击的键盘区域
 */
export function getSameHandZone(char: string): string[] {
  const normalizedChar = char.toLowerCase();
  const isLeftHand = QWERTY_LAYOUT.handZones.left.includes(normalizedChar);

  return isLeftHand
    ? QWERTY_LAYOUT.handZones.left
    : QWERTY_LAYOUT.handZones.right;
}

/**
 * 获取手别信息
 */
export function getHandInfo(char: string): {
  hand: 'left' | 'right';
  zone: string[];
} {
  const normalizedChar = char.toLowerCase();
  const isLeftHand = QWERTY_LAYOUT.handZones.left.includes(normalizedChar);

  return {
    hand: isLeftHand ? 'left' : 'right',
    zone: isLeftHand
      ? QWERTY_LAYOUT.handZones.left
      : QWERTY_LAYOUT.handZones.right,
  };
}
