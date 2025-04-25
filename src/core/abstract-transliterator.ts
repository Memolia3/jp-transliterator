import type {
  OnePattern,
  Pattern,
  Combinations,
} from "../types/transliterate.types";
import { ITransliterator, TransliterationOptions } from "./i-transliterator";
import { TextProcessor } from "./text-processor";

/**
 * 変換処理の抽象基底クラス
 */
export abstract class AbstractTransliterator implements ITransliterator {
  // テキスト処理ユーティリティ
  protected readonly textProcessor: TextProcessor;

  constructor() {
    this.textProcessor = new TextProcessor();
  }

  /**
   * エラーハンドリングを含む変換プロセス
   * @param str 変換対象文字列
   * @param options 変換オプション
   */
  public transliterate(
    str: string,
    options?: TransliterationOptions
  ): OnePattern | Combinations | null | { error: string } {
    const chunkSize = options?.chunkSize ?? 0;

    if (!str?.length) return null;

    try {
      return this.processTransliteration(str, chunkSize);
    } catch (e) {
      return {
        error: `変換エラーが発生しました: ${
          e instanceof Error ? e.message : String(e)
        }`,
      };
    }
  }

  /**
   * 実際の変換処理を実装するメソッド
   * サブクラスでオーバーライドされる
   * @param str 変換対象文字列
   * @param chunkSize チャンクサイズ
   */
  protected abstract processTransliteration(
    str: string,
    chunkSize: number
  ): OnePattern | Combinations | null;

  /**
   * パターン配列生成メソッド
   * 入力文字列から変換パターンの配列を生成
   * @param str 入力文字列
   */
  protected abstract generatePatternArray(str: string): Pattern;

  /**
   * 組み合わせ生成メソッド
   * パターン配列からすべての有効な組み合わせを生成
   * @param patterns パターン配列
   */
  protected abstract generateAllCombinations(patterns: Pattern): Combinations;
}
