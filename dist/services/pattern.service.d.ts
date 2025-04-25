import { Combinations } from "../types/transliterate.types";
import { AllInputPatterns, InputPatternMatrix, PatternSetArray } from "../types/pattern.types";
import type { TransliterationTable } from "../types/transliterate.types";
/**
 * パターン処理サービス
 * 変換パターンの管理と検索を担当
 */
export declare class PatternService {
    private readonly mapTrie;
    private specialPatterns;
    private specialCharSets;
    private readonly patternCache;
    private readonly searchCache;
    private readonly longestMatchCache;
    private readonly MAX_CACHE_SIZE;
    private readonly MAX_SEARCH_CACHE_SIZE;
    private readonly MAX_MATCH_CACHE_SIZE;
    /**
     * コンストラクタ
     * @param transliterationMap 変換マップ
     */
    constructor(transliterationMap: TransliterationTable);
    /**
     * 特殊文字セットを初期化
     * @param specialSets 特殊文字セットの配列
     */
    initializeSpecialSets(specialSets: Set<string>[]): void;
    /**
     * すべてのキャッシュをクリア
     */
    private clearCaches;
    /**
     * キーに対応するパターンを検索
     * @param key 検索キー
     * @returns パターン配列または未定義
     */
    search(key: string): string[] | null;
    /**
     * マップの内容をTrieと特殊パターンに振り分ける
     * @param optimizedMap 最適化されたマップ
     */
    private initializePatternContainers;
    /**
     * 特殊パターンを取得
     * @param char 対象文字
     */
    getSpecialPatterns(char: string): string[] | null;
    /**
     * 文字列の中で最長一致するパターンを検索
     * @param str 検索対象文字列
     * @param startIndex 開始インデックス
     * @param specialSets 特殊文字のセット（Trieから除外するための）
     */
    findLongestMatch(str: string, startIndex: number, ...specialSets: Set<string>[]): {
        pattern: string[];
        length: number;
    } | null;
    /**
     * 入力文字列に対応するすべてのパターンを取得
     * @param str 入力文字列
     */
    getInputPatterns(str: string): {
        pattern: string[];
        char: string;
    }[];
    /**
     * 変換結果から入力文字列を取得
     * @param combinations Romanizer/Japanizerからの変換結果
     * @param index 取得するインデックス（デフォルトは0）
     * @returns 入力文字列
     */
    getInput(combinations: Combinations | string, index?: number): string | string[];
    /**
     * キャッシュからパターンを取得、またはキャッシュに追加
     * @param key キャッシュキー
     * @param generator パターン生成関数
     */
    getOrCachePatterns<T>(key: string, generator: () => T): T;
    /**
     * 複合パターン（2文字以上の連続）を取得
     * @param str 入力文字列
     * @param startIndex 開始インデックス
     */
    getCompoundPatterns(str: string, startIndex: number): {
        patterns: string[][];
        length: number;
    }[];
    /**
     * 変換結果から全ての入力パターンを2次元配列で取得
     * @param combinations Romanizer/Japanizerからの変換結果
     * @returns 入力パターンの2次元配列
     */
    getAllRomajiPatterns(combinations: Combinations): InputPatternMatrix;
    /**
     * 変換結果から日本語文字ごとのカンマ区切りパターンを2次元配列で取得
     * @param combinations Romanizer/Japanizerからの変換結果
     * @returns カンマ区切りされた入力パターンの2次元配列
     */
    getCharacterPatterns(combinations: Combinations): InputPatternMatrix;
    /**
     * 変換結果から完全な入力パターン情報を取得
     * @param combinations Romanizer/Japanizerからの変換結果
     * @param originalText 元の日本語テキスト（オプション）
     * @returns 全入力パターン情報
     */
    getCompletePatterns(combinations: Combinations): AllInputPatterns;
    /**
     * 変換結果を標準的なパターンセット配列に変換
     * @param combinations Romanizer/Japanizerからの変換結果
     * @returns パターンセット配列
     */
    toPatternSetArray(combinations: Combinations): PatternSetArray;
    /**
     * 指定された文字列のパターンを配列形式で取得します
     * @param query 検索する文字列またはCombinations
     * @returns 可能なローマ字入力パターンの2次元配列
     */
    getInputMatrix(query: string): string[][];
    /**
     * 日本語文字列を文字ごとに分割します
     * @param japaneseText 分割する日本語文字列
     * @returns 分割された文字の配列
     */
    segmentJapaneseText(japaneseText: string): string[];
}
//# sourceMappingURL=pattern.service.d.ts.map