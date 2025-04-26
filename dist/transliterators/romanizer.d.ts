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
    private static readonly TSU_PATTERNS;
    private static readonly N_PATTERNS;
    private readonly patternService;
    private readonly cartesianService;
    private readonly textConverterService;
    private readonly MAX_RESULT_SIZE;
    private readonly MAX_COMBINATIONS;
    private readonly SMALL_CHUNK_SIZE;
    private readonly LONG_TEXT_THRESHOLD;
    private readonly COMPLEX_PATTERNS_THRESHOLD;
    constructor();
    /**
     * 実際の変換プロセスを実装
     */
    protected processTransliteration(str: string, chunkSize: number): Combinations | null;
    /**
     * 特殊文字を含む文字列の処理
     */
    private processWithSpecialChars;
    /**
     * 長いセグメントの処理
     */
    private processLongSegment;
    /**
     * 特殊文字のない通常テキストの処理
     */
    private processNormalText;
    /**
     * 結果を結合する共通メソッド
     */
    private combineResults;
    /**
     * 文字列が特殊文字のみで構成されているかチェック
     */
    private isOnlySpecialCharacters;
    /**
     * 特殊文字のための直接マッピングを作成
     */
    private createDirectMapping;
    /**
     * パターン配列生成メソッド
     */
    protected generatePatternArray(str: string): Pattern;
    /**
     * 特殊文字チェック
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
     * すべての組み合わせを生成
     */
    protected generateAllCombinations(patterns: Pattern, originalStr?: string): Combinations;
    /**
     * 簡易版の組み合わせ生成 - メモリ効率優先
     */
    private generateSimplifiedCombinations;
    /**
     * 単純なケース（1-2パターン）の組み合わせ生成
     */
    private generateSimpleCombinations;
    /**
     * 単純な子音組み合わせ検証（2パターン用）
     */
    private isValidSimpleConsonantCombination;
}
//# sourceMappingURL=romanizer.d.ts.map