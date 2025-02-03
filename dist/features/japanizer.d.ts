import type { OnePattern, Pattern, Combinations } from "../types/transliterate.types";
import BaseTransliterator from "./abstract/base-transliterator";
/**
 * ローマ字 → かな・カナ変換クラス
 */
export default class Japanizer extends BaseTransliterator {
    private static readonly NA_LINE_CHARS;
    private static readonly CONSONANTS;
    private static readonly PATTERN_LENGTHS;
    /**
     * ローマ字 → かな・カナ変換
     * @param str 変換対象文字列
     * @param chunkSize チャンクサイズ
     */
    transliterate(str: string, chunkSize?: number): OnePattern | null | {
        error: string;
    };
    /**
     * チャンク処理の結果を合成
     */
    private mergeResults;
    /**
     * ローマ字のかな文字パターンを配列で返す
     */
    protected generatePatternArray(str: string): Pattern;
    /**
     * 「ん」の特殊処理
     */
    private handleSpecialN;
    /**
     * 促音の処理
     */
    private handleDoubleConsonant;
    /**
     * パターンマッチング
     */
    private matchPattern;
    /**
     * ひらがな・カタカナのパターンを生成
     */
    protected generateAllCombinations(patterns: Pattern): Combinations;
    /**
     * コンビネーション変換
     */
    private transformCombination;
}
//# sourceMappingURL=japanizer.d.ts.map