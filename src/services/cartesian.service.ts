import type { Combinations } from "../types/transliterate.types";

/**
 * カーテシアン積計算サービス
 * 組み合わせの直積計算を効率的に行う
 */
export class CartesianService {
  /**
   * ストリーミング方式でカーテシアン積を計算
   * メモリ使用量を制御しながら大きな直積を計算
   * @param set1 最初の集合
   * @param set2 2番目の集合
   * @param maxResults 最大結果数
   */
  public combineCartesian(
    set1: Combinations,
    set2: Combinations,
    maxResults: number
  ): Combinations {
    const result: Combinations = [];
    let count = 0;

    for (const [firstResult, firstParts] of set1) {
      for (const [secondResult, secondParts] of set2) {
        if (count >= maxResults) break;

        // 結果の結合
        const combinedResults = firstResult.flatMap((first) =>
          secondResult.map((second) => first + second)
        );

        // 部分の結合
        const combinedParts = [...firstParts, ...secondParts];

        result.push([combinedResults, combinedParts]);
        count++;
      }

      if (count >= maxResults) break;
    }

    return result;
  }

  /**
   * 複数の配列のカーテシアン積を計算
   * @param arrays 配列の配列
   * @param maxResults 最大結果数
   */
  public calculateCartesianProduct<T>(
    arrays: T[][],
    maxResults = Number.MAX_SAFE_INTEGER
  ): T[][] {
    if (arrays.length === 0) return [[]];
    if (arrays.length === 1) return arrays[0].map((item) => [item]);

    const result: T[][] = [];
    const firstArray = arrays[0];
    const remainingArrays = arrays.slice(1);
    const remainingProduct = this.calculateCartesianProduct(
      remainingArrays,
      maxResults
    );

    // 各要素と残りの直積を結合
    for (const item of firstArray) {
      for (const product of remainingProduct) {
        if (result.length >= maxResults) break;
        result.push([item, ...product]);
      }
      if (result.length >= maxResults) break;
    }

    return result;
  }

  /**
   * 複数のパターンの直積を計算
   * @param patterns パターンの配列
   * @param maxResults 最大結果数
   */
  public calculatePatternProduct(
    patterns: string[][],
    maxResults = 10000
  ): string[] {
    if (patterns.length === 0) return [];
    if (patterns.length === 1) return patterns[0];

    // 最初のパターンを取得
    let currentResults = patterns[0];

    // 残りのパターンと結合
    for (let i = 1; i < patterns.length; i++) {
      const nextPattern = patterns[i];
      const combinedResults: string[] = [];

      // 制限付きの結合
      for (
        let j = 0;
        j < currentResults.length && combinedResults.length < maxResults;
        j++
      ) {
        for (
          let k = 0;
          k < nextPattern.length && combinedResults.length < maxResults;
          k++
        ) {
          combinedResults.push(currentResults[j] + nextPattern[k]);
        }
      }

      currentResults = combinedResults;

      // 結果サイズが制限を超えた場合
      if (currentResults.length >= maxResults) {
        currentResults = currentResults.slice(0, maxResults);
        break;
      }
    }

    return currentResults;
  }
}
