/**
 * 変換関数ユーティリティ
 */
export default class Convert {
  // 全角英数字記号を半角に変換
  public toHalfWidthEnhanced(str: string): string {
    return str
      .replace(/[Ａ-Ｚａ-ｚ０-９！-～]/g, (s) => {
        return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
      })
      .replace(/、/g, ",")
      .replace(/。/g, ".")
      .replace(/・/g, "/");
  }

  // 半角英数字記号を全角に変換
  public toFullWidthEnhanced(str: string): string {
    return str
      .replace(/[A-Za-z0-9!-~]/g, (s) => {
        return String.fromCharCode(s.charCodeAt(0) + 0xfee0);
      })
      .replace(/，/g, "、")
      .replace(/\．/g, "。")
      .replace(/\／/g, "・")
      .replace(/［/g, "「")
      .replace(/］/g, "」");
  }
}
