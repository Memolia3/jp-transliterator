/**
 * テキスト変換サービス
 * 全角/半角変換やテキスト正規化処理を提供
 */
export declare class TextConverterService {
    /**
     * 全角文字を半角に変換
     * @param str 変換対象文字列
     */
    toHalfWidth(str: string): string;
    /**
     * 半角文字を全角に変換
     * @param str 変換対象文字列
     */
    toFullWidth(str: string): string;
    /**
     * カタカナをひらがなに変換
     * @param str 変換対象文字列
     */
    katakanaToHiragana(str: string): string;
    /**
     * ひらがなをカタカナに変換
     * @param str 変換対象文字列
     */
    hiraganaToKatakana(str: string): string;
    /**
     * 特殊記号を正規化
     * @param str 変換対象文字列
     */
    normalizeSymbols(str: string): string;
    /**
     * 入力文字列を正規化（複数の正規化を一度に適用）
     * @param str 変換対象文字列
     */
    normalizeInput(str: string): string;
}
//# sourceMappingURL=text-converter.service.d.ts.map