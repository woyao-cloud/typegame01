// keyboard.ts 类型定义

export interface KeyPosition {
  row: number;
  col: number;
}

export interface KeyboardLayout {
  rows: string[][];
  keyPositions: Map<string, KeyPosition>;
  handZones: {
    left: string[];
    right: string[];
  };
}
