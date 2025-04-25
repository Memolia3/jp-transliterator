# JP Transliterator テストデモ

このディレクトリには、JP Transliteratorライブラリの機能をテストするためのシンプルなウェブアプリケーションが含まれています。

## Node.jsサーバーで実行する方法（推奨）

1. 必要なパッケージをインストールします

```bash
cd test-demo
npm install
```

2. サーバーを起動します

```bash
npm start
```

3. ブラウザで http://localhost:8181 にアクセスします

これにより、Node.jsサーバーが起動し、JP Transliteratorライブラリの機能をAPIとして提供します。HTMLページからAPIを通じてライブラリの機能を使用できます。

## 機能

### 基本変換

- ローマ字 → かな変換
- かな → ローマ字変換

### 詳細パターン

- 全ローマ字パターン取得
- 文字ごとのパターン取得
- 完全パターン情報
- パターンセット取得

### 特殊文字対応

このバージョンでは、拗音（「しゃ」「しゅ」「しょ」など）や促音（「った」など）が途中で分断されないように改善されています。チャンク処理のアルゴリズムが拗音や促音の特性を考慮し、適切な位置で文字を分割します。

### チャンクサイズの制御

変換処理のチャンクサイズを制御することができます：

- チャンクサイズを0に設定すると、入力を分割せずに処理します（すべての可能な結果を生成）
- 大きな入力に対しては、適切なチャンクサイズを選択することでメモリ使用量とパフォーマンスのバランスを取ることができます

## APIエンドポイント

サーバーは以下のAPIエンドポイントを提供します：

- `/api/toRomaji` - かな→ローマ字変換
- `/api/toKana` - ローマ字→かな変換
- `/api/getAllRomajiPatterns` - 全ローマ字パターン取得
- `/api/getCharacterPatterns` - 文字ごとのパターン取得
- `/api/getCompletePatterns` - 完全パターン情報取得
- `/api/getPatternSets` - パターンセット取得

すべてのエンドポイントはPOSTリクエストを受け付け、`text`パラメータを含むJSONボディを期待します。オプションとして`options`パラメータを指定することで、チャンクサイズなどの設定を制御できます：

```json
{
  "text": "変換したいテキスト",
  "options": {
    "chunkSize": 0
  }
}
```

## 注意

このデモは、JP Transliteratorライブラリが`window.jpTransliterator`としてグローバルに公開されていることを前提としています。ライブラリがモジュールとして使用されている場合は、適切なバンドラーを使用してグローバル変数として公開するか、このデモページを修正する必要があります。

## 性能に関する注意

- チャンクサイズを0に設定すると、すべての可能な結果を生成するため、大きな入力に対してはメモリ不足エラーが発生する可能性があります
- デフォルトのチャンクサイズ（または適切な値）を使用することで、メモリ使用量を抑えつつ十分な結果を得ることができます

## スタンドアロンモードでテストする方法

以下のコードでJP Transliteratorをグローバル変数としてモックすることで、ライブラリなしでもUIをテストできます：

```javascript
window.jpTransliterator = {
    toRomaji: function(text) { 
        return "ローマ字変換結果: " + text;
    },
    toKana: function(text) { 
        return "かな変換結果: " + text;
    },
    getAllRomajiPatterns: function(text) { 
        return [["テスト", "パターン"]];
    },
    getCharacterPatterns: function(text) { 
        return [["分かち", "書き"]];
    },
    getCompletePatterns: function(text) { 
        return {
            patterns: [["完全", "パターン"]],
            charactersMap: new Map([["あ", ["a"]]]),
            segmented: [["せぐ", "めんと"]]
        };
    },
    getPatternSets: function(text) { 
        return [["パターン", ["セット"]]];
    }
};
```