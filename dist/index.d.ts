/**
 * JP Transliterator
 * 日本語文字変換ライブラリ
 */
import { Romanizer } from "./transliterators/romanizer";
import { AllInputPatterns, InputPatternMatrix, PatternSetArray, ConversionResult } from "./types/pattern.types";
export { Romanizer };
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
 * 日本語テキストから全てのローマ字パターンを取得
 * @param text 日本語テキスト
 * @returns 全てのローマ字パターンを含む2次元配列
 */
export declare function getAllRomajiPatterns(text: string): InputPatternMatrix | ConversionResult;
/**
 * 日本語テキストから文字ごとのローマ字パターンを取得
 * @param text 日本語テキスト
 * @returns 文字ごとのローマ字パターンを含む2次元配列
 */
export declare function getCharacterPatterns(text: string): InputPatternMatrix | ConversionResult;
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