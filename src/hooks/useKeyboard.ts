// T3.5 - 键盘输入 Hook

import { useEffect, useCallback, useRef } from 'react';

/**
 * 键盘输入 Hook 配置
 */
interface UseKeyboardOptions {
  /** 是否启用键盘监听 */
  enabled: boolean;
  /** 按键处理回调 */
  onKeyPress: (key: string) => void;
  /** 防抖时间 (毫秒) */
  debounceMs?: number;
}

/**
 * 键盘输入 Hook
 * 处理键盘事件、防抖、按键映射
 */
export function useKeyboard(options: UseKeyboardOptions): void {
  const { enabled, onKeyPress, debounceMs = 50 } = options;

  // 记录上次按键时间和键值
  const lastKeyPressTime = useRef<number>(0);
  const lastKeyPressKey = useRef<string | null>(null);

  // 处理按键事件
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // 忽略修饰键
      const ignoreKeys = [
        'Shift',
        'Control',
        'Alt',
        'Meta',
        'CapsLock',
        'Tab',
        'Escape',
        'Enter',
        'Backspace',
        'Delete',
        'ArrowUp',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'Home',
        'End',
        'PageUp',
        'PageDown',
        'Insert',
      ];

      if (ignoreKeys.includes(event.key)) {
        return;
      }

      // 防抖检查
      const now = performance.now();
      if (
        now - lastKeyPressTime.current < debounceMs &&
        event.key === lastKeyPressKey.current
      ) {
        return;
      }

      // 更新按键记录
      lastKeyPressTime.current = now;
      lastKeyPressKey.current = event.key;

      // 转换为小写并处理
      const key = event.key.toLowerCase();

      // 只处理字母键
      if (key.length === 1 && key >= 'a' && key <= 'z') {
        onKeyPress(key);
      }
    },
    [enabled, onKeyPress, debounceMs]
  );

  // 注册和注销事件监听
  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);
}

/**
 * 获取键位所属的手 (左手/右手)
 * @param key 按键
 */
export function getHandForKey(key: string): 'left' | 'right' {
  const leftHandKeys = 'qwertasdfgzxcv'.split('');
  return leftHandKeys.includes(key.toLowerCase()) ? 'left' : 'right';
}

/**
 * 获取键位所属的指法区域
 * @param key 按键
 */
export function getFingerForKey(key: string): string {
  // 简化版指法映射
  const fingerMap: Record<string, string> = {
    q: 'left-pinky',
    a: 'left-pinky',
    z: 'left-pinky',
    w: 'left-ring',
    s: 'left-ring',
    x: 'left-ring',
    e: 'left-middle',
    d: 'left-middle',
    c: 'left-middle',
    r: 'left-index',
    f: 'left-index',
    v: 'left-index',
    t: 'left-index',
    g: 'left-index',
    b: 'left-index',
    y: 'right-index',
    h: 'right-index',
    n: 'right-index',
    u: 'right-index',
    j: 'right-index',
    m: 'right-index',
    i: 'right-middle',
    k: 'right-middle',
    o: 'right-ring',
    l: 'right-ring',
    p: 'right-pinky',
    ';': 'right-pinky',
    '/': 'right-pinky',
  };

  return fingerMap[key.toLowerCase()] || 'unknown';
}
