/**
 * JP Transliterator
 * 日本語文字変換ライブラリ
 */
import { Romanizer } from "./transliterators/romanizer";
import { Japanizer } from "./transliterators/japanizer";
import { AllInputPatterns, InputPatternMatrix, PatternSetArray, ConversionResult } from "./types/pattern.types";
export { Romanizer, Japanizer };
export * from "./types/pattern.types";
export * from "./types/transliterate.types";
export * from "./core/i-transliterator";
/**
 * 日本語からローマ字への変換
 * @param text 日本語テキスト
 * @returns ローマ字文字列または変換結果
 */
export declare function toRomaji(text: string): string | ConversionResult;
/**
 * ローマ字から日本語への変換
 * @param text ローマ字テキスト
 * @returns 日本語文字列または変換結果
 */
export declare function toKana(text: string): string | ConversionResult;
/**
 * 日本語テキストから全ての入力パターンを取得
 * @param text 日本語テキスト
 * @returns 全ての入力パターンを含む2次元配列
 */
export declare function getAllInputPatterns(text: string): InputPatternMatrix | ConversionResult;
/**
 * 日本語テキストからカンマ区切りの入力パターンを取得
 * @param text 日本語テキスト
 * @returns カンマ区切りの入力パターンを含む2次元配列
 */
export declare function getSegmentedPatterns(text: string): InputPatternMatrix | ConversionResult;
/**
 * 日本語テキストから完全な入力パターン情報を取得
 * @param text 日本語テキスト
 * @returns 完全な入力パターン情報
 */
export declare function getCompletePatterns(text: string): AllInputPatterns | ConversionResult;
/**
 * 日本語テキストから変換結果を標準形式で取得
 * @param text 日本語テキスト
 * @returns 標準的なパターンセット配列
 */
export declare function getPatternSets(text: string): PatternSetArray | ConversionResult;
//# sourceMappingURL=index.d.ts.map