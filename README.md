# JpTransliterator

<div align="center">
    <img src="images/icon.png" width="250" />
</div>

## 特徴 / features

- かな文字(+記号)をキーイベントで入力可能なローマ字に変換します。<br>
  Converts kana characters (including symbols) to romaji that can be input via keyboard events.<br>

- ローマ字をかな文字に変換します。<br>
  Converts romaji to kana characters.<br>

- フレームワークに依存しません。React, Vue 等で使用可能です。<br>
  Framework-agnostic, usable with React, Vue, and other frameworks.

## デモ / Demo

- [Vue のデモ / Vue Demo](https://memolia3.github.io/jp-transliterator/)

## 追加機能

### パターン取得関数

新しいバージョンでは、以下のパターン取得関数が追加されました：

```typescript
// すべての変換パターンを取得
getAllRomajiPatterns(text: string): InputPatternMatrix | ConversionResult

// 文字ごとのローマ字パターンを取得
getCharacterPatterns(text: string): InputPatternMatrix | ConversionResult

// 完全な入力パターン情報（パターン、文字マップ、分割パターン）を取得
getCompletePatterns(text: string): AllInputPatterns | ConversionResult

// 標準的なパターンセット配列を取得
getPatternSets(text: string): PatternSetArray | ConversionResult
```

### 使用例

````typescript
import {
  getAllRomajiPatterns,
  getCharacterPatterns,
} from "jp-transliterator";

// すべての変換パターンを取得
const allPatterns = getAllRomajiPatterns("こんにちは");
console.log(allPatterns);
// 出力例: [["konnichiha"], ["konnnichiha"], ...]

// 文字ごとのローマ字パターンを取得
const characterPatterns = getCharacterPatterns("こんにちは");
console.log(characterPatterns);
// 出力例: [["ko", "n", "ni", "chi", "ha"], ["ko", "nn", "ni", "chi", "ha"], ...]

### パフォーマンス改善

このバージョンでは、Trie データ構造とストリーミング処理を取り入れ、メモリ使用量を大幅に削減しました：

- **Trie 構造**: 効率的な文字列検索と一致パターン取得
- **ストリーミング処理**: 大量のデータをメモリに保持せず処理
- **チャンク処理**: 長い入力を適切にチャンク分割して処理
- **特殊文字対応**: 拗音（「しゃ」「しゅ」「しょ」など）や促音（「っ」）が途中で分断されないチャンク処理
- **制御可能なチャンクサイズ**: チャンクサイズを 0 に設定することで分割なしの処理が可能

### オプション設定

変換処理のオプションを設定できます：

```typescript
import { toRomaji, toKana } from "jp-transliterator";

// チャンクサイズを指定（0を指定すると分割なし）
const romaji = toRomaji("こんにちは", { chunkSize: 0 });

// デフォルトのチャンクサイズで変換
const kana = toKana("konnichiwa");
````

チャンクサイズの指定について：

- `chunkSize: 0` - 入力を分割せず、すべての結果を生成（メモリ使用量に注意）
- `chunkSize: 5～15` - 一般的な用途には十分なチャンクサイズ
- 大きな値を指定すると、より多くの結果が生成されますが、メモリ使用量が増加します
