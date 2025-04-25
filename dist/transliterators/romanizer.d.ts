import { AbstractTransliterator } from "../core/abstract-transliterator";
import type { Pattern, Combinations } from "../types/transliterate.types";
/**
 * かな・カナ → ローマ字変換クラス
 */
export declare class Romanizer extends AbstractTransliterator {
    private static readonly NA_LINE_CHARS;
    private static readonly N_CHARS;
    private static readonly TSU_CHARS;
    private static readonly CONSONANT_CHECK_THROUGH_ROMAN_CHARS;
    private static readonly HALF_WIDTH_SPECIAL_CHARS;
    private static readonly FULL_WIDTH_SPECIAL_CHARS;
    private static readonly PUNCTUATIONS;
    private readonly patternService;
    private readonly cartesianService;
    private readonly textConverterService;
    private readonly MAX_RESULT_SIZE;
    constructor();
    /**
     * 実際の変換プロセスを実装
     */
    protected processTransliteration(str: string, chunkSize: number): Combinations | null;
    /**
     * 文字列が特殊文字のみで構成されているかチェック
     */
    private isOnlySpecialCharacters;
    /**
     * 特殊文字のための直接マッピングを作成
     */
    private createDirectMapping;
    /**
     * パターンを単純化する追加メソッド
     */
    private simplifyPatterns;
    /**
     * パターン配列生成メソッド
     * 入力文字列から変換パターンの配列を生成
     */
    protected generatePatternArray(str: string): Pattern;
    /**
     * 特殊文字かどうかをチェック（単一文字用）
     */
    private isSpecialCharacter;
    /**
     * 「ん」の特殊処理
     */
    private handleSpecialN;
    /**
     * 「っ」の特殊処理
     */
    private handleTsu;
    /**
     * 子音の組み合わせが有効かどうかをチェック
     */
    private isValidConsonantCombination;
    /**
     * すべての組み合わせを生成
     */
    protected generateAllCombinations(patterns: Pattern, originalStr?: string): Combinations;
}
//# sourceMappingURL=romanizer.d.ts.map