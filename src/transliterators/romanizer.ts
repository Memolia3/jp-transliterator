import { AbstractTransliterator } from "../core/abstract-transliterator";
import { PatternService } from "../services/pattern.service";
import { CartesianService } from "../services/cartesian.service";
import { TextConverterService } from "../services/text-converter.service";
import { kanaToRomajiMap } from "../data/pattern";
import type {
  TransliterationTable,
  Pattern,
  Combinations,
} from "../types/transliterate.types";

/**
 * かな・カナ → ローマ字変換クラス
 */
export class Romanizer extends AbstractTransliterator {
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

  private static readonly HALF_WIDTH_SPECIAL_CHARS =
    /[!@#$%^&*()_+\-=\[\]{}|;:'",.\/<>?0-9]/;
  private static readonly FULL_WIDTH_SPECIAL_CHARS =
    /[！＠＃＄％＾＆＊（）＿＋－＝［］｛｝｜；：'"、。・＜＞？０-９]/;
  private static readonly PUNCTUATIONS =
    /[、。，．・：；？！´｀¨＾￣＿―‐／＼～∥｜…‥''""（）〔〕［］｛｝〈〉《》「」『』【】＋－±×÷＝≠＜＞≦≧∞∴♂♀°′″℃￥＄￠￡％＃＆＊＠§☆★○●◎◇◆□■△▲▽▼※〒→←↑↓〓ー]/;

  // 共通で使用される特殊パターン
  private static readonly TSU_PATTERNS = new Set([
    "xtu",
    "xtsu",
    "ltu",
    "ltsu",
  ]);
  private static readonly N_PATTERNS = new Set(["n", "nn"]);

  // サービスインスタンス
  private readonly patternService: PatternService;
  private readonly cartesianService: CartesianService;
  private readonly textConverterService: TextConverterService;

  // 定数
  private readonly MAX_RESULT_SIZE = Number.MAX_SAFE_INTEGER;
  private readonly SMALL_CHUNK_SIZE = 5;
  private readonly LONG_TEXT_THRESHOLD = 20;

  constructor() {
    super();
    this.patternService = new PatternService(
      kanaToRomajiMap as TransliterationTable
    );
    this.cartesianService = new CartesianService();
    this.textConverterService = new TextConverterService();

    // 特殊文字セットを初期化
    this.patternService.initializeSpecialSets([
      Romanizer.N_CHARS,
      Romanizer.TSU_CHARS,
    ]);
  }

  /**
   * 実際の変換プロセスを実装
   */
  protected processTransliteration(
    str: string,
    chunkSize: number
  ): Combinations | null {
    if (!str) return null;

    const halfWidthStr = this.textConverterService.toHalfWidth(str);

    // 特殊文字の位置を収集
    const specialCharPositions: number[] = [];
    for (let i = 0; i < halfWidthStr.length; i++) {
      if (this.isSpecialCharacter(halfWidthStr[i])) {
        specialCharPositions.push(i);
      }
    }

    // 特殊文字のみの場合は直接マッピング
    if (this.isOnlySpecialCharacters(halfWidthStr)) {
      const directMapping = this.createDirectMapping(halfWidthStr);
      return directMapping.length > 0 ? directMapping : null;
    }

    // 特殊文字がある場合は境界で分割
    if (specialCharPositions.length > 0) {
      return this.processWithSpecialChars(halfWidthStr, specialCharPositions);
    }

    // 特殊文字がない場合は通常処理
    return this.processNormalText(halfWidthStr, chunkSize);
  }

  /**
   * 特殊文字を含む文字列の処理
   */
  private processWithSpecialChars(
    halfWidthStr: string,
    specialCharPositions: number[]
  ): Combinations | null {
    // セグメントに分割
    const segments: string[] = [];
    let startPos = 0;

    for (const pos of specialCharPositions) {
      if (pos > startPos) {
        segments.push(halfWidthStr.substring(startPos, pos));
      }
      segments.push(halfWidthStr[pos]);
      startPos = pos + 1;
    }

    if (startPos < halfWidthStr.length) {
      segments.push(halfWidthStr.substring(startPos));
    }

    // 各セグメントを処理
    const segmentResults: Combinations[] = [];

    for (const segment of segments) {
      // 特殊文字の単一セグメント
      if (segment.length === 1 && this.isSpecialCharacter(segment)) {
        const pattern = this.patternService.search(segment) || [segment];
        segmentResults.push([[[pattern[0]], [pattern[0]]]]);
        continue;
      }

      // 通常テキストセグメント
      const patternArray = this.generatePatternArray(segment);
      if (!patternArray.length) continue;

      // 長いセグメントの分割処理
      const combinations =
        segment.length > 10 && patternArray.length > 10
          ? this.processLongSegment(segment, patternArray)
          : this.generateAllCombinations(patternArray, segment);

      if (combinations.length === 0) {
        const fallbackParts = patternArray.map((pat) => pat[0]);
        segmentResults.push([[[fallbackParts.join("")], fallbackParts]]);
      } else {
        segmentResults.push(combinations);
      }
    }

    // 結果の結合
    return this.combineResults(segmentResults);
  }

  /**
   * 長いセグメントの処理
   */
  private processLongSegment(
    segment: string,
    patternArray: Pattern
  ): Combinations {
    const subChunks = [];

    for (let i = 0; i < patternArray.length; i += this.SMALL_CHUNK_SIZE) {
      subChunks.push(patternArray.slice(i, i + this.SMALL_CHUNK_SIZE));
    }

    let chunkResults: Combinations = [];

    for (let i = 0; i < subChunks.length; i++) {
      const subChunk = subChunks[i];
      const subOriginalStr = segment.substring(
        i * this.SMALL_CHUNK_SIZE,
        Math.min((i + 1) * this.SMALL_CHUNK_SIZE, segment.length)
      );

      const combinations = this.generateAllCombinations(
        subChunk,
        subOriginalStr
      );

      if (i === 0) {
        chunkResults = combinations;
      } else {
        chunkResults = this.cartesianService.combineCartesian(
          chunkResults,
          combinations,
          this.MAX_RESULT_SIZE
        );
      }
    }

    return chunkResults;
  }

  /**
   * 特殊文字のない通常テキストの処理
   */
  private processNormalText(
    halfWidthStr: string,
    chunkSize: number
  ): Combinations | null {
    const effectiveChunkSize =
      halfWidthStr.length > this.LONG_TEXT_THRESHOLD
        ? Math.min(chunkSize, 8)
        : chunkSize;

    const chunks = this.textProcessor.splitIntoChunks(
      halfWidthStr,
      effectiveChunkSize
    );
    const chunkResults: Combinations[] = [];

    for (const chunk of chunks) {
      const patternArray = this.generatePatternArray(chunk);
      if (!patternArray.length) continue;

      const combinations = this.generateAllCombinations(patternArray, chunk);

      if (combinations.length === 0) {
        const fallbackParts = patternArray.map((pat) => pat[0]);
        chunkResults.push([[[fallbackParts.join("")], fallbackParts]]);
      } else {
        chunkResults.push(combinations);
      }
    }

    return this.combineResults(chunkResults);
  }

  /**
   * 結果を結合する共通メソッド
   */
  private combineResults(results: Combinations[]): Combinations | null {
    if (results.length === 0) return null;
    if (results.length === 1) return results[0];

    let finalResults = results[0];
    for (let i = 1; i < results.length; i++) {
      finalResults = this.cartesianService.combineCartesian(
        finalResults,
        results[i],
        this.MAX_RESULT_SIZE
      );
    }

    return finalResults.length ? finalResults : null;
  }

  /**
   * 文字列が特殊文字のみで構成されているかチェック
   */
  private isOnlySpecialCharacters(str: string): boolean {
    for (const char of str) {
      if (!this.isSpecialCharacter(char)) {
        return false;
      }
    }
    return true;
  }

  /**
   * 特殊文字のための直接マッピングを作成
   */
  private createDirectMapping(str: string): Combinations {
    const parts: string[] = [];

    for (const char of str) {
      const patterns = this.patternService.search(char);
      parts.push(patterns ? patterns[0] : char);
    }

    return [[[parts.join("")], parts]];
  }

  /**
   * パターン配列生成メソッド
   */
  protected generatePatternArray(str: string): Pattern {
    const result: Pattern = [];

    for (let i = 0; i < str.length; i++) {
      const char = str[i];

      // 特殊文字判定
      if (this.isSpecialCharacter(char)) {
        const match = this.patternService.search(char);
        result.push(match || [char]);
        continue;
      }

      // 特殊パターン「ん」の処理
      if (this.handleSpecialN(str, i, result)) {
        continue;
      }

      // 特殊パターン「っ」の処理
      if (this.handleTsu(str, i, result)) {
        continue;
      }

      // 通常パターン（最長一致）
      const match = this.patternService.findLongestMatch(
        str,
        i,
        Romanizer.N_CHARS,
        Romanizer.TSU_CHARS
      );

      if (match) {
        result.push(match.pattern);
        i += match.length - 1;
      } else {
        result.push([char]);
      }
    }

    return result;
  }

  /**
   * 特殊文字チェック
   */
  private isSpecialCharacter(char: string): boolean {
    if (!char) return false;

    if (char.length === 1) {
      return (
        Romanizer.HALF_WIDTH_SPECIAL_CHARS.test(char) ||
        Romanizer.FULL_WIDTH_SPECIAL_CHARS.test(char) ||
        Romanizer.PUNCTUATIONS.test(char)
      );
    }

    return this.isSpecialCharacter(char[0]);
  }

  /**
   * 「ん」の特殊処理
   */
  private handleSpecialN(str: string, i: number, patterns: Pattern): boolean {
    const char = str[i];
    if (!Romanizer.N_CHARS.has(char)) return false;

    const nPossiblePatterns = this.patternService.getSpecialPatterns(char);
    if (!nPossiblePatterns) return false;

    // 「ん」の後がナ行の場合は 'nn' のみ使用
    patterns.push(
      i + 1 < str.length && Romanizer.NA_LINE_CHARS.has(str[i + 1])
        ? ["nn"]
        : nPossiblePatterns
    );

    return true;
  }

  /**
   * 「っ」の特殊処理
   */
  private handleTsu(str: string, i: number, patterns: Pattern): boolean {
    const char = str[i];
    if (!Romanizer.TSU_CHARS.has(char)) return false;

    const tsuPossiblePatterns = this.patternService.getSpecialPatterns(char);
    if (!tsuPossiblePatterns) return false;

    // 「っ」の後の文字によって変換を変える
    if (i + 1 < str.length) {
      const nextMatch = this.patternService.findLongestMatch(
        str,
        i + 1,
        Romanizer.N_CHARS,
        Romanizer.TSU_CHARS
      );

      if (nextMatch?.pattern[0][0] && /^[a-z]/.test(nextMatch.pattern[0][0])) {
        const firstConsonant =
          nextMatch.pattern[0][0].match(/^[^aiueo]*/)?.[0] || "";
        if (firstConsonant) {
          patterns.push([firstConsonant, ...tsuPossiblePatterns]);
          return true;
        }
      }
    }

    patterns.push(tsuPossiblePatterns);
    return true;
  }

  /**
   * すべての組み合わせを生成
   */
  protected generateAllCombinations(
    patterns: Pattern,
    originalStr?: string
  ): Combinations {
    if (!patterns.length) return [];

    // 1-2パターンの高速処理
    if (patterns.length <= 2) {
      return this.generateSimpleCombinations(patterns);
    }

    // パターン数のチェックと制限
    const MAX_SAFE_PATTERN_LENGTH = 12;
    if (patterns.length > MAX_SAFE_PATTERN_LENGTH) {
      // 長いパターンは分割して処理
      const firstHalf = patterns.slice(0, MAX_SAFE_PATTERN_LENGTH);
      const firstResults = this.generateAllCombinations(
        firstHalf,
        originalStr?.substring(0, MAX_SAFE_PATTERN_LENGTH)
      );

      // 残りのパターンは直接マッピング（メモリ節約のため）
      const remainingParts = patterns
        .slice(MAX_SAFE_PATTERN_LENGTH)
        .map((p) => p); // すべての選択肢を保持
      const remainingPatterns = patterns.slice(MAX_SAFE_PATTERN_LENGTH);

      // 結果を結合
      const combinedResults: Combinations = [];

      for (let i = 0; i < firstResults.length; i++) {
        const [texts, parts] = firstResults[i];
        
        // 残りのパターンの組み合わせを生成
        const remainingResults = this.generateAllCombinations(remainingPatterns);
        
        for (const [remainingTexts, remainingParts] of remainingResults) {
          for (const text of texts) {
            for (const remainingText of remainingTexts) {
              const combinedText = text + remainingText;
              const combinedParts = [...parts, ...remainingParts];
              combinedResults.push([[combinedText], combinedParts]);
            }
          }
        }
      }

      return combinedResults.length > 0
        ? combinedResults
        : [[[patterns.map((p) => p[0]).join("")], patterns.map((p) => p[0])]];
    }

    // 全パターン使用（制限なし）
    const results: Combinations = [];

    // すべての組み合わせを生成
    const generateCombinations = (
      currentIndex: number,
      currentText: string,
      currentParts: string[]
    ) => {
      if (currentIndex === patterns.length) {
        results.push([[currentText], [...currentParts]]);
        return;
      }

      // 現在のパターンのすべての選択肢を試す
      for (const option of patterns[currentIndex]) {
        // 子音連続チェック
        let isValid = true;
        if (currentIndex > 0) {
          const prevOption = currentParts[currentParts.length - 1];
          
          // 特殊文字の場合は常に有効
          const isPrevSpecial = originalStr && this.isSpecialCharacter(originalStr[currentIndex - 1]);
          const isCurrentSpecial = originalStr && this.isSpecialCharacter(originalStr[currentIndex]);
          
          if (!isPrevSpecial && !isCurrentSpecial) {
            // 「ん」パターン
            const isNPattern = Romanizer.N_PATTERNS.has(prevOption) || 
                              Romanizer.N_PATTERNS.has(option);
            
            // 促音パターン
            const isTsuPattern = Romanizer.TSU_PATTERNS.has(option);
            
            // 子音連続ルール
            if (!isNPattern && !isTsuPattern &&
                prevOption.length === 1 && 
                !Romanizer.CONSONANT_CHECK_THROUGH_ROMAN_CHARS.has(prevOption) && 
                !option.startsWith(prevOption)) {
              isValid = false;
            }
          }
        }
        
        if (isValid) {
          const newParts = [...currentParts, option];
          generateCombinations(currentIndex + 1, currentText + option, newParts);
        }
      }
    };

    generateCombinations(0, "", []);
    
    // 結果がない場合はフォールバック
    if (results.length === 0) {
      const fallbackParts = patterns.map((p) => p[0]);
      results.push([[fallbackParts.join("")], fallbackParts]);
    }

    return results;
  }

  /**
   * 単純なケース（1-2パターン）の組み合わせ生成
   */
  private generateSimpleCombinations(patterns: Pattern): Combinations {
    const results: Combinations = [];

    if (patterns.length === 1) {
      // 単一パターン - すべての選択肢を使用
      for (const option of patterns[0]) {
        results.push([[option], [option]]);
      }
    } else if (patterns.length === 2) {
      // 2パターン - すべての組み合わせを試す
      for (const first of patterns[0]) {
        for (const second of patterns[1]) {
          if (this.isValidSimpleConsonantCombination(first, second)) {
            results.push([[first + second], [first, second]]);
          }
        }
      }
    }

    return results;
  }

  /**
   * 単純な子音組み合わせ検証（2パターン用）
   */
  private isValidSimpleConsonantCombination(
    first: string,
    second: string
  ): boolean {
    // 特殊文字は常に許可
    if (this.isSpecialCharacter(first) || this.isSpecialCharacter(second)) {
      return true;
    }

    // 「ん」パターン
    if (Romanizer.N_PATTERNS.has(first)) {
      return true;
    }

    // 促音パターン
    if (
      second.startsWith("xtu") ||
      second.startsWith("xtsu") ||
      second.startsWith("ltu") ||
      second.startsWith("ltsu")
    ) {
      return true;
    }

    // 子音のみで母音が続かない無効ケース
    if (
      first.length === 1 &&
      !Romanizer.CONSONANT_CHECK_THROUGH_ROMAN_CHARS.has(first) &&
      !second.startsWith(first)
    ) {
      return false;
    }

    return true;
  }
}
