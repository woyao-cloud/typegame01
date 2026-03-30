// i18n 导出入口
export { zhCN } from './zh-CN';

export type TranslationKey = keyof typeof zhCN;

export function t(key: TranslationKey): string {
  return zhCN[key] || key;
}
