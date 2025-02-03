/**
 * 文字変換ユーティリティ
 * メモリ効率と実行速度に最適化されたバージョン
 */
export default class Convert {
    private static readonly FULL_TO_HALF_REGEX;
    private static readonly HALF_TO_FULL_REGEX;
    private static readonly FULL_SYMBOLS_REGEX;
    private static readonly HALF_SYMBOLS_REGEX;
    private static readonly fullToHalfMap;
    private static readonly halfToFullMap;
    /**
     * 全角文字を半角に変換
     * @param str 変換対象文字列
     * @returns 変換後の文字列
     */
    static toHalfWidth(str: string): string;
    /**
     * 半角文字を全角に変換
     * @param str 変換対象文字列
     * @returns 変換後の文字列
     */
    static toFullWidth(str: string): string;
}
//# sourceMappingURL=convert.utils.d.ts.map