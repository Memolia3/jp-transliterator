/**
 * テキスト処理ユーティリティクラス
 * 文字列の分割や処理に関する機能を提供
 */
export class TextProcessor {
  /**
   * チャンク分けのメソッド
   * メモリ使用量を最適化するため長い入力を適切なサイズに分割
   * 拗音や促音などの特殊な文字が途中で分割されないように調整
   * @param str 入力文字列
   * @param size チャンクサイズ（0の場合は分割しない）
   * @returns 分割されたチャンク配列
   */
  public splitIntoChunks(str: string, size: number): string[] {
    if (!str) return [];
    
    // チャンクサイズが0以下の場合は分割しない
    if (size <= 0) {
      return [str];
    }
    
    const chunks: string[] = [];
    let i = 0;
    
    while (i < str.length) {
      // 基本的なチャンク終了位置
      let end = Math.min(i + size, str.length);
      
      // すでに文字列の終わりに達していたら、そのまま追加
      if (end >= str.length) {
        chunks.push(str.slice(i));
        break;
      }
      
      // 適切な分割位置を探す（拗音や促音を分割しないため）
      let splitPos = end;
      
      // 小さい「っ」や「ゃ」「ゅ」「ょ」などの特殊文字チェック
      const smallKana = /[ぁぃぅぇぉっゃゅょゎァィゥェォッャュョヮ]/;
      
      // チャンク境界の前の文字から遡って特殊文字の連続を確認
      while (splitPos > i) {
        // 次の文字が小さい文字の場合、さらに1つ前に戻る
        if (splitPos < str.length && smallKana.test(str[splitPos])) {
          splitPos--;
          continue;
        }
        
        // 現在位置の文字が「し」「ち」などで、次が「ゅ」「ょ」などの拗音の場合を考慮
        if (splitPos > 0 && splitPos < str.length - 1 && 
            /[しちじにひみきぎりぴびシチジニヒミキギリピビ]/.test(str[splitPos - 1]) && 
            /[ゃゅょャュョ]/.test(str[splitPos])) {
          splitPos--;
          continue;
        }
        
        // 現在位置が「っ」で、前後に文字がある場合
        if (splitPos > 0 && /[っッ]/.test(str[splitPos - 1])) {
          splitPos--;
          continue;
        }
        
        // 適切な分割位置が見つかった
        break;
      }
      
      // 分割位置が元の位置より前になってしまったら、
      // 少なくとも1文字は進めるようにする
      if (splitPos <= i) {
        splitPos = i + 1;
      }
      
      chunks.push(str.slice(i, splitPos));
      i = splitPos;
    }
    
    return chunks;
  }

  /**
   * チャンク処理結果の結合
   * @param results チャンク処理結果の配列
   * @returns 結合された結果
   */
  public combineChunkResults<T>(results: T[]): T {
    if (!results.length) return null as T;
    if (results.length === 1) return results[0];

    // 配列の場合は単純に結合
    if (Array.isArray(results[0])) {
      return results.flat() as T;
    }

    // オブジェクトの場合はマージ
    if (typeof results[0] === "object" && results[0] !== null) {
      return Object.assign({}, ...results) as T;
    }

    // その他の型は最初の結果を返す
    return results[0];
  }
}
