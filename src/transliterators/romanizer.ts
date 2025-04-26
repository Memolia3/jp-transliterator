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
  private readonly MAX_COMBINATIONS = 20000;
  private readonly SMALL_CHUNK_SIZE = 5;
  private readonly LONG_TEXT_THRESHOLD = 20;
  private readonly COMPLEX_PATTERNS_THRESHOLD = 100;

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
      const firstResults = this.generateAllCombinations(firstHalf, originalStr?.substring(0, MAX_SAFE_PATTERN_LENGTH));
      
      // 残りのパターンは直接マッピング（メモリ節約のため）
      const remainingParts = patterns.slice(MAX_SAFE_PATTERN_LENGTH).map(p => p[0]);
      const remainingText = remainingParts.join('');
      
      // 結果を結合（制限付き）
      const combinedResults: Combinations = [];
      const maxResultsToProcess = Math.min(firstResults.length, 100);
      
      for (let i = 0; i < maxResultsToProcess; i++) {
        const [texts, parts] = firstResults[i];
        const newTexts = texts.map(t => t + remainingText);
        const newParts = [...parts, ...remainingParts];
        combinedResults.push([newTexts, newParts]);
        
        if (combinedResults.length >= 100) break;
      }
      
      return combinedResults.length > 0 ? combinedResults : [[
        [patterns.map(p => p[0]).join('')], 
        patterns.map(p => p[0])
      ]];
    }

    // 各パターンの最大選択肢数を制限
    const simplifiedPatterns: Pattern = [];
    for (const pattern of patterns) {
      if (pattern.length <= 2) {
        simplifiedPatterns.push(pattern);
      } else {
        // 選択肢が多すぎる場合は最初の2つだけ使用
        simplifiedPatterns.push(pattern.slice(0, 2));
      }
    }

    // 組み合わせの総数を推定
    let estimatedCombinations = 1;
    for (const pattern of simplifiedPatterns) {
      estimatedCombinations *= pattern.length;
      // 早期チェック: 組み合わせが多すぎる場合
      if (estimatedCombinations > this.MAX_COMBINATIONS * 5) {
        return this.generateSimplifiedCombinations(patterns);
      }
    }

    const results: Combinations = [];
    const current = new Array(patterns.length);
    const parts = new Array(patterns.length);

    // 特殊文字の事前チェック - 特殊文字の位置を記録
    const specialCharIndices = new Set<number>();
    if (originalStr) {
      const len = Math.min(originalStr.length, patterns.length);
      for (let i = 0; i < len; i++) {
        if (this.isSpecialCharacter(originalStr[i])) {
          specialCharIndices.add(i);
        }
      }
    }

    // インデックスの配列 - 各パターンの現在の選択肢を追跡
    const indices = new Int16Array(patterns.length).fill(0);
    let position = 0;
    let validCombinationsCount = 0;
    let totalIterations = 0;
    const MAX_ITERATIONS = 1000000; // 安全対策

    // 反復処理による組み合わせ生成（スタックレス実装）
    mainLoop: while (position < patterns.length && totalIterations < MAX_ITERATIONS) {
      totalIterations++;
      
      // 現在のパターンインデックスと選択肢
      const patternIndex = position;
      const optionIndex = indices[patternIndex];
      
      // パターンの範囲チェック
      if (patternIndex >= patterns.length) {
        break;
      }
      
      // 選択肢の範囲チェック
      if (optionIndex >= simplifiedPatterns[patternIndex].length) {
        // このパターンのすべての選択肢を試した場合、前のパターンに戻る
        indices[patternIndex] = 0;
        position--;
        
        // すべてのパターンを試し終わった場合は終了
        if (position < 0) {
          break;
        }
        
        // 前のパターンの次の選択肢へ
        indices[position]++;
        continue;
      }
      
      // 現在の選択肢を設定
      const currentOption = simplifiedPatterns[patternIndex][optionIndex];
      current[patternIndex] = currentOption;
      parts[patternIndex] = currentOption;
      
      // 子音連続の検証（最初のパターン以外）
      let isValid = true;
      if (patternIndex > 0) {
        const prevPattern = patternIndex - 1;
        const prevOption = parts[prevPattern];
        
        // 特殊文字の場合は常に有効
        const isPrevSpecial = specialCharIndices.has(prevPattern);
        const isCurrentSpecial = specialCharIndices.has(patternIndex);
        
        if (!isPrevSpecial && !isCurrentSpecial) {
          // 「ん」パターン
          const isNPattern = Romanizer.N_PATTERNS.has(prevOption) || 
                            Romanizer.N_PATTERNS.has(currentOption);
          
          // 促音パターン
          const isTsuPattern = Romanizer.TSU_PATTERNS.has(currentOption);
          
          // 子音連続ルール
          if (!isNPattern && !isTsuPattern &&
              prevOption.length === 1 && 
              !Romanizer.CONSONANT_CHECK_THROUGH_ROMAN_CHARS.has(prevOption) && 
              !currentOption.startsWith(prevOption)) {
            isValid = false;
          }
        }
      }
      
      if (!isValid) {
        // 無効な組み合わせの場合、次の選択肢を試す
        indices[patternIndex]++;
        continue;
      }
      
      // 最後のパターンまで到達した場合、組み合わせを保存
      if (patternIndex === patterns.length - 1) {
        validCombinationsCount++;
        
        // 組み合わせ文字列を生成
        const combinedText = current.join('');
        
        // メモリ効率のため浅いコピーを使用
        results.push([[combinedText], [...parts]]);
        
        // 十分な結果を得た場合は終了
        if (results.length >= this.MAX_COMBINATIONS) {
          break mainLoop;
        }
        
        // 最後のパターンの次の選択肢へ
        indices[patternIndex]++;
      } else {
        // 次のパターンへ進む
        position++;
      }
    }
    
    // 結果がない場合はフォールバック
    if (results.length === 0) {
      const fallbackParts = patterns.map(p => p[0]);
      results.push([[fallbackParts.join('')], fallbackParts]);
    }
    
    return results;
  }

  /**
   * 簡易版の組み合わせ生成 - メモリ効率優先
   */
  private generateSimplifiedCombinations(patterns: Pattern): Combinations {
    // 各パターンの最初の選択肢のみを使用
    const firstOptions = patterns.map(p => p[0]);
    const combined = firstOptions.join('');
    
    // ヒューリスティクスでいくつかの代表的な組み合わせのみを生成
    const results: Combinations = [[[combined], firstOptions]];
    
    // パターン数が少ない場合は代替選択肢も試す
    if (patterns.length <= 8) {
      // いくつかのパターンで2番目の選択肢を試す
      for (let i = 0; i < Math.min(4, patterns.length); i++) {
        if (patterns[i].length > 1) {
          const altOptions = [...firstOptions];
          altOptions[i] = patterns[i][1];
          results.push([[altOptions.join('')], altOptions]);
          
          // 結果数が上限に達したら終了
          if (results.length >= 10) break;
        }
      }
    }
    
    return results;
  }

  /**
   * 単純なケース（1-2パターン）の組み合わせ生成
   */
  private generateSimpleCombinations(patterns: Pattern): Combinations {
    const results: Combinations = [];

    if (patterns.length === 1) {
      // 単一パターン
      for (const option of patterns[0]) {
        results.push([[option], [option]]);
      }
    } else if (patterns.length === 2) {
      // 2パターン
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
