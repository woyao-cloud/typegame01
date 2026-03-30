// T2.8a - 词库验证函数

import { WordLibrary, Word } from '@/types';

/**
 * 验证结果
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * 最大单词数量限制
 */
const MAX_WORDS = 500;

/**
 * 单词最大长度限制
 */
const MAX_WORD_LENGTH = 20;

/**
 * 允许的字符类型 (仅限英文字母和基础标点)
 */
const VALID_CHAR_REGEX = /^[a-zA-Z\s\-'.]+$/;

/**
 * 验证词库数据
 * @param library 待验证的词库
 * @returns 验证结果
 */
export function validateWordLibrary(library: WordLibrary): ValidationResult {
  const errors: string[] = [];

  // 1. 验证必填字段
  if (!library.id || library.id.trim() === '') {
    errors.push('词库 ID 不能为空');
  }

  if (!library.name || library.name.trim() === '') {
    errors.push('词库名称不能为空');
  }

  if (!library.language || library.language.trim() === '') {
    errors.push('词库语言不能为空');
  }

  // 2. 验证单词列表
  if (!library.words || !Array.isArray(library.words)) {
    errors.push('单词列表必须是非空数组');
    return { valid: false, errors };
  }

  if (library.words.length === 0) {
    errors.push('单词列表不能为空');
  }

  if (library.words.length > MAX_WORDS) {
    errors.push(`单词数量不能超过 ${MAX_WORDS} 个 (当前：${library.words.length})`);
  }

  // 3. 验证每个单词
  const wordIds = new Set<string>();
  for (let i = 0; i < library.words.length; i++) {
    const word = library.words[i];
    const wordErrors = validateWord(word, i);
    errors.push(...wordErrors);

    // 检查 ID 重复
    if (wordIds.has(word.id)) {
      errors.push(`单词 ID 重复：${word.id}`);
    }
    wordIds.add(word.id);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 验证单个单词
 * @param word 待验证的单词
 * @param index 单词在列表中的索引 (用于错误提示)
 * @returns 错误列表
 */
function validateWord(word: Word, index: number): string[] {
  const errors: string[] = [];

  // 1. 验证 ID
  if (!word.id || word.id.trim() === '') {
    errors.push(`第 ${index + 1} 个单词的 ID 不能为空`);
  }

  // 2. 验证文本
  if (!word.text || word.text.trim() === '') {
    errors.push(`第 ${index + 1} 个单词的文本不能为空`);
    return errors;
  }

  if (word.text.length > MAX_WORD_LENGTH) {
    errors.push(
      `单词 "${word.text}" 长度超过限制 (最大 ${MAX_WORD_LENGTH} 个字符)`
    );
  }

  // 3. 验证字符合法性
  if (!VALID_CHAR_REGEX.test(word.text)) {
    errors.push(
      `单词 "${word.text}" 包含非法字符 (仅允许英文字母、空格、连字符、撇号和句点)`
    );
  }

  return errors;
}

/**
 * 验证词库导入数据
 * @param data 导入的数据
 * @returns 验证结果
 */
export function validateImportData(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    errors.push('导入数据必须是对象');
    return { valid: false, errors };
  }

  const obj = data as Record<string, unknown>;

  if (!obj.words || !Array.isArray(obj.words)) {
    errors.push('导入数据必须包含 words 数组');
    return { valid: false, errors };
  }

  // 创建临时词库进行验证
  const tempLibrary: WordLibrary = {
    id: 'temp',
    name: 'temp',
    description: 'temp',
    language: 'en',
    words: obj.words as Word[],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isBuiltIn: false,
  };

  return validateWordLibrary(tempLibrary);
}
