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

  // パターンサービス
  private readonly patternService: PatternService;
  // カーテシアン積計算サービス
  private readonly cartesianService: CartesianService;
  // テキスト変換サービス
  private readonly textConverterService: TextConverterService;
  // 最大結果数
  private readonly MAX_RESULT_SIZE = Number.MAX_SAFE_INTEGER;

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
    // 入力文字列が空の場合
    if (!str) return null;

    // 半角に変換
    const halfWidthStr = this.textConverterService.toHalfWidth(str);

    // 特殊な記号のみの場合は直接変換
    if (this.isOnlySpecialCharacters(halfWidthStr)) {
      const directMapping = this.createDirectMapping(halfWidthStr);
      return directMapping.length > 0 ? directMapping : null;
    }

    // チャンクサイズの自動調整（長い入力の場合は小さなチャンクに分割）
    const effectiveChunkSize =
      str.length > 20 ? Math.min(chunkSize, 8) : chunkSize;

    // 長い入力はチャンクに分割
    const chunks = this.textProcessor.splitIntoChunks(
      halfWidthStr,
      effectiveChunkSize
    );
    const chunkResults: Combinations[] = [];

    for (const chunk of chunks) {
      const patternArray = this.generatePatternArray(chunk);
      if (!patternArray.length) continue;

      // パターン数に関わらず同一のロジックで処理
      const combinations = this.generateAllCombinations(patternArray, chunk);
      if (combinations.length === 0) {
        // フォールバック: 各パターンの先頭候補を使用
        const fallbackParts = patternArray.map((pat) => pat[0]);
        const fallbackRomaji = fallbackParts.join("");
        chunkResults.push([[[fallbackRomaji], fallbackParts]]);
      } else {
        chunkResults.push(combinations);
      }
    }

    // 結果が空の場合
    if (chunkResults.length === 0) return null;

    // 単一チャンクの場合はそのまま返す
    if (chunkResults.length === 1) return chunkResults[0];

    // 複数チャンクの場合はカーテシアン積で結合（結果数制限を撤廃）
    let finalResults = chunkResults[0];
    for (let i = 1; i < chunkResults.length; i++) {
      finalResults = this.cartesianService.combineCartesian(
        finalResults,
        chunkResults[i],
        this.MAX_RESULT_SIZE
      );
    }

    return finalResults.length ? finalResults : null;
  }

  /**
   * 文字列が特殊文字のみで構成されているかチェック
   */
  private isOnlySpecialCharacters(str: string): boolean {
    // 文字ごとにチェック
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
    const result: Combinations = [];
    const parts: string[] = [];

    // 各文字を分割して配列に
    for (const char of str) {
      // パターン表からの変換を試みる
      const patterns = this.patternService.search(char);
      if (patterns) {
        // パターン表に定義されている場合はそれを使用
        parts.push(patterns[0]);
      } else {
        // パターン表にない場合はそのまま使用
        parts.push(char);
      }
    }

    // 特殊文字を直接マッピング
    const combinedStr = parts.join("");
    result.push([[combinedStr], parts]);

    return result;
  }

  /**
   * パターンを単純化する追加メソッド
   */
  private simplifyPatterns(patterns: Pattern): Pattern {
    // パターン数が多すぎる場合に最適化
    if (patterns.length > 20) {
      return patterns.map((options) => {
        // 1つしかない場合はそのまま
        if (options.length <= 1) return options;
        // 長さが2以下なら2つまで
        if (options.length <= 2) return options;
        // それ以外は最も一般的なオプションのみ
        return [options[0]];
      });
    }

    return patterns.map((options) => {
      if (options.length <= 2) return options;
      // 最も一般的な2つのオプションに制限
      return options.slice(0, 2);
    });
  }

  /**
   * パターン配列生成メソッド
   * 入力文字列から変換パターンの配列を生成
   */
  protected generatePatternArray(str: string): Pattern {
    const result: Pattern = [];

    for (let i = 0; i < str.length; i++) {
      const char = str[i];

      // 特殊文字判定（全角・半角の記号や数字）
      const isSpecialChar = this.isSpecialCharacter(char);
      if (isSpecialChar) {
        // パターン表からの変換を試みる
        const match = this.patternService.search(char);
        if (match) {
          // パターン表に定義されている場合はそれを使用
          result.push(match);
        } else {
          // パターン表にない場合はそのまま使用
          result.push([char]);
        }
        
        // 特殊文字や数字の後に複合パターンがあるか検索
        if (i + 1 < str.length) {
          // まず特殊文字の後の複数文字を含む最長一致を試みる
          let foundCompoundPattern = false;
          
          // 最大3文字まで試す
          for (let len = 3; len > 0; len--) {
            if (i + len <= str.length) {
              const compound = str.substring(i + 1, i + len + 1);
              const compoundMatch = this.patternService.search(compound);
              
              if (compoundMatch) {
                // 特殊文字と後続パターンを組み合わせる
                const specialPattern = match ? match[0] : char;
                const combinedPattern = [`${specialPattern}${compoundMatch[0]}`];
                
                // 既に追加した特殊文字のパターンを削除
                result.pop();
                
                // 結合したパターンを追加
                result.push(combinedPattern);
                
                // インデックスを進める
                i += len;
                foundCompoundPattern = true;
                break;
              }
            }
          }
          
          if (foundCompoundPattern) {
            continue;
          }
          
          // 特殊文字の次の文字を含む最長一致パターンを検索
          const nextCompoundMatch = this.patternService.findLongestMatch(
            str, 
            i + 1,
            Romanizer.N_CHARS,
            Romanizer.TSU_CHARS
          );
          
          // 最長一致パターンが見つかった場合
          if (nextCompoundMatch) {
            // 特殊文字のパターンと最長一致パターンを結合
            const specialPattern = match ? match[0] : char;
            const nextPattern = nextCompoundMatch.pattern[0];
            const combinedPattern = [`${specialPattern}${nextPattern}`];
            
            // 既に追加した特殊文字のパターンを削除
            result.pop();
            
            // 結合したパターンを追加
            result.push(combinedPattern);
            
            // インデックスを進める
            i += nextCompoundMatch.length;
            continue;
          }
        }
        
        // 複合パターンが見つからなかった場合は次の文字へ
        continue;
      }

      // 特殊パターン「ん」（N）の処理
      if (this.handleSpecialN(str, i, result)) {
        continue;
      }

      // 特殊パターン「っ」（促音）の処理
      if (this.handleTsu(str, i, result)) {
        continue;
      }

      // 通常パターンの処理（最長一致で検索）
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
        // 一致するパターンがない場合はそのまま追加
        result.push([char]);
      }
    }

    return result;
  }

  /**
   * 特殊文字かどうかをチェック（単一文字用）
   */
  private isSpecialCharacter(char: string): boolean {
    if (!char) return false;
    // 単文字の場合
    if (char.length === 1) {
      return (
        Romanizer.HALF_WIDTH_SPECIAL_CHARS.test(char) ||
        Romanizer.FULL_WIDTH_SPECIAL_CHARS.test(char) ||
        Romanizer.PUNCTUATIONS.test(char)
      );
    }
    // 複数文字（例：パターン）の場合は最初の文字をチェック
    return this.isSpecialCharacter(char[0]);
  }

  /**
   * 「ん」の特殊処理
   */
  private handleSpecialN(str: string, i: number, patterns: Pattern): boolean {
    const char = str[i];
    if (!Romanizer.N_CHARS.has(char)) return false;

    // 「ん」の後の文字によって変換を変える
    const nPossiblePatterns = this.patternService.getSpecialPatterns(char);
    if (!nPossiblePatterns) return false;

    // 「ん」の後がナ行の場合
    if (i + 1 < str.length && Romanizer.NA_LINE_CHARS.has(str[i + 1])) {
      // 'nn'のみを使用
      patterns.push(["nn"]);
    } else {
      patterns.push(nPossiblePatterns);
    }

    return true;
  }

  /**
   * 「っ」の特殊処理
   */
  private handleTsu(str: string, i: number, patterns: Pattern): boolean {
    const char = str[i];
    if (!Romanizer.TSU_CHARS.has(char)) return false;

    // パターン表から「っ|ッ」の全パターンを取得
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

      if (
        nextMatch &&
        nextMatch.pattern[0][0] &&
        /^[a-z]/.test(nextMatch.pattern[0][0])
      ) {
        // 促音の後の文字の先頭子音を重ねる
        const firstConsonant =
          nextMatch.pattern[0][0].match(/^[^aiueo]*/)?.[0] || "";
        if (firstConsonant) {
          // 子音の重ね書き（例：pp, tt）と「っ|ッ」のすべてのパターン（xtu, xtsu, ltu, ltsu）の両方を追加
          const allPatterns = [firstConsonant, ...tsuPossiblePatterns];
          patterns.push(allPatterns);
          return true;
        }
      }
    }

    // デフォルトの変換を使用
    patterns.push(tsuPossiblePatterns);
    return true;
  }

  /**
   * 子音の組み合わせが有効かどうかをチェック
   */
  private isValidConsonantCombination(parts: string[]): boolean {
    // 連続する子音をチェック
    for (let i = 0; i < parts.length - 1; i++) {
      const current = parts[i];
      const next = parts[i + 1];

      // 特殊文字/記号の場合は常に許可
      if (this.isSpecialCharacter(current)) {
        continue;
      }

      // 子音のみで母音が続かない場合
      if (
        current.length === 1 &&
        !Romanizer.CONSONANT_CHECK_THROUGH_ROMAN_CHARS.has(current) &&
        !next.startsWith(current)
      ) {
        return false;
      }
    }

    // 末尾が子音のみで終わる場合（特殊文字/記号は除く）
    const last = parts[parts.length - 1];
    if (
      last.length === 1 &&
      !Romanizer.CONSONANT_CHECK_THROUGH_ROMAN_CHARS.has(last) &&
      !this.isSpecialCharacter(last)
    ) {
      return false;
    }

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

    const results: Combinations = [];
    // バッチサイズ
    const MAX_BATCH_SIZE = Number.MAX_SAFE_INTEGER;

    // メモリ効率を上げるため、途中結果をオブジェクトプールとして再利用
    let currentBatch: { current: string[]; parts: string[]; index: number }[] =
      [{ current: [], parts: [], index: 0 }];
    let nextBatch: typeof currentBatch = [];

    // 特殊文字判定のセット - 頻繁にアクセスする値をキャッシュ
    const tsuPatterns = new Set(["xtu", "xtsu", "ltu", "ltsu"]);
    const consonantChars = Romanizer.CONSONANT_CHECK_THROUGH_ROMAN_CHARS;

    // 「ん」のパターン用のセット
    const nChars = new Set(["n", "nn"]);

    // originalStrが与えられている場合、特殊文字の事前判定を行い、配列としてキャッシュ
    const specialCharCache: boolean[] = [];
    if (originalStr) {
      for (let i = 0; i < originalStr.length; i++) {
        specialCharCache[i] = this.isSpecialCharacter(originalStr[i]);
      }
    }

    // 処理できる最大の組み合わせ数を計算
    // パターンごとの平均選択肢数を推定
    let avgOptionsPerPattern =
      patterns.reduce((sum, options) => sum + options.length, 0) /
      patterns.length;

    // 組み合わせ数の予測（指数関数的に増加）
    const estimatedCombinations = Math.pow(
      avgOptionsPerPattern,
      patterns.length
    );

    // 簡略化モードは使用しない
    const simplifiedMode = false;

    while (currentBatch.length > 0) {
      nextBatch.length = 0; // 配列を再利用

      // バッチサイズによるサンプリングは行わない

      for (let batchIdx = 0; batchIdx < currentBatch.length; batchIdx++) {
        const { current, parts, index } = currentBatch[batchIdx];

        if (index === patterns.length) {
          if (this.isValidConsonantCombination(parts)) {
            results.push([[current.join("")], parts.slice()]); // 配列のコピーを追加
          }
          continue;
        }

        const pattern = patterns[index];

        // 簡略化モードでは各パターンの最初の選択肢のみ使用
        const patternOptions = simplifiedMode ? [pattern[0]] : pattern;

        // 特殊文字判定（キャッシュから取得）
        const isCurrentSpecial = specialCharCache[index] || false;
        const isLastSpecial =
          index > 0 ? specialCharCache[index - 1] || false : false;

        for (let patIdx = 0; patIdx < patternOptions.length; patIdx++) {
          const char = patternOptions[patIdx];

          if (nextBatch.length < MAX_BATCH_SIZE) {
            // 子音の連続チェック - 高速化のため条件判定を最適化
            let isValid = true;

            if (parts.length > 0) {
              const lastPart = parts[parts.length - 1];

              // 促音パターンチェック - Setを使用して高速化
              const isTsuPattern = tsuPatterns.has(char);

              // 「ん」パターンチェック
              const isNChar = nChars.has(char) || nChars.has(lastPart);

              // 単一子音の連続チェック - 特殊文字の場合はスキップ
              if (
                !isLastSpecial && // 前が記号でない場合
                !isCurrentSpecial && // 現在も記号でない場合
                !isNChar && // 「ん」でない場合
                lastPart.length === 1 &&
                !consonantChars.has(lastPart) &&
                !char.startsWith(lastPart) &&
                !isTsuPattern
              ) {
                // 子音の重ね書きの特別処理
                if (!(lastPart.length === 1 && char.startsWith(lastPart))) {
                  isValid = false; // その他の無効な子音の組み合わせ
                }
              }
            }

            if (isValid) {
              nextBatch.push({
                current: [...current, char],
                parts: [...parts, char],
                index: index + 1,
              });
            }
          }
        }
      }

      // バッチの入れ替え
      const temp = currentBatch;
      temp.length = 0;

      // すべての結果を保持
      for (let i = 0; i < nextBatch.length; i++) {
        temp.push({
          current: [...nextBatch[i].current],
          parts: [...nextBatch[i].parts],
          index: nextBatch[i].index,
        });
      }

      // バッチの入れ替え
      currentBatch = temp;
      nextBatch = [];
    }

    // 結果が空の場合はフォールバック（最初のパターンの組み合わせ）
    if (results.length === 0 && patterns.length > 0) {
      const fallbackParts = patterns.map((p) => p[0]);
      results.push([[fallbackParts.join("")], fallbackParts]);
    }

    return results;
  }
}
