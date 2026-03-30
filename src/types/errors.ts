// 错误类型定义

export class GameError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'GameError';
  }
}

export class LibraryError extends GameError {
  constructor(message: string, public details?: unknown) {
    super(message, 'LIBRARY_ERROR');
    this.name = 'LibraryError';
  }
}

export class StorageError extends GameError {
  constructor(message: string, public cause?: unknown) {
    super(message, 'STORAGE_ERROR');
    this.name = 'StorageError';
  }
}
