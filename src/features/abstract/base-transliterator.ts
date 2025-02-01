import type {
  OnePattern,
  Pattern,
  Combinations,
} from "../../types/transliterate.types";

export default abstract class BaseTransliterator {
  protected convertedStr: Pattern = [];
  protected combinations: Combinations = [];

  /**
   * チャンク分けのメソッド
   * @param str 
   * @param size 
   * @returns chunks
   */
  protected splitIntoChunks(str: string, size: number): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < str.length; i += size) {
      chunks.push(str.slice(i, i + size));
    }
    return chunks;
  }

  protected abstract generatePatternArray(str: string): Pattern;

  protected abstract generateAllCombinations(patterns: Pattern): Combinations;

  public abstract transliterate(
    str: string
  ): OnePattern | Combinations | null | { error: string };
}
