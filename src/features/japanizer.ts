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
  /**
   * ローマ字 → かな・カナ変換
   */
  public override transliterate(
    str: string,
    chunkSize: number = 1000
  ): OnePattern | null | { error: string } {
    try {
      if (!str) {
        return null;
      }

      const chunks = this.splitIntoChunks(str, chunkSize);
      const results: OnePattern[] = [];

      for (const chunk of chunks) {
        const convertedChunk = new Convert().toHalfWidthEnhanced(chunk);
        const patternArray = this.generatePatternArray(convertedChunk);
        const combinations = this.generateAllCombinations(patternArray);
        const kanaPattern = this.transformCombination(combinations);
        results.push(kanaPattern);
      }

      return this.mergeResults(results);
    } catch (e) {
      return { error: `An error occurred: ${e}` };
    }
  }

  private mergeResults(results: OnePattern[]): OnePattern {
    return [
      results.map((r) => r[0]).join(""),
      results.map((r) => r[1]).join(""),
    ];
  }

  /**
   * ローマ字のかな文字パターンを配列で返す
   * @param str - かな文字変換対象文字列
   * @returns patterns - 各文字ごとのかな文字パターン配列
   */
  protected generatePatternArray(str: string): Pattern {
    const patterns: Pattern = [];
    let i: number = 0;
    let matchedPattern: OnePattern;

    const checkAndAddPattern = (length: number): boolean => {
      if (i + length <= str.length) {
        const chars = str.slice(i, i + length);
        matchedPattern = romajiToKanaMap[chars];
        if (matchedPattern) {
          patterns.push(matchedPattern);
          i += length;
          return true;
        }
      }
      return false;
    };

    const isNextNaLine = (): boolean => {
      if (i + 1 < str.length) {
        const nextChars = str.slice(i + 1, i + 3);
        return ["na", "ni", "nu", "ne", "no"].includes(nextChars);
      }
      return false;
    };

    const isDoubleConsonant = (): boolean => {
      if (i + 1 < str.length) {
        const currentChar = str[i];
        const nextChar = str[i + 1];
        return (
          currentChar === nextChar &&
          "bcdfghjklmpqrstvwxyz".includes(currentChar)
        );
      }
      return false;
    };

    while (i < str.length) {
      if (str[i] === "n" && isNextNaLine()) {
        patterns.push(romajiToKanaMap["n"]);
        i++;
        continue;
      }

      if (isDoubleConsonant()) {
        patterns.push(romajiToKanaMap["xtu"]);
        i++;
        continue;
      }

      if ([4, 3, 2].some(checkAndAddPattern)) continue;

      matchedPattern = romajiToKanaMap[str[i]];
      if (matchedPattern) {
        patterns.push(matchedPattern);
      } else {
        patterns.push([str[i], str[i]]);
      }
      i++;
    }

    return patterns;
  }

  /**
   * ひらがな・カタカナのパターンを返す
   * @param patterns
   * @returns [[[hiragana], [katakana]]]
   */
  protected override generateAllCombinations(patterns: Pattern): Combinations {
    const converter = new Convert();
    const hiragana = patterns.map((pair) => pair[0]).join("");
    const katakana = patterns.map((pair) => pair[1]).join("");

    return [
      [
        [converter.toFullWidthEnhanced(hiragana)],
        [converter.toFullWidthEnhanced(katakana)],
      ],
    ];
  }

  /**
   * コンビネーション型変換
   * @param combination
   * @returns [hiragana, katakana] [[[]]]の配列を[]にする
   */
  private transformCombination(combination: Combinations) {
    const [[hiragana], [katakana]] = combination[0];
    return [hiragana, katakana];
  }
}
