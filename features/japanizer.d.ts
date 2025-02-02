import type { OnePattern, Pattern, Combinations } from "../types/transliterate.types";
import BaseTransliterator from "./abstract/base-transliterator";
/**
 * ローマ字 → かな・カナ変換クラス
 */
export default class Japanizer extends BaseTransliterator {
    /**
     * ローマ字 → かな・カナ変換
     */
    transliterate(str: string, chunkSize?: number): OnePattern | null | {
        error: string;
    };
    private mergeResults;
    /**
     * ローマ字のかな文字パターンを配列で返す
     * @param str - かな文字変換対象文字列
     * @returns patterns - 各文字ごとのかな文字パターン配列
     */
    protected generatePatternArray(str: string): Pattern;
    /**
     * ひらがな・カタカナのパターンを返す
     * @param patterns
     * @returns [[[hiragana], [katakana]]]
     */
    protected generateAllCombinations(patterns: Pattern): Combinations;
    /**
     * コンビネーション型変換
     * @param combination
     * @returns [hiragana, katakana] [[[]]]の配列を[]にする
     */
    private transformCombination;
}
//# sourceMappingURL=japanizer.d.ts.map