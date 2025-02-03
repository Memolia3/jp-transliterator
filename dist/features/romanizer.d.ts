import type { Pattern, Combinations } from "../types/transliterate.types";
import BaseTransliterator from "./abstract/base-transliterator";
/**
 * かな・カナ → ローマ字変換クラス
 */
export default class Romanizer extends BaseTransliterator {
    private static readonly NA_LINE_CHARS;
    private static readonly N_CHARS;
    private static readonly TSU_CHARS;
    private readonly optimizedMap;
    private readonly patternCache;
    private readonly MAX_CACHE_SIZE;
    /**
     * かな・カナ → ローマ字変換
     * @param str 変換対象文字列
     * @param chunkSize チャンクサイズ
     */
    transliterate(str: string, chunkSize?: number): Combinations | null | {
        error: string;
    };
    /**
     * チャンク処理の結果を合成
     */
    private mergeResults;
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
}
//# sourceMappingURL=romanizer.d.ts.map