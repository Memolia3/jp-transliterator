/**
 * テキスト変換サービス
 * 全角/半角変換やテキスト正規化処理を提供
 */
export class TextConverterService {
  /**
   * 全角文字を半角に変換
   * @param str 変換対象文字列
   */
  public toHalfWidth(str: string): string {
    if (!str) return "";

    // 全角英数字を半角に変換
    const alpha = str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => {
      return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
    });

    // 全角スペースを半角に変換
    return alpha.replace(/　/g, " ");
  }

  /**
   * 半角文字を全角に変換
   * @param str 変換対象文字列
   */
  public toFullWidth(str: string): string {
    if (!str) return "";

    // 半角英数字を全角に変換
    const alpha = str.replace(/[A-Za-z0-9]/g, (s) => {
      return String.fromCharCode(s.charCodeAt(0) + 0xfee0);
    });

    // 半角スペースを全角に変換
    return alpha.replace(/ /g, "　");
  }

  /**
   * カタカナをひらがなに変換
   * @param str 変換対象文字列
   */
  public katakanaToHiragana(str: string): string {
    return str.replace(/[\u30a1-\u30f6]/g, (match) => {
      const chr = match.charCodeAt(0) - 0x60;
      return String.fromCharCode(chr);
    });
  }

  /**
   * ひらがなをカタカナに変換
   * @param str 変換対象文字列
   */
  public hiraganaToKatakana(str: string): string {
    return str.replace(/[\u3041-\u3096]/g, (match) => {
      const chr = match.charCodeAt(0) + 0x60;
      return String.fromCharCode(chr);
    });
  }

  /**
   * 特殊記号を正規化
   * @param str 変換対象文字列
   */
  public normalizeSymbols(str: string): string {
    return str
      .replace(/[‐－―]/g, "-") // ハイフン系を半角ハイフンに
      .replace(/[～〜]/g, "~") // チルダ系を半角チルダに
      .replace(/[""″″]/g, '"') // 引用符を半角引用符に
      .replace(/[''′′]/g, "'") // アポストロフィを半角に
      .replace(/[　]/g, " "); // 全角スペースを半角に
  }

  /**
   * 入力文字列を正規化（複数の正規化を一度に適用）
   * @param str 変換対象文字列
   */
  public normalizeInput(str: string): string {
    return this.normalizeSymbols(this.toHalfWidth(str));
  }
}
