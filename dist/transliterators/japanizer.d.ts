import { AbstractTransliterator } from "../core/abstract-transliterator";
import type { Pattern, Combinations } from "../types/transliterate.types";
/**
 * ローマ字 → かな・カナ変換クラス
 */
export declare class Japanizer extends AbstractTransliterator {
    private static readonly SPECIAL_CHARS;
    private static readonly VOWEL_CHARS;
    private static readonly N_CHARS;
    private static readonly SMALL_CHARS;
    private static readonly SPECIAL_CHARS_N;
    private static readonly HALF_WIDTH_SPECIAL_CHARS;
    private static readonly FULL_WIDTH_SPECIAL_CHARS;
    private static readonly PUNCTUATIONS;
    private readonly patternService;
    private readonly textConverterService;
    private readonly MAX_RESULT_SIZE;
    constructor();
    /**
     * 実際の変換プロセスを実装
     */
    protected processTransliteration(str: string, chunkSize: number): Combinations | null;
    /**
     * 結果配列をマージ
     */
    private mergeResults;
    /**
     * 特殊文字かどうかをチェック（単一文字用）
     */
    private isSpecialCharacter;
    /**
     * 文字列が特殊文字のみかどうかをチェック
     */
    private isOnlySpecialCharacters;
    /**
     * 特殊文字のための直接マッピングを作成
     */
    private createDirectMapping;
    /**
     * 組み合わせを全角文字列に変換
     */
    private toFullWidthCombinations;
    /**
     * パターン配列生成メソッド
     */
    protected generatePatternArray(str: string): Pattern;
    /**
     * 特殊ケースの処理
     */
    private handleSpecialCases;
    /**
     * 'n'の特殊処理
     */
    private handleSpecialN;
    /**
     * 文字が子音かどうかをチェック
     */
    private isConsonant;
    /**
     * すべての組み合わせを生成
     */
    protected generateAllCombinations(patterns: Pattern): Combinations;
}
//# sourceMappingURL=japanizer.d.ts.map