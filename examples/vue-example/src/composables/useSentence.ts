import { ref } from "vue";
import { getAllRomajiPatterns } from "jp-transliterator";

export function useSentence() {
  const romanSentence = ref<string>("");
  
  /**
   * テキストをローマ字に変換する
   * @param text 変換するテキスト
   * @returns 変換されたローマ字パターンの配列
   */
  const getRomanSentence = (text: string): string[] => {
    if (!text) return [];
    
    try {
      const result = getAllRomajiPatterns(text);
      
      if (Array.isArray(result) && result.length > 0) {
        // 確実に文字列の配列を返す
        return result.flat().map(pattern => 
          typeof pattern === 'string' ? pattern : String(pattern)
        );
      } else if (result && "error" in result) {
        console.error("変換エラー:", result.error);
        return [`変換エラー: ${result.error}`];
      }
      return [];
    } catch (error) {
      console.error("変換処理中にエラーが発生しました:", error);
      return ["変換エラーが発生しました"];
    }
  };

  return {
    romanSentence,
    getRomanSentence,
  };
}
