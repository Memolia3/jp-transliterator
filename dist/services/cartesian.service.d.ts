import type { Combinations } from "../types/transliterate.types";
/**
 * カーテシアン積計算サービス
 * 組み合わせの直積計算を効率的に行う
 */
export declare class CartesianService {
    /**
     * ストリーミング方式でカーテシアン積を計算
     * メモリ使用量を制御しながら大きな直積を計算
     * @param set1 最初の集合
     * @param set2 2番目の集合
     * @param maxResults 最大結果数
     */
    combineCartesian(set1: Combinations, set2: Combinations, maxResults: number): Combinations;
    /**
     * 複数の配列のカーテシアン積を計算
     * @param arrays 配列の配列
     * @param maxResults 最大結果数
     */
    calculateCartesianProduct<T>(arrays: T[][], maxResults?: number): T[][];
    /**
     * 複数のパターンの直積を計算
     * @param patterns パターンの配列
     * @param maxResults 最大結果数
     */
    calculatePatternProduct(patterns: string[][], maxResults?: number): string[];
}
//# sourceMappingURL=cartesian.service.d.ts.map