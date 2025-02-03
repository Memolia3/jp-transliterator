/**
 * 文字変換ユーティリティ
 * メモリ効率と実行速度に最適化されたバージョン
 */
export default class Convert {
  private static readonly FULL_TO_HALF_REGEX = /[Ａ-Ｚａ-ｚ０-９！-～]/g;
  private static readonly HALF_TO_FULL_REGEX = /[A-Za-z0-9!-~]/g;
  private static readonly FULL_SYMBOLS_REGEX = /[、。・ーー「」‐]/g;
  private static readonly HALF_SYMBOLS_REGEX = /[，．／［］]/g;

  private static readonly fullToHalfMap = Object.freeze({
    "、": ",",
    "。": ".",
    "・": "/",
    "ー": "-",
    "‐": "-",
    "「": "[",
    "」": "]"
  } as const);

  private static readonly halfToFullMap = Object.freeze({
    "，": "、",
    "．": "。",
    "／": "・",
    "［": "「",
    "］": "」"
  } as const);

  /**
   * 全角文字を半角に変換
   * @param str 変換対象文字列
   * @returns 変換後の文字列
   */
  public static toHalfWidth(str: string): string {
    if (!str?.length) return str;

    return str
      .replace(
        Convert.FULL_TO_HALF_REGEX,
        char => String.fromCharCode(char.charCodeAt(0) - 0xfee0)
      )
      .replace(
        Convert.FULL_SYMBOLS_REGEX,
        char => Convert.fullToHalfMap[char as keyof typeof Convert.fullToHalfMap] || char
      );
  }

  /**
   * 半角文字を全角に変換
   * @param str 変換対象文字列
   * @returns 変換後の文字列
   */
  public static toFullWidth(str: string): string {
    if (!str?.length) return str;

    return str
      .replace(
        Convert.HALF_TO_FULL_REGEX,
        char => String.fromCharCode(char.charCodeAt(0) + 0xfee0)
      )
      .replace(
        Convert.HALF_SYMBOLS_REGEX,
        char => Convert.halfToFullMap[char as keyof typeof Convert.halfToFullMap] || char
      );
  }
}
