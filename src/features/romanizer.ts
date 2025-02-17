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
  private static readonly CONSONANT_CHECK_THROUGH_ROMAN_CHARS = new Set([
    "a",
    "i",
    "u",
    "e",
    "o",
    "n",
  ]);
  private static readonly DIGIT_CHECK_THROUGH_ROMAN_CHARS = new Set([
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
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
   * 長文の場合には入力文字列をチャンク分割し、各チャンクの結果を直積（Cartesian product）で合成します。
   * @param str 変換対象文字列
   */
  public override transliterate(
    str: string
  ): Combinations | null | { error: string } {
    if (!str?.length) return null;
    try {
      const chunks = this.splitIntoChunks(str, 0);
      let finalResults: Combinations = [];
      for (const chunk of chunks) {
        const convertedChunk = Convert.toHalfWidth(chunk);
        const patternArray = this.generatePatternArray(convertedChunk);
        if (!patternArray.length) continue;

        let combinations = this.generateAllCombinations(patternArray);
        if (combinations.length === 0) {
          // フォールバック: 各パターンの先頭候補を使用
          const fallbackParts = patternArray.map((pat) => pat[0]);
          const fallbackRomaji = fallbackParts.join("");
          combinations.push([[fallbackRomaji], fallbackParts]);
        }

        if (finalResults.length === 0) {
          finalResults = combinations;
        } else {
          finalResults = this.combineCartesian(finalResults, combinations);
        }

        if (this.patternCache.size > this.MAX_CACHE_SIZE) {
          this.patternCache.clear();
        }
      }
      return finalResults.length ? finalResults : null;
    } catch (e) {
      return {
        error: `変換エラーが発生しました: ${
          e instanceof Error ? e.message : String(e)
        }`,
      };
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
      const char = str[i];
      const mapping = this.optimizedMap[char];
      // mapping が undefined または空配列なら必ずフォールバック候補配列を返す
      if (mapping === undefined || mapping.length === 0) {
        patterns.push([char]);
      } else {
        patterns.push(mapping);
      }
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

    const nextChar = str[i + 1];
    if (nextChar && this.optimizedMap[nextChar]) {
      const nextCharPatterns = this.optimizedMap[nextChar];
      const validPatterns = nextCharPatterns.map((pattern) => {
        const consonant = pattern.charAt(0);
        return consonant;
      });

      patterns.push(validPatterns);
      return true;
    }
    patterns.push(this.optimizedMap[str[i]]);
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
    // バッチサイズを制限
    const MAX_BATCH_SIZE = 10000;
    let currentBatch: { current: string[]; parts: string[]; index: number }[] =
      [{ current: [], parts: [], index: 0 }];

    while (currentBatch.length > 0) {
      const nextBatch: typeof currentBatch = [];

      for (const { current, parts, index } of currentBatch) {
        if (index === patterns.length) {
          if (this.isValidConsonantCombination(parts)) {
            results.push([[current.join("")], parts]);
          }
          continue;
        }

        const pattern = patterns[index];

        for (const char of pattern) {
          if (nextBatch.length < MAX_BATCH_SIZE) {
            const newCurrent = current.concat(char);
            const newParts = parts.concat(char);

            if (parts.length > 0) {
              const lastPart = parts[parts.length - 1];
              if (
                lastPart.length === 1 &&
                !Romanizer.CONSONANT_CHECK_THROUGH_ROMAN_CHARS.has(lastPart) &&
                !char.startsWith(lastPart)
              ) {
                continue; // 無効な子音の組み合わせをスキップ
              }
            }

            nextBatch.push({
              current: newCurrent,
              parts: newParts,
              index: index + 1,
            });
          }
        }
      }

      currentBatch = nextBatch;
    }

    return results;
  }

  /**
   * 子音の組み合わせが有効かチェック
   */
  private isValidConsonantCombination(parts: string[]): boolean {
    for (let i = 0; i < parts.length - 1; i++) {
      const currentPart = parts[i];
      const nextPart = parts[i + 1];

      if (
        currentPart.length === 1 &&
        !Romanizer.CONSONANT_CHECK_THROUGH_ROMAN_CHARS.has(currentPart)
      ) {
        if (!nextPart.startsWith(currentPart)) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * 与えられた2つの変換候補のセットの直積を返すヘルパーメソッド
   * 各候補は [ [romaji文字列], parts ] の形式。
   */
  private combineCartesian(
    results1: Combinations,
    results2: Combinations
  ): Combinations {
    const newResults: Combinations = [];
    for (const res1 of results1) {
      for (const res2 of results2) {
        const combinedRomaji: string[] = [];
        // 各候補配列内の全候補を組み合わせる
        for (const romaji1 of res1[0]) {
          for (const romaji2 of res2[0]) {
            combinedRomaji.push(romaji1 + romaji2);
          }
        }
        const combinedParts = res1[1].concat(res2[1]);
        newResults.push([combinedRomaji, combinedParts]);
      }
    }
    return newResults;
  }

  /**
   * 入力文字列をチャンク分割します。
   * @param str 変換対象文字列
   * @returns チャンクの配列
   */
  protected override splitIntoChunks(str: string, size: number): string[] {
    // 「、」「。」の直後、および数字と非数字の境界でチャンク分割する
    return str.split(
      /(?<=[、。])|(?<=[0-9\uFF10-\uFF19])(?=[^0-9\uFF10-\uFF19])|(?<=[^0-9\uFF10-\uFF19])(?=[0-9\uFF10-\uFF19])/
    );
  }
}
