// T2.9 - 游戏记录仓库实现

import { GameRecord } from '@/types';
import { createRepository, STORAGE_KEYS } from '@/utils/storage';

/**
 * 记录筛选条件
 */
export interface RecordFilter {
  libraryId?: string;
  mode?: 'letter' | 'word';
  difficulty?: number;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

/**
 * 游戏记录仓库接口
 */
export interface RecordRepository {
  // 基础 CRUD
  getAll(): Promise<GameRecord[]>;
  getById(id: string): Promise<GameRecord | null>;
  create(record: GameRecord): Promise<GameRecord>;
  delete(id: string): Promise<void>;

  // 记录查询
  getRecentRecords(limit?: number): Promise<GameRecord[]>;
  getBestRecords(libraryId: string, limit?: number): Promise<GameRecord[]>;
  getRecordsByFilter(filter: RecordFilter): Promise<GameRecord[]>;

  // 统计
  getTotalPlayCount(): Promise<number>;
  getBestScore(libraryId: string): Promise<number>;
  getBestWPM(libraryId: string): Promise<number>;
  getAverageWPM(): Promise<number>;

  // 数据管理
  clearAll(): Promise<void>;
}

// 创建底层仓库实例
const repo = createRepository<GameRecord>(STORAGE_KEYS.RECORDS);

/**
 * 游戏记录仓库实现
 */
export const recordRepository: RecordRepository = {
  /**
   * 获取所有记录
   */
  async getAll(): Promise<GameRecord[]> {
    return repo.getAll();
  },

  /**
   * 根据 ID 获取记录
   */
  async getById(id: string): Promise<GameRecord | null> {
    return repo.getById(id);
  },

  /**
   * 创建新记录
   */
  async create(record: GameRecord): Promise<GameRecord> {
    return repo.create(record);
  },

  /**
   * 删除记录
   */
  async delete(id: string): Promise<void> {
    return repo.delete(id);
  },

  /**
   * 获取最近的游戏记录
   * @param limit 最大返回数量，默认 10
   */
  async getRecentRecords(limit: number = 10): Promise<GameRecord[]> {
    const allRecords = await repo.getAll();

    // 按时间倒序排序
    allRecords.sort((a, b) => b.completedAt - a.completedAt);

    return allRecords.slice(0, limit);
  },

  /**
   * 获取词库的最佳记录 (按分数排序)
   * @param libraryId 词库 ID
   * @param limit 最大返回数量，默认 5
   */
  async getBestRecords(libraryId: string, limit: number = 5): Promise<GameRecord[]> {
    const allRecords = await repo.getAll();

    // 过滤指定词库的记录
    const filtered = allRecords.filter((r) => r.libraryId === libraryId);

    // 按分数降序排序
    filtered.sort((a, b) => b.score - a.score);

    return filtered.slice(0, limit);
  },

  /**
   * 根据筛选条件获取记录
   */
  async getRecordsByFilter(filter: RecordFilter): Promise<GameRecord[]> {
    let records = await repo.getAll();

    // 按词库筛选
    if (filter.libraryId) {
      records = records.filter((r) => r.libraryId === filter.libraryId);
    }

    // 按模式筛选
    if (filter.mode) {
      records = records.filter((r) => r.mode === filter.mode);
    }

    // 按难度筛选
    if (filter.difficulty) {
      records = records.filter((r) => r.difficulty === filter.difficulty);
    }

    // 按开始时间筛选
    if (filter.startDate) {
      const startTimestamp = filter.startDate.getTime();
      records = records.filter((r) => r.startedAt >= startTimestamp);
    }

    // 按结束时间筛选
    if (filter.endDate) {
      const endTimestamp = filter.endDate.getTime();
      records = records.filter((r) => r.completedAt <= endTimestamp);
    }

    // 按时间倒序排序
    records.sort((a, b) => b.completedAt - a.completedAt);

    // 限制返回数量
    if (filter.limit) {
      records = records.slice(0, filter.limit);
    }

    return records;
  },

  /**
   * 获取总游戏次数
   */
  async getTotalPlayCount(): Promise<number> {
    const allRecords = await repo.getAll();
    return allRecords.length;
  },

  /**
   * 获取词库的最高分
   */
  async getBestScore(libraryId: string): Promise<number> {
    const records = await this.getBestRecords(libraryId, 1);
    if (records.length === 0) {
      return 0;
    }
    return records[0].score;
  },

  /**
   * 获取词库的最高 WPM
   */
  async getBestWPM(libraryId: string): Promise<number> {
    const allRecords = await repo.getAll();
    const filtered = allRecords.filter((r) => r.libraryId === libraryId);

    if (filtered.length === 0) {
      return 0;
    }

    // 找出最高 WPM
    const maxWPM = Math.max(...filtered.map((r) => r.wpm));
    return maxWPM || 0;
  },

  /**
   * 获取平均 WPM
   */
  async getAverageWPM(): Promise<number> {
    const allRecords = await repo.getAll();

    if (allRecords.length === 0) {
      return 0;
    }

    const totalWPM = allRecords.reduce((sum, r) => sum + (r.wpm || 0), 0);
    return Math.round(totalWPM / allRecords.length);
  },

  /**
   * 清空所有记录
   */
  async clearAll(): Promise<void> {
    const allRecords = await repo.getAll();
    await Promise.all(allRecords.map((r) => repo.delete(r.id)));
  },
};
