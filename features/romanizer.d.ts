import type { Pattern, Combinations } from "../types/transliterate.types";
import BaseTransliterator from "./abstract/base-transliterator";
/**
 * かな・カナ → ローマ字変換クラス
 */
export default class Romanizer extends BaseTransliterator {
    private readonly NA_LINE_CHARS;
    private readonly N_CHARS;
    private readonly TSU_CHARS;
    private optimizedMap;
    /**
     * かな・カナ → ローマ字変換
     * @param str - ローマ字変換対象文字列
     * @returns combinations Array<[string[文章], string[１文字識別可能文章]]>
     */
    transliterate(str: string, chunkSize?: number): Combinations | null | {
        error: string;
    };
    /**
     * かな文字のローマ字パターンを配列で返す
     * @param str - ローマ字変換対象文字列
     * @returns patterns - 各文字ごとのローマ字パターン配列
     */
    protected generatePatternArray(str: string): Pattern;
    /**
     * 全てのローマ字パターンを出力
     * @param patterns
     * @returns result Array<[string[文章], string[１文字識別可能文章]]>
     */
    protected generateAllCombinations(patterns: Pattern): Combinations;
}
//# sourceMappingURL=romanizer.d.ts.map