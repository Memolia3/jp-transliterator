/**
 * Trieノードのインターフェース
 */
export interface TrieNode {
  children: Map<string, TrieNode>;
  patterns: string[] | null;
  isEndOfWord: boolean;
}

/**
 * Trieデータ構造
 * 文字列の検索と取得を効率的に行うためのデータ構造
 */
export default class Trie {
  private root: TrieNode;

  constructor() {
    this.root = this.createNode();
  }

  /**
   * 新しいTrieノードを作成
   */
  private createNode(): TrieNode {
    return {
      children: new Map<string, TrieNode>(),
      patterns: null,
      isEndOfWord: false,
    };
  }

  /**
   * 文字列とそのパターンをTrieに挿入
   * @param key キー文字列
   * @param patterns パターン配列
   */
  insert(key: string, patterns: string[]): void {
    let node = this.root;

    for (let i = 0; i < key.length; i++) {
      const char = key[i];
      if (!node.children.has(char)) {
        node.children.set(char, this.createNode());
      }
      node = node.children.get(char)!;
    }

    node.isEndOfWord = true;
    node.patterns = patterns;
  }

  /**
   * キーに対応するパターンを検索
   * @param key 検索キー
   * @returns パターン配列または未定義
   */
  search(key: string): string[] | null {
    let node = this.root;

    for (let i = 0; i < key.length; i++) {
      const char = key[i];
      if (!node.children.has(char)) {
        return null;
      }
      node = node.children.get(char)!;
    }

    return node.isEndOfWord ? node.patterns : null;
  }

  /**
   * 文字列の先頭から最長一致するパターンを検索
   * @param str 入力文字列
   * @param startIndex 開始インデックス
   * @returns 一致したノードとその長さ、またはnull
   */
  searchLongestPrefix(
    str: string,
    startIndex: number = 0
  ): { node: TrieNode; length: number } | null {
    let node = this.root;
    let lastMatchNode: TrieNode | null = null;
    let lastMatchLength = 0;

    for (let i = startIndex; i < str.length; i++) {
      const char = str[i];
      if (!node.children.has(char)) {
        break;
      }

      node = node.children.get(char)!;

      if (node.isEndOfWord) {
        lastMatchNode = node;
        lastMatchLength = i - startIndex + 1;
      }
    }

    return lastMatchNode
      ? { node: lastMatchNode, length: lastMatchLength }
      : null;
  }
}
