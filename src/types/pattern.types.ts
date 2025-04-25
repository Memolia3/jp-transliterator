/**
 * 日本語文字変換のパターンタイプ定義
 */

// 入力パターンの2次元配列
export type InputPatternMatrix = string[][];

// 一つのパターンのセット（文字列と分割された部分の配列）
export type PatternSet = [string, string[]];

// 複数のパターンセットの配列
export type PatternSetArray = PatternSet[];

// 全入力パターン情報
export interface AllInputPatterns {
  // 全ての組み合わせを含む配列
  patterns: InputPatternMatrix;
  // 分かち書きパターン（カンマ区切り）
  segmented: InputPatternMatrix;
}

// 変換エラー型
export interface ConversionError {
  error: string;
}

// 変換結果型
export type ConversionResult =
  | AllInputPatterns
  | PatternSetArray
  | ConversionError
  | null;
