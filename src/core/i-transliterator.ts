import { OnePattern, Combinations } from "../types/transliterate.types";

/**
 * 変換オプション
 */
export interface TransliterationOptions {
  /**
   * チャンクサイズ
   * 0の場合は自動
   */
  chunkSize?: number;
}

/**
 * 変換機能の共通インターフェース
 */
export interface ITransliterator {
  /**
   * 変換メソッド
   * 入力文字列を変換結果に変換
   * @param str 変換対象文字列
   * @param options 変換オプション
   */
  transliterate(
    str: string,
    options?: TransliterationOptions
  ): OnePattern | Combinations | null | { error: string };
}
