import Convert from "../utils/convert.utils";
import { kanaToRomajiMap } from "../data/pattern";
import type {
  TransliterationTable,
  OnePattern,
  Pattern,
  Combinations,
} from "../types/transliterate.types";
import BaseTransliterator from "./abstract/base-transliterator";

/**
 * かな・カナ → ローマ字変換クラス
 */
export default class Romanizer extends BaseTransliterator {
  private readonly NA_LINE_CHARS: Readonly<string> = "なにぬねのナニヌネノ";
  private readonly N_CHARS: Readonly<string> = "んン";
  private readonly TSU_CHARS: Readonly<string> = "っッ";

  // かな・カナを区切ったマップ
  private optimizedMap: TransliterationTable = Object.entries(
    kanaToRomajiMap as TransliterationTable
  ).reduce<TransliterationTable>((acc, [key, value]) => {
    key.split("|").forEach((char) => {
      acc[char] = value;
    });
    return acc;
  }, {});

  /**
   * かな・カナ → ローマ字変換
   * @param str - ローマ字変換対象文字列
   * @returns combinations Array<[string[文章], string[１文字識別可能文章]]>
   */
  public override transliterate(
    str: string,
    chunkSize: number = 1000
  ): Combinations | null | { error: string } {
    try {
      if (!str) {
        return null;
      }

      const chunks = this.splitIntoChunks(str, chunkSize);
      const results: Combinations = [];

      for (const chunk of chunks) {
        const convertedChunk = new Convert().toHalfWidthEnhanced(chunk);
        const patternArray = this.generatePatternArray(convertedChunk);
        const combinations = this.generateAllCombinations(patternArray);
        results.push(...combinations);
      }

      return results;
    } catch (e) {
      return { error: `An error occurred: ${e}` };
    }
  }

  /**
   * かな文字のローマ字パターンを配列で返す
   * @param str - ローマ字変換対象文字列
   * @returns patterns - 各文字ごとのローマ字パターン配列
   */
  protected override generatePatternArray(str: string): Pattern {
    const patterns: Pattern = [];
    let i: number = 0;
    let matchedPattern: OnePattern;

    while (i < str.length) {
      // 「ん」「ン」の場合の処理
      if (this.N_CHARS.includes(str[i])) {
        patterns.push(
          i + 1 < str.length && this.NA_LINE_CHARS.includes(str[i + 1])
            ? ["nn"]
            : ["n", "nn"]
        );
        i++;
        continue;
      }

      // 「っ」「ッ」の場合の処理
      if (this.TSU_CHARS.includes(str[i])) {
        const tsuPattern = this.optimizedMap[str[i]];
        const nextChar = str[i + 1];
        if (nextChar && this.optimizedMap[nextChar]) {
          const nextCharPattern = this.optimizedMap[nextChar][0];
          const consonant = nextCharPattern.charAt(0);
          patterns.push([...tsuPattern, consonant]);
        } else {
          patterns.push(tsuPattern);
        }
        i++;
        continue;
      }

      // 拗音の処理
      if (i + 1 < str.length) {
        const twoChars: string = str.slice(i, i + 2);
        matchedPattern = this.optimizedMap[twoChars];
        if (matchedPattern) {
          patterns.push(matchedPattern);
          i += 2;
          continue;
        }
      }

      // 単音の処理
      matchedPattern = this.optimizedMap[str[i]];
      if (matchedPattern) {
        patterns.push(matchedPattern);
      } else {
        patterns.push([str[i]]);
      }
      i++;
    }

    return patterns;
  }

  /**
   * 全てのローマ字パターンを出力
   * @param patterns
   * @returns result Array<[string[文章], string[１文字識別可能文章]]>
   */
  protected override generateAllCombinations(patterns: Pattern): Combinations {
    const result: Combinations = [];

    function backtrack(current: string[], index: number) {
      if (index === patterns.length) {
        result.push([[current.join("")], current]);
        return;
      }

      for (const char of patterns[index]) {
        backtrack([...current, char], index + 1);
      }
    }

    backtrack([], 0);
    return result;
  }
}
