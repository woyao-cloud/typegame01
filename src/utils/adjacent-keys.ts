// T2.3 - 相邻键算法

import { QWERTY_LAYOUT } from './keyboard';

/**
 * 获取目标字母的相邻键 (简单难度使用)
 * 相邻键定义：上下左右直接相邻的键
 */
export function getAdjacentKeys(char: string): string[] {
  const normalizedChar = char.toLowerCase();
  const pos = QWERTY_LAYOUT.keyPositions.get(normalizedChar);

  if (!pos) return [normalizedChar];

  const neighbors: string[] = [];
  const { row, col } = pos;

  // 上排相邻
  if (row > 0) {
    const aboveRow = QWERTY_LAYOUT.rows[row - 1];
    if (col < aboveRow.length) neighbors.push(aboveRow[col]);
    if (col > 0 && col - 1 < aboveRow.length) {
      neighbors.push(aboveRow[col - 1]);
    }
  }

  // 下排相邻
  if (row < QWERTY_LAYOUT.rows.length - 1) {
    const belowRow = QWERTY_LAYOUT.rows[row + 1];
    if (col < belowRow.length) neighbors.push(belowRow[col]);
    if (col > 0 && col - 1 < belowRow.length) {
      neighbors.push(belowRow[col - 1]);
    }
  }

  // 左右相邻
  const currentRow = QWERTY_LAYOUT.rows[row];
  if (col > 0) neighbors.push(currentRow[col - 1]);
  if (col < currentRow.length - 1) {
    neighbors.push(currentRow[col + 1]);
  }

  // 去重并添加目标字符本身
  return [...new Set([...neighbors, normalizedChar])];
}

/**
 * 获取相邻键详情 (用于调试和测试)
 */
export function getAdjacentKeysDetail(char: string): {
  up: string[];
  down: string[];
  left: string[];
  right: string[];
  all: string[];
} {
  const normalizedChar = char.toLowerCase();
  const pos = QWERTY_LAYOUT.keyPositions.get(normalizedChar);

  const result = {
    up: [] as string[],
    down: [] as string[],
    left: [] as string[],
    right: [] as string[],
    all: [] as string[],
  };

  if (!pos) {
    result.all = [normalizedChar];
    return result;
  }

  const { row, col } = pos;

  // 上方
  if (row > 0) {
    const aboveRow = QWERTY_LAYOUT.rows[row - 1];
    if (col < aboveRow.length) result.up.push(aboveRow[col]);
    if (col > 0 && col - 1 < aboveRow.length) {
      result.up.push(aboveRow[col - 1]);
    }
  }

  // 下方
  if (row < QWERTY_LAYOUT.rows.length - 1) {
    const belowRow = QWERTY_LAYOUT.rows[row + 1];
    if (col < belowRow.length) result.down.push(belowRow[col]);
    if (col > 0 && col - 1 < belowRow.length) {
      result.down.push(belowRow[col - 1]);
    }
  }

  // 左侧
  if (col > 0) {
    result.left.push(QWERTY_LAYOUT.rows[row][col - 1]);
  }

  // 右侧
  if (col < QWERTY_LAYOUT.rows[row].length - 1) {
    result.right.push(QWERTY_LAYOUT.rows[row][col + 1]);
  }

  result.all = [...result.up, ...result.down, ...result.left, ...result.right];

  return result;
}
