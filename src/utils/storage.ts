// T2.7 - IndexedDB 存储封装

import localforage from 'localforage';
import { StorageError } from '@/types/errors';

/**
 * 存储键名常量
 */
export const STORAGE_KEYS = {
  // 词库
  LIBRARIES: 'typing-game-libraries',
  DEFAULT_LIBRARY_ID: 'default-letters',

  // 游戏记录
  RECORDS: 'typing-game-records',

  // 配置
  CONFIG: 'typing-game-config',
} as const;

/**
 * 初始化 localforage 实例
 */
const db = localforage.createInstance({
  name: 'TypingGame',
  version: 1,
  storeName: 'gameData',
  description: '儿童打字游戏数据存储',
});

/**
 * 通用存储操作接口
 */
export interface StorageRepository<T> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  create(item: T): Promise<T>;
  update(id: string, item: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}

/**
 * 创建仓库实例
 * @param storeKey 存储键名
 */
export function createRepository<T extends { id: string }>(
  storeKey: string
): StorageRepository<T> {
  const store = db.createInstance({
    name: 'TypingGame',
    storeName: storeKey,
  });

  return {
    async getAll(): Promise<T[]> {
      try {
        const keys = await store.keys();
        const items = await Promise.all(
          keys.map((key) => store.getItem<T>(key))
        );
        return items.filter((item): item is T => item !== null);
      } catch (error) {
        throw new StorageError(`获取所有${storeKey}失败`, error);
      }
    },

    async getById(id: string): Promise<T | null> {
      try {
        const item = await store.getItem<T>(id);
        return item;
      } catch (error) {
        throw new StorageError(`获取${storeKey}失败：${id}`, error);
      }
    },

    async create(item: T): Promise<T> {
      try {
        await store.setItem(item.id, item);
        return item;
      } catch (error) {
        throw new StorageError(`创建${storeKey}失败`, error);
      }
    },

    async update(id: string, item: Partial<T>): Promise<T> {
      try {
        const existing = await store.getItem<T>(id);
        if (!existing) {
          throw new StorageError(`更新失败，${storeKey}不存在：${id}`);
        }
        const updated = { ...existing, ...item } as T;
        await store.setItem(id, updated);
        return updated;
      } catch (error) {
        if (error instanceof StorageError) throw error;
        throw new StorageError(`更新${storeKey}失败：${id}`, error);
      }
    },

    async delete(id: string): Promise<void> {
      try {
        await store.removeItem(id);
      } catch (error) {
        throw new StorageError(`删除${storeKey}失败：${id}`, error);
      }
    },

    async exists(id: string): Promise<boolean> {
      try {
        const item = await store.getItem<T>(id);
        return item !== null;
      } catch (error) {
        throw new StorageError(`检查${storeKey}存在性失败：${id}`, error);
      }
    },
  };
}

/**
 * 清空所有存储 (用于重置)
 */
export async function clearAllStorage(): Promise<void> {
  try {
    await db.clear();
  } catch (error) {
    throw new StorageError('清空存储失败', error);
  }
}

/**
 * 导出所有数据 (用于备份)
 */
export async function exportAllData(): Promise<Record<string, unknown>> {
  try {
    const result: Record<string, unknown> = {};

    // 导出词库
    const libraries = await createRepository<ReturnType<typeof createRepository<any>>>(STORAGE_KEYS.LIBRARIES).getAll();
    result.libraries = libraries;

    // 导出记录
    const records = await createRepository<ReturnType<typeof createRepository<any>>>(STORAGE_KEYS.RECORDS).getAll();
    result.records = records;

    // 导出配置
    const config = await db.getItem(STORAGE_KEYS.CONFIG);
    result.config = config;

    return result;
  } catch (error) {
    throw new StorageError('导出数据失败', error);
  }
}

/**
 * 导入数据 (用于恢复)
 */
export async function importAllData(
  data: Record<string, unknown>
): Promise<void> {
  try {
    if (data.libraries) {
      const libraryRepo = createRepository<any>(STORAGE_KEYS.LIBRARIES);
      for (const lib of data.libraries as any[]) {
        await libraryRepo.create(lib);
      }
    }

    if (data.records) {
      const recordRepo = createRepository<any>(STORAGE_KEYS.RECORDS);
      for (const record of data.records as any[]) {
        await recordRepo.create(record);
      }
    }

    if (data.config) {
      await db.setItem(STORAGE_KEYS.CONFIG, data.config);
    }
  } catch (error) {
    throw new StorageError('导入数据失败', error);
  }
}
