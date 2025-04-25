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

- 全パターン取得
- 分かち書きパターン
- 完全パターン情報
- パターンセット取得

## APIエンドポイント

サーバーは以下のAPIエンドポイントを提供します：

- `/api/toRomaji` - かな→ローマ字変換
- `/api/toKana` - ローマ字→かな変換
- `/api/getAllInputPatterns` - 全入力パターン取得
- `/api/getSegmentedPatterns` - 分かち書きパターン取得
- `/api/getCompletePatterns` - 完全パターン情報取得
- `/api/getPatternSets` - パターンセット取得

すべてのエンドポイントはPOSTリクエストを受け付け、`text`パラメータを含むJSONボディを期待します。

## 注意

このデモは、JP Transliteratorライブラリが`window.jpTransliterator`としてグローバルに公開されていることを前提としています。ライブラリがモジュールとして使用されている場合は、適切なバンドラーを使用してグローバル変数として公開するか、このデモページを修正する必要があります。

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
    getAllInputPatterns: function(text) { 
        return [["テスト", "パターン"]];
    },
    getSegmentedPatterns: function(text) { 
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