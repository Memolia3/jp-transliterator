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
  private static readonly NA_LINE_CHARS = new Set([
    "な",
    "に",
    "ぬ",
    "ね",
    "の",
    "ナ",
    "ニ",
    "ヌ",
    "ネ",
    "ノ",
  ]);

  private static readonly N_CHARS = new Set(["ん", "ン"]);
  private static readonly TSU_CHARS = new Set(["っ", "ッ"]);
  private static readonly CONSONANT_TRANS_ROMAN_CHARS = new Set([
    "ti",
    "chi",
    "hu",
    "fu",
    "zi",
    "ji",
    "tya",
    "cha",
    "tyu",
    "chu",
    "tyo",
    "cho",
  ]);

  private readonly optimizedMap: TransliterationTable = Object.freeze(
    Object.entries(
      kanaToRomajiMap as TransliterationTable
    ).reduce<TransliterationTable>((acc, [key, value]) => {
      key.split("|").forEach((char) => {
        acc[char] = value;
      });
      return acc;
    }, {})
  );

  private readonly patternCache = new Map<string, Pattern>();
  private readonly MAX_CACHE_SIZE = 1000;

  /**
   * かな・カナ → ローマ字変換
   * @param str 変換対象文字列
   * @param chunkSize チャンクサイズ
   */
  public override transliterate(
    str: string,
    chunkSize: number = 100 // チャンクサイズを小さくする
  ): Combinations | null | { error: string } {
    if (!str?.length) return null;

    try {
      const chunks = this.splitIntoChunks(str, chunkSize);
      let results: Combinations = [];

      for (const chunk of chunks) {
        const convertedChunk = Convert.toHalfWidth(chunk);
        const patternArray = this.generatePatternArray(convertedChunk);
        if (!patternArray.length) continue;

        const combinations = this.generateAllCombinations(patternArray);
        this.mergeResults(results, combinations);

        if (this.patternCache.size > this.MAX_CACHE_SIZE) {
          this.patternCache.clear();
        }
      }

      return results.length ? results : null;
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
  private mergeResults(target: Combinations, source: Combinations): void {
    for (const combination of source) {
      const [romaji, parts] = combination;

      // 子音チェック
      let isValid = true;
      for (let j = 0; j < parts.length - 1; j++) {
        const currentPart = parts[j];
        const nextPart = parts[j + 1];

        const hasMatchingConsonant =
          Romanizer.CONSONANT_TRANS_ROMAN_CHARS.has(nextPart);

        if (currentPart.length === 1 && hasMatchingConsonant) {
          const consonant = nextPart.charAt(0);
          if (!currentPart.startsWith(consonant)) {
            isValid = false;
            break; // Exit the loop if a mismatch is found
          }
        }
      }

      if (isValid) {
        target.push([romaji, parts]);
      }
    }
  }

  /**
   * かな文字のローマ字パターンを配列で返す
   */
  protected override generatePatternArray(str: string): Pattern {
    // キャッシュをチェック
    const cached = this.patternCache.get(str);
    if (cached) return cached;

    const patterns: Pattern = [];
    let i = 0;

    while (i < str.length) {
      // 「ん」「ン」の処理
      if (this.handleSpecialN(str, i, patterns)) {
        i++;
        continue;
      }

      // 「っ」「ッ」の処理
      if (this.handleTsu(str, i, patterns)) {
        i++;
        continue;
      }

      // 拗音の処理
      const yoonResult = this.handleYoon(str, i);
      if (yoonResult) {
        patterns.push(yoonResult.pattern);
        i += yoonResult.length;
        continue;
      }

      // 通常文字の処理
      const pattern = this.optimizedMap[str[i]];
      patterns.push(pattern || [str[i]]);
      i++;
    }

    // 結果をキャッシュ
    if (str.length <= 10) {
      // 短い文字列のみキャッシュ
      this.patternCache.set(str, patterns);
    }

    return patterns;
  }

  /**
   * 「ん」「ン」の特殊処理
   */
  private handleSpecialN(str: string, i: number, patterns: Pattern): boolean {
    if (
      Romanizer.N_CHARS.has(str[i]) &&
      i + 1 < str.length &&
      Romanizer.NA_LINE_CHARS.has(str[i + 1])
    ) {
      patterns.push(["nn"]);
      return true;
    } else if (Romanizer.N_CHARS.has(str[i])) {
      patterns.push(["n", "nn"]);
      return true;
    }
    return false;
  }

  /**
   * 「っ」「ッ」の処理
   */
  private handleTsu(str: string, i: number, patterns: Pattern): boolean {
    if (!Romanizer.TSU_CHARS.has(str[i])) return false;

    const tsuPattern = this.optimizedMap[str[i]];
    const nextChar = str[i + 1];
    if (nextChar && this.optimizedMap[nextChar]) {
      const nextCharPatterns = this.optimizedMap[nextChar];
      const validPatterns = nextCharPatterns.map((pattern) => {
        const consonant = pattern.charAt(0);
        if (Romanizer.CONSONANT_TRANS_ROMAN_CHARS.has(pattern)) {
          return consonant;
        }
        return pattern;
      });

      patterns.push(validPatterns);
      return true;
    }
    patterns.push(tsuPattern);
    return true;
  }

  /**
   * 拗音の処理
   */
  private handleYoon(
    str: string,
    i: number
  ): { pattern: OnePattern; length: number } | null {
    if (i + 1 >= str.length) return null;

    const twoChars = str.slice(i, i + 2);
    const pattern = this.optimizedMap[twoChars];
    if (pattern) {
      return { pattern, length: 2 };
    }
    return null;
  }

  /**
   * ローマ字パターンの組み合わせを生成
   */
  protected override generateAllCombinations(patterns: Pattern): Combinations {
    const results: Combinations = [];
    let currentBatch: { current: string[]; parts: string[]; index: number }[] =
      [{ current: [], parts: [], index: 0 }];

    while (currentBatch.length > 0) {
      const nextBatch: typeof currentBatch = [];

      for (const { current, parts, index } of currentBatch) {
        if (index === patterns.length) {
          results.push([[current.join("")], parts]);
          continue;
        }

        // パターンを文字数の昇順で処理
        const pattern = patterns[index];
        const shortToLong = pattern
          .reduce<string[][]>((acc, char) => {
            const len = char.length;
            acc[len] = acc[len] || [];
            acc[len].push(char);
            return acc;
          }, [])
          .flat();

        for (const char of shortToLong) {
          nextBatch.push({
            current: current.concat(char),
            parts: parts.concat(char),
            index: index + 1,
          });
        }
      }

      currentBatch = nextBatch;
    }

    return results;
  }
}
