import Convert from "../utils/convert.utils";
import { romajiToKanaMap } from "../data/pattern";
import type {
  OnePattern,
  Pattern,
  Combinations,
} from "../types/transliterate.types";
import BaseTransliterator from "./abstract/base-transliterator";

/**
 * ローマ字 → かな・カナ変換クラス
 */
export default class Japanizer extends BaseTransliterator {
  private static readonly NA_LINE_CHARS = new Set([
    "na",
    "ni",
    "nu",
    "ne",
    "no",
  ]);
  private static readonly CONSONANTS = new Set([
    "b",
    "c",
    "d",
    "f",
    "g",
    "h",
    "j",
    "k",
    "l",
    "m",
    "p",
    "q",
    "r",
    "s",
    "t",
    "v",
    "w",
    "x",
    "y",
    "z",
  ]);

  private static readonly PATTERN_LENGTHS = [4, 3, 2, 1] as const;

  /**
   * ローマ字 → かな・カナ変換
   * @param str 変換対象文字列
   * @param chunkSize チャンクサイズ
   */
  public override transliterate(
    str: string,
    chunkSize: number = 1000
  ): OnePattern | null | { error: string } {
    if (!str?.length) return null;

    try {
      const chunks = this.splitIntoChunks(str, chunkSize);
      const results: OnePattern[] = [];

      for (const chunk of chunks) {
        const convertedChunk = Convert.toHalfWidth(chunk);
        const patternArray = this.generatePatternArray(convertedChunk);
        if (!patternArray.length) continue;

        const combinations = this.generateAllCombinations(patternArray);
        const kanaPattern = this.transformCombination(combinations);
        results.push(kanaPattern);
      }

      return results.length ? this.mergeResults(results) : null;
    } catch (e) {
      return {
        error: `変換エラーが発生しました: ${
          e instanceof Error ? e.message : String(e)
        }`,
      };
    }
  }

  /**
   * チャンク処理の結果を合成
   */
  private mergeResults(results: OnePattern[]): OnePattern {
    return [
      results.map((r) => r[0]).join(""),
      results.map((r) => r[1]).join(""),
    ];
  }

  /**
   * ローマ字のかな文字パターンを配列で返す
   */
  protected generatePatternArray(str: string): Pattern {
    const patterns: Pattern = [];
    let i = 0;

    while (i < str.length) {
      // 「ん」の特殊処理
      if (this.handleSpecialN(str, i, patterns)) {
        i++;
        continue;
      }

      // 促音の処理
      if (this.handleDoubleConsonant(str, i, patterns)) {
        i++;
        continue;
      }

      // 通常のパターンマッチング
      const matched = this.matchPattern(str, i);
      if (matched) {
        patterns.push(matched.pattern);
        i += matched.length;
        continue;
      }

      // マッチしない文字はそのまま追加
      patterns.push([str[i], str[i]]);
      i++;
    }

    return patterns;
  }

  /**
   * 「ん」の特殊処理
   */
  private handleSpecialN(str: string, i: number, patterns: Pattern): boolean {
    if (
      str[i] === "n" &&
      i + 1 < str.length &&
      Japanizer.NA_LINE_CHARS.has(str.slice(i + 1, i + 3))
    ) {
      patterns.push(romajiToKanaMap["n"]);
      return true;
    }
    return false;
  }

  /**
   * 促音の処理
   */
  private handleDoubleConsonant(
    str: string,
    i: number,
    patterns: Pattern
  ): boolean {
    if (
      i + 1 < str.length &&
      str[i] === str[i + 1] &&
      Japanizer.CONSONANTS.has(str[i])
    ) {
      patterns.push(romajiToKanaMap["xtu"]);
      return true;
    }
    return false;
  }

  /**
   * パターンマッチング
   */
  private matchPattern(
    str: string,
    i: number
  ): { pattern: OnePattern; length: number } | null {
    for (const length of Japanizer.PATTERN_LENGTHS) {
      if (i + length <= str.length) {
        const chars = str.slice(i, i + length);
        const pattern = romajiToKanaMap[chars];
        if (pattern) {
          return { pattern, length };
        }
      }
    }
    return null;
  }

  /**
   * ひらがな・カタカナのパターンを生成
   */
  protected override generateAllCombinations(patterns: Pattern): Combinations {
    const hiragana = patterns.map((pair) => pair[0]).join("");
    const katakana = patterns.map((pair) => pair[1]).join("");

    return [[[Convert.toFullWidth(hiragana)], [Convert.toFullWidth(katakana)]]];
  }

  /**
   * コンビネーション変換
   */
  private transformCombination(combination: Combinations): OnePattern {
    const [[hiragana], [katakana]] = combination[0];
    return [hiragana, katakana];
  }
}
