/**
 * テキスト処理ユーティリティクラス
 * 文字列の分割や処理に関する機能を提供
 */
export declare class TextProcessor {
    /**
     * チャンク分けのメソッド
     * メモリ使用量を最適化するため長い入力を適切なサイズに分割
     * 拗音や促音などの特殊な文字が途中で分割されないように調整
     * @param str 入力文字列
     * @param size チャンクサイズ（0の場合は分割しない）
     * @returns 分割されたチャンク配列
     */
    splitIntoChunks(str: string, size: number): string[];
    /**
     * チャンク処理結果の結合
     * @param results チャンク処理結果の配列
     * @returns 結合された結果
     */
    combineChunkResults<T>(results: T[]): T;
}
//# sourceMappingURL=text-processor.d.ts.map