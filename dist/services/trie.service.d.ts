/**
 * Trieノードのインターフェース
 */
export interface TrieNode {
    children: Map<string, TrieNode>;
    patterns: string[] | null;
    isEndOfWord: boolean;
}
/**
 * Trieサービス
 * 文字列の検索と取得を効率的に行うためのデータ構造
 */
export declare class TrieService {
    private root;
    constructor();
    /**
     * 新しいTrieノードを作成
     */
    private createNode;
    /**
     * 文字列とそのパターンをTrieに挿入
     * @param key キー文字列
     * @param patterns パターン配列
     */
    insert(key: string, patterns: string[]): void;
    /**
     * キーに対応するパターンを検索
     * @param key 検索キー
     * @returns パターン配列または未定義
     */
    search(key: string): string[] | null;
    /**
     * 文字列の先頭から最長一致するパターンを検索
     * @param str 入力文字列
     * @param startIndex 開始インデックス
     * @returns 一致したノードとその長さ、またはnull
     */
    searchLongestPrefix(str: string, startIndex?: number): {
        node: TrieNode;
        length: number;
    } | null;
}
//# sourceMappingURL=trie.service.d.ts.map