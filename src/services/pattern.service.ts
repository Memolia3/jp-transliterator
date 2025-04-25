import { Combinations } from "../types/transliterate.types";
import {
  AllInputPatterns,
  InputPatternMatrix,
  PatternSet,
  PatternSetArray,
} from "../types/pattern.types";
import type {
  TransliterationTable,
  Pattern,
} from "../types/transliterate.types";
import Trie from "../utils/trie.utils";

/**
 * パターン処理サービス
 * 変換パターンの管理と検索を担当
 */
export class PatternService {
  // 最適化されたマップをTrieに変換
  private readonly mapTrie: Trie;
  // 特殊パターン用のマップ (Trieに入れないもの)
  private specialPatterns: TransliterationTable;
  // 特殊文字セット
  private specialCharSets: Set<string>[] = [];
  // パターンキャッシュ
  private readonly patternCache = new Map<string, Pattern>();
  // 検索結果キャッシュ（高頻度アクセスの最適化）
  private readonly searchCache = new Map<string, string[] | null>();
  // 最長一致検索結果キャッシュ
  private readonly longestMatchCache = new Map<
    string,
    { pattern: string[]; length: number } | null
  >();

  private readonly MAX_CACHE_SIZE = 1000;
  private readonly MAX_SEARCH_CACHE_SIZE = 500;
  private readonly MAX_MATCH_CACHE_SIZE = 200;

  /**
   * コンストラクタ
   * @param transliterationMap 変換マップ
   */
  constructor(transliterationMap: TransliterationTable) {
    // 最適化されたマップを生成
    const optimizedMap = Object.entries(
      transliterationMap
    ).reduce<TransliterationTable>((acc, [key, value]) => {
      key.split("|").forEach((char) => {
        acc[char] = value;
      });
      return acc;
    }, {});

    // Trieを初期化
    this.mapTrie = new Trie();
    // 特殊パターンマップの初期化
    this.specialPatterns = {};

    // マップの内容をTrieと特殊パターンに振り分け
    this.initializePatternContainers(optimizedMap);
  }

  /**
   * 特殊文字セットを初期化
   * @param specialSets 特殊文字セットの配列
   */
  public initializeSpecialSets(specialSets: Set<string>[]): void {
    this.specialCharSets = specialSets;

    // すべてのマップをTrieから特殊パターンに移動し、再構築する
    // Trieにはremoveメソッドがないため、新しいTrieを作成して再設定する
    const tempTrie = new Trie();
    const tempSpecialPatterns: TransliterationTable = {
      ...this.specialPatterns,
    };

    // すべての特殊文字を記録
    const allSpecialChars = new Set<string>();
    for (const set of specialSets) {
      for (const char of set) {
        allSpecialChars.add(char);

        // Trieにある場合は特殊パターンマップに移動
        const patterns = this.mapTrie.search(char);
        if (patterns) {
          tempSpecialPatterns[char] = patterns;
        }
      }
    }

    // 特殊文字以外をTrieに再追加
    for (const [key, patterns] of Object.entries(tempSpecialPatterns)) {
      if (!allSpecialChars.has(key)) {
        tempTrie.insert(key, patterns);
      }
    }

    // 更新された値を設定
    this.specialPatterns = tempSpecialPatterns;

    // キャッシュをクリア
    this.clearCaches();
  }

  /**
   * すべてのキャッシュをクリア
   */
  private clearCaches(): void {
    this.patternCache.clear();
    this.searchCache.clear();
    this.longestMatchCache.clear();
  }

  /**
   * キーに対応するパターンを検索
   * @param key 検索キー
   * @returns パターン配列または未定義
   */
  public search(key: string): string[] | null {
    // まずキャッシュを確認
    const cachedResult = this.searchCache.get(key);
    if (cachedResult !== undefined) {
      return cachedResult;
    }

    // キャッシュにない場合は検索実行
    let result: string[] | null = null;

    // まず特殊パターンを検索
    if (key in this.specialPatterns) {
      result = this.specialPatterns[key];
    } else {
      // Trieで検索
      result = this.mapTrie.search(key);
    }

    // 結果をキャッシュに追加
    if (this.searchCache.size >= this.MAX_SEARCH_CACHE_SIZE) {
      // キャッシュが一定サイズを超えたらクリア
      this.searchCache.clear();
    }
    this.searchCache.set(key, result);

    return result;
  }

  /**
   * マップの内容をTrieと特殊パターンに振り分ける
   * @param optimizedMap 最適化されたマップ
   */
  private initializePatternContainers(
    optimizedMap: TransliterationTable
  ): void {
    // 現在のspecialCharSetsに基づいて振り分け
    const allSpecialChars = new Set<string>();
    for (const set of this.specialCharSets) {
      for (const char of set) {
        allSpecialChars.add(char);
      }
    }

    // 一度にデータを処理してTrieに追加
    const nonSpecialEntries: [string, string[]][] = [];

    for (const [key, patterns] of Object.entries(optimizedMap)) {
      // 特殊文字判定
      if (allSpecialChars.has(key)) {
        this.specialPatterns[key] = patterns;
      } else {
        nonSpecialEntries.push([key, patterns]);
      }
    }

    // バッチ処理でTrieに追加
    for (const [key, patterns] of nonSpecialEntries) {
      this.mapTrie.insert(key, patterns);
    }
  }

  /**
   * 特殊パターンを取得
   * @param char 対象文字
   */
  public getSpecialPatterns(char: string): string[] | null {
    return this.specialPatterns[char] || null;
  }

  /**
   * 文字列の中で最長一致するパターンを検索
   * @param str 検索対象文字列
   * @param startIndex 開始インデックス
   * @param specialSets 特殊文字のセット（Trieから除外するための）
   */
  public findLongestMatch(
    str: string,
    startIndex: number,
    ...specialSets: Set<string>[]
  ): { pattern: string[]; length: number } | null {
    // キャッシュキーを生成
    const cacheKey = `${str.substring(
      startIndex,
      startIndex + 10
    )}_${startIndex}`;

    // キャッシュを確認
    const cachedResult = this.longestMatchCache.get(cacheKey);
    if (cachedResult !== undefined) {
      return cachedResult;
    }

    let result: { pattern: string[]; length: number } | null = null;

    // 特殊文字の場合はTrieでの検索をスキップ
    if (specialSets.some((set) => set.has(str[startIndex]))) {
      const char = str[startIndex];
      const pattern = this.specialPatterns[char];
      if (pattern) {
        result = { pattern, length: 1 };
      }
    } else {
      // Trieを使用して最長一致を検索
      const searchResult = this.mapTrie.searchLongestPrefix(str, startIndex);
      if (searchResult && searchResult.node.patterns) {
        result = {
          pattern: searchResult.node.patterns,
          length: searchResult.length,
        };
      }
    }

    // 結果をキャッシュに追加
    if (this.longestMatchCache.size >= this.MAX_MATCH_CACHE_SIZE) {
      this.longestMatchCache.clear();
    }
    this.longestMatchCache.set(cacheKey, result);

    return result;
  }

  /**
   * 入力文字列に対応するすべてのパターンを取得
   * @param str 入力文字列
   */
  public getInputPatterns(str: string): { pattern: string[]; char: string }[] {
    const patterns: { pattern: string[]; char: string }[] = [];

    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      // Trieから検索
      const pattern = this.mapTrie.search(char);

      if (pattern) {
        patterns.push({ pattern, char });
      } else {
        // 特殊パターンから検索
        const specialPattern = this.specialPatterns[char];
        if (specialPattern) {
          patterns.push({ pattern: specialPattern, char });
        } else {
          // パターンがない場合は文字をそのまま使用
          patterns.push({ pattern: [char], char });
        }
      }
    }

    return patterns;
  }

  /**
   * 変換結果から入力文字列を取得
   * @param combinations Romanizer/Japanizerからの変換結果
   * @param index 取得するインデックス（デフォルトは0）
   * @returns 入力文字列
   */
  public getInput(
    combinations: Combinations | string,
    index: number = 0
  ): string | string[] {
    // 文字列が直接渡された場合、パターンを検索して返す
    if (typeof combinations === "string") {
      // まず特殊パターンを検索
      if (combinations in this.specialPatterns) {
        return this.specialPatterns[combinations];
      }

      // Trieで検索
      const pattern = this.mapTrie.search(combinations);
      return pattern || [combinations];
    }

    // Combinationsオブジェクトの場合は元の処理
    if (!combinations || !combinations.length) return "";

    // 組み合わせから指定されたインデックスの入力を取得
    if (
      combinations.length > index &&
      combinations[index] &&
      combinations[index][0].length > 0
    ) {
      return combinations[index][0][0];
    }

    return "";
  }

  /**
   * キャッシュからパターンを取得、またはキャッシュに追加
   * @param key キャッシュキー
   * @param generator パターン生成関数
   */
  public getOrCachePatterns<T>(key: string, generator: () => T): T {
    // キャッシュから取得
    const cached = this.patternCache.get(key) as unknown as T;
    if (cached) return cached;

    // 生成して追加
    const result = generator();

    // キャッシュサイズの管理
    if (this.patternCache.size >= this.MAX_CACHE_SIZE) {
      this.patternCache.clear();
    }

    // キャッシュに追加（短い文字列のみ）
    if (key.length <= 20) {
      this.patternCache.set(key, result as unknown as Pattern);
    }

    return result;
  }

  /**
   * 複合パターン（2文字以上の連続）を取得
   * @param str 入力文字列
   * @param startIndex 開始インデックス
   */
  public getCompoundPatterns(
    str: string,
    startIndex: number
  ): { patterns: string[][]; length: number }[] {
    const results: { patterns: string[][]; length: number }[] = [];

    // Trieで最大4文字まで検索
    for (let len = 2; len <= 4 && startIndex + len <= str.length; len++) {
      const substr = str.substring(startIndex, startIndex + len);
      const patterns = this.mapTrie.search(substr);

      if (patterns) {
        results.push({ patterns: [patterns], length: len });
      }
    }

    return results;
  }

  /**
   * 変換結果から全ての入力パターンを2次元配列で取得
   * @param combinations Romanizer/Japanizerからの変換結果
   * @returns 入力パターンの2次元配列
   */
  public getAllInputPatterns(combinations: Combinations): InputPatternMatrix {
    if (!combinations || !combinations.length) return [];

    // まとめた文字列パターンのみを抽出
    const result: InputPatternMatrix = [];

    for (const [romajiArray, parts] of combinations) {
      if (romajiArray && romajiArray.length > 0 && parts.length > 0) {
        // まとめた1つの文字列として追加（分割パターンは含めない）
        result.push([parts.join("")]);
      }
    }

    return result;
  }

  /**
   * 変換結果から日本語文字ごとのカンマ区切りパターンを2次元配列で取得
   * @param combinations Romanizer/Japanizerからの変換結果
   * @returns カンマ区切りされた入力パターンの2次元配列
   */
  public getSegmentedPatterns(combinations: Combinations): InputPatternMatrix {
    if (!combinations || !combinations.length) return [];

    // カンマ区切りパターンを生成
    const result: InputPatternMatrix = [];

    for (const [_, parts] of combinations) {
      if (parts && parts.length > 0) {
        result.push(parts);
      }
    }

    return result;
  }

  /**
   * 変換結果から完全な入力パターン情報を取得
   * @param combinations Romanizer/Japanizerからの変換結果
   * @param originalText 元の日本語テキスト（オプション）
   * @returns 全入力パターン情報
   */
  public getCompletePatterns(
    combinations: Combinations,
    originalText?: string
  ): AllInputPatterns {
    if (!combinations || !combinations.length) {
      return {
        patterns: [],
        segmented: [],
      };
    }

    // 全パターン取得
    const patterns = this.getAllInputPatterns(combinations);

    // カンマ区切りパターン取得
    const segmented = this.getSegmentedPatterns(combinations);

    return {
      patterns,
      segmented,
    };
  }

  /**
   * 変換結果を標準的なパターンセット配列に変換
   * @param combinations Romanizer/Japanizerからの変換結果
   * @returns パターンセット配列
   */
  public toPatternSetArray(combinations: Combinations): PatternSetArray {
    if (!combinations || !combinations.length) return [];

    return combinations.map(([romaji, parts]) => {
      const romajiStr = romaji.length > 0 ? romaji[0] : "";
      return [romajiStr, parts];
    });
  }

  /**
   * 指定された文字列のパターンを配列形式で取得します
   * @param query 検索する文字列またはCombinations
   * @returns 可能なローマ字入力パターンの2次元配列
   */
  getInputMatrix(query: string): string[][] {
    // 特殊パターンの確認
    const specialPattern = this.getSpecialPatterns(query);
    if (specialPattern) {
      return [specialPattern];
    }

    // Trieで検索
    if (this.mapTrie) {
      const result = this.mapTrie.search(query);
      if (result) {
        return [result];
      }
    }

    // 一文字ずつの配列を返す（マッチしなかった場合）
    return query.split("").map((char) => [char]);
  }

  /**
   * 日本語文字列を文字ごとに分割します
   * @param japaneseText 分割する日本語文字列
   * @returns 分割された文字の配列
   */
  segmentJapaneseText(japaneseText: string): string[] {
    const result: string[] = [];
    let i = 0;

    while (i < japaneseText.length) {
      // サロゲートペアの処理
      if (
        i + 1 < japaneseText.length &&
        japaneseText.charCodeAt(i) >= 0xd800 &&
        japaneseText.charCodeAt(i) <= 0xdbff
      ) {
        result.push(japaneseText.substring(i, i + 2));
        i += 2;
      } else {
        result.push(japaneseText[i]);
        i++;
      }
    }

    return result;
  }
}
