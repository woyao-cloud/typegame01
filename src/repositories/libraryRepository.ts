// T2.8 - 词库仓库实现

import { WordLibrary, Word } from '@/types';
import { createRepository, STORAGE_KEYS } from '@/utils/storage';
import { validateWordLibrary } from './validation';
import { DEFAULT_LETTER_LIBRARY } from '@/data/defaultLibrary';

/**
 * 词库仓库接口
 */
export interface LibraryRepository {
  // 基础 CRUD
  getAll(): Promise<WordLibrary[]>;
  getById(id: string): Promise<WordLibrary | null>;
  create(library: WordLibrary): Promise<WordLibrary>;
  update(id: string, library: Partial<WordLibrary>): Promise<WordLibrary>;
  delete(id: string): Promise<void>;

  // 词库特有操作
  getWords(libraryId: string): Promise<Word[]>;
  getRandomWord(libraryId: string, difficulty?: number): Promise<Word | null>;
  getWordsByCategory(libraryId: string, category: string): Promise<Word[]>;
  addWord(libraryId: string, word: Word): Promise<WordLibrary>;
  removeWord(libraryId: string, wordId: string): Promise<WordLibrary>;

  // 初始化
  initializeDefaults(): Promise<void>;
}

// 创建底层仓库实例
const repo = createRepository<WordLibrary>(STORAGE_KEYS.LIBRARIES);

/**
 * 词库仓库实现
 */
export const libraryRepository: LibraryRepository = {
  /**
   * 获取所有词库
   */
  async getAll(): Promise<WordLibrary[]> {
    return repo.getAll();
  },

  /**
   * 根据 ID 获取词库
   */
  async getById(id: string): Promise<WordLibrary | null> {
    return repo.getById(id);
  },

  /**
   * 创建新词库
   * @throws {StorageError} 创建失败
   * @throws {LibraryError} 验证失败
   */
  async create(library: WordLibrary): Promise<WordLibrary> {
    // 验证词库数据
    const validationResult = validateWordLibrary(library);
    if (!validationResult.valid) {
      throw new Error(`词库验证失败：${validationResult.errors.join(', ')}`);
    }

    // 检查 ID 是否已存在
    const existing = await repo.getById(library.id);
    if (existing) {
      throw new Error(`词库已存在：${library.id}`);
    }

    return repo.create(library);
  },

  /**
   * 更新词库
   * @throws {StorageError} 更新失败
   * @throws {LibraryError} 验证失败
   */
  async update(id: string, library: Partial<WordLibrary>): Promise<WordLibrary> {
    // 如果更新 words 字段，需要验证
    if (library.words) {
      const existing = await repo.getById(id);
      if (!existing) {
        throw new Error(`词库不存在：${id}`);
      }

      // 合并数据时确保保留原有字段
      const updatedLibrary: WordLibrary = {
        ...existing,
        ...library,
        // 确保这些字段不会被覆盖为空
        id: existing.id || library.id,
        language: library.language || existing.language,
        description: library.description || existing.description,
      };

      const validationResult = validateWordLibrary(updatedLibrary);
      if (!validationResult.valid) {
        throw new Error(`词库验证失败：${validationResult.errors.join(', ')}`);
      }
    }

    return repo.update(id, library);
  },

  /**
   * 删除词库
   * @throws {StorageError} 删除失败
   */
  async delete(id: string): Promise<void> {
    const library = await repo.getById(id);
    if (!library) {
      throw new Error(`词库不存在：${id}`);
    }

    // 不允许删除内置词库
    if (library.isBuiltIn) {
      throw new Error(`不能删除内置词库：${library.name}`);
    }

    return repo.delete(id);
  },

  /**
   * 获取词库中的所有单词
   */
  async getWords(libraryId: string): Promise<Word[]> {
    const library = await repo.getById(libraryId);
    if (!library) {
      throw new Error(`词库不存在：${libraryId}`);
    }
    return library.words;
  },

  /**
   * 随机获取一个单词
   * @param difficulty 难度等级 (1-3)，用于过滤单词长度
   *   - 难度 1: 1-3 个字母
   *   - 难度 2: 3-5 个字母
   *   - 难度 3: 5+ 个字母
   */
  async getRandomWord(
    libraryId: string,
    difficulty: number = 1
  ): Promise<Word | null> {
    const words = await this.getWords(libraryId);

    if (words.length === 0) {
      return null;
    }

    // 根据难度过滤单词
    let filteredWords = words;
    if (difficulty === 1) {
      filteredWords = words.filter((w) => w.text.length <= 3);
    } else if (difficulty === 2) {
      filteredWords = words.filter((w) => w.text.length >= 3 && w.text.length <= 5);
    } else if (difficulty === 3) {
      filteredWords = words.filter((w) => w.text.length >= 5);
    }

    // 如果过滤后没有单词，返回原列表
    if (filteredWords.length === 0) {
      filteredWords = words;
    }

    // 随机选择
    const randomIndex = Math.floor(Math.random() * filteredWords.length);
    return filteredWords[randomIndex];
  },

  /**
   * 根据分类获取单词
   */
  async getWordsByCategory(libraryId: string, category: string): Promise<Word[]> {
    const words = await this.getWords(libraryId);
    return words.filter((w) => w.category === category);
  },

  /**
   * 添加单词到词库
   */
  async addWord(libraryId: string, word: Word): Promise<WordLibrary> {
    const library = await repo.getById(libraryId);
    if (!library) {
      throw new Error(`词库不存在：${libraryId}`);
    }

    // 检查单词是否已存在
    if (library.words.some((w) => w.id === word.id)) {
      throw new Error(`单词已存在：${word.id}`);
    }

    // 添加单词
    const updatedLibrary: WordLibrary = {
      ...library,
      words: [...library.words, word],
      updatedAt: Date.now(),
    };

    // 验证更新后的词库
    const validationResult = validateWordLibrary(updatedLibrary);
    if (!validationResult.valid) {
      throw new Error(`词库验证失败：${validationResult.errors.join(', ')}`);
    }

    return repo.update(libraryId, updatedLibrary);
  },

  /**
   * 从词库移除单词
   */
  async removeWord(libraryId: string, wordId: string): Promise<WordLibrary> {
    const library = await repo.getById(libraryId);
    if (!library) {
      throw new Error(`词库不存在：${libraryId}`);
    }

    // 移除单词
    const updatedLibrary: WordLibrary = {
      ...library,
      words: library.words.filter((w) => w.id !== wordId),
      updatedAt: Date.now(),
    };

    return repo.update(libraryId, updatedLibrary);
  },

  /**
   * 初始化默认词库
   * 首次使用时自动创建内置词库
   */
  async initializeDefaults(): Promise<void> {
    try {
      // 检查默认词库是否存在
      const existing = await repo.getById(DEFAULT_LETTER_LIBRARY.id);
      if (!existing) {
        await repo.create(DEFAULT_LETTER_LIBRARY);
      }
    } catch (error) {
      console.error('初始化默认词库失败:', error);
      throw error;
    }
  },
};
