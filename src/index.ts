/**
 * JP Transliterator
 * 日本語文字変換ライブラリ
 */
import { Romanizer } from "./transliterators/romanizer";
// import { Japanizer } from "./transliterators/japanizer";
import { PatternService } from "./services/pattern.service";
import {
  AllInputPatterns,
  InputPatternMatrix,
  PatternSetArray,
  ConversionResult,
} from "./types/pattern.types";
import {
  Combinations,
  TransliterationTable,
} from "./types/transliterate.types";
import { romajiToKanaMap } from "./data/pattern";

// エクスポート
export { Romanizer };
export * from "./types/pattern.types";
export * from "./types/transliterate.types";
export * from "./core/i-transliterator";

// シングルトンインスタンス
const romanizer = new Romanizer();
// const japanizer = new Japanizer();
const patternService = new PatternService(
  romajiToKanaMap as TransliterationTable
);

/**
 * 日本語からローマ字への変換
 * @param text 日本語テキスト
 * @returns ローマ字文字列または変換結果
 */
export function toRomaji(text: string): string | ConversionResult {
  const result = romanizer.transliterate(text);

  if (!result) return "";
  if ("error" in result) return result;

  // 最初の変換結果を文字列として返す
  if (Array.isArray(result) && result.length > 0 && result[0][0].length > 0) {
    return result[0][0][0];
  }

  return "";
}

// /**
//  * ローマ字から日本語への変換
//  * @param text ローマ字テキスト
//  * @returns 日本語文字列または変換結果
//  */
// export function toKana(text: string): string | ConversionResult {
//   const result = japanizer.transliterate(text);

//   if (!result) return "";
//   if ("error" in result) return result;

//   // ひらがなを返す
//   if (Array.isArray(result)) {
//     return typeof result[0] === "string" ? result[0] : "";
//   }

//   return typeof result[0] === "string" ? result[0] : "";
// }

/**
 * 日本語テキストから全ての入力パターンを取得
 * @param text 日本語テキスト
 * @returns 全ての入力パターンを含む2次元配列
 */
export function getAllInputPatterns(
  text: string
): InputPatternMatrix | ConversionResult {
  const result = romanizer.transliterate(text);

  if (!result) return [];
  if ("error" in result) return result;

  // Romanizer結果のみを処理
  if (!Array.isArray(result)) return [];

  return patternService.getAllInputPatterns(result as Combinations);
}

/**
 * 日本語テキストからカンマ区切りの入力パターンを取得
 * @param text 日本語テキスト
 * @returns カンマ区切りの入力パターンを含む2次元配列
 */
export function getSegmentedPatterns(
  text: string
): InputPatternMatrix | ConversionResult {
  const result = romanizer.transliterate(text);

  if (!result) return [];
  if ("error" in result) return result;

  // Romanizer結果のみを処理
  if (!Array.isArray(result)) return [];

  return patternService.getSegmentedPatterns(result as Combinations);
}

/**
 * 日本語テキストから完全な入力パターン情報を取得
 * @param text 日本語テキスト
 * @returns 完全な入力パターン情報
 */
export function getCompletePatterns(
  text: string
): AllInputPatterns | ConversionResult {
  const result = romanizer.transliterate(text);

  if (!result)
    return {
      patterns: [],
      segmented: [],
    };

  if ("error" in result) return result;

  // Romanizer結果のみを処理
  if (!Array.isArray(result)) {
    return {
      patterns: [],
      segmented: [],
    };
  }

  return patternService.getCompletePatterns(result as Combinations, text);
}

/**
 * 日本語テキストから変換結果を標準形式で取得
 * @param text 日本語テキスト
 * @returns 標準的なパターンセット配列
 */
export function getPatternSets(
  text: string
): PatternSetArray | ConversionResult {
  const result = romanizer.transliterate(text);

  if (!result) return [];
  if ("error" in result) return result;

  // Romanizer結果のみを処理
  if (!Array.isArray(result)) return [];

  return patternService.toPatternSetArray(result as Combinations);
}
