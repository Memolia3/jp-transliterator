import type { Pattern, Combinations } from "../types/transliterate.types";
import BaseTransliterator from "./abstract/base-transliterator";
/**
 * かな・カナ → ローマ字変換クラス
 */
export default class Romanizer extends BaseTransliterator {
    private static readonly NA_LINE_CHARS;
    private static readonly N_CHARS;
    private static readonly TSU_CHARS;
    private static readonly CONSONANT_CHECK_THROUGH_ROMAN_CHARS;
    private static readonly DIGIT_CHECK_THROUGH_ROMAN_CHARS;
    private readonly optimizedMap;
    private readonly patternCache;
    private readonly MAX_CACHE_SIZE;
    /**
     * かな・カナ → ローマ字変換
     * 長文の場合には入力文字列をチャンク分割し、各チャンクの結果を直積（Cartesian product）で合成します。
     * @param str 変換対象文字列
     */
    transliterate(str: string): Combinations | null | {
        error: string;
    };
    /**
     * かな文字のローマ字パターンを配列で返す
     */
    protected generatePatternArray(str: string): Pattern;
    /**
     * 「ん」「ン」の特殊処理
     */
    private handleSpecialN;
    /**
     * 「っ」「ッ」の処理
     */
    private handleTsu;
    /**
     * 拗音の処理
     */
    private handleYoon;
    /**
     * ローマ字パターンの組み合わせを生成
     */
    protected generateAllCombinations(patterns: Pattern): Combinations;
    /**
     * 子音の組み合わせが有効かチェック
     */
    private isValidConsonantCombination;
    /**
     * 与えられた2つの変換候補のセットの直積を返すヘルパーメソッド
     * 各候補は [ [romaji文字列], parts ] の形式。
     */
    private combineCartesian;
    /**
     * 入力文字列をチャンク分割します。
     * @param str 変換対象文字列
     * @returns チャンクの配列
     */
    protected splitIntoChunks(str: string, size: number): string[];
}
//# sourceMappingURL=romanizer.d.ts.map