# JpTransliterator
<div align="center">
    <img src="images/icon.png" width="250" />
</div>

## 特徴 / features
- かな文字(+記号)をキーイベントで入力可能なローマ字に変換します。<br>
Converts kana characters (including symbols) to romaji that can be input via keyboard events.<br>

- ローマ字をかな文字に変換します。<br>
Converts romaji to kana characters.<br>

- フレームワークに依存しません。React, Vue等で使用可能です。<br>
Framework-agnostic, usable with React, Vue, and other frameworks.

## デモ / Demo

- [Vueのデモ / Vue Demo](https://memolia3.github.io/jp-transliterator/)

## 追加機能

### パターン取得関数

新しいバージョンでは、以下のパターン取得関数が追加されました：

```typescript
// 全ての入力パターンを2次元配列で取得
getAllInputPatterns(text: string): InputPatternMatrix | ConversionResult

// 日本語1文字を基準としてカンマ区切りされた入力パターンを2次元配列で取得
getSegmentedPatterns(text: string): InputPatternMatrix | ConversionResult  

// 完全な入力パターン情報（パターン、文字マップ、分割パターン）を取得
getCompletePatterns(text: string): AllInputPatterns | ConversionResult

// 標準的なパターンセット配列を取得
getPatternSets(text: string): PatternSetArray | ConversionResult
```

### 使用例

```typescript
import { 
  getAllInputPatterns, 
  getSegmentedPatterns,
  getCompletePatterns
} from 'jp-transliterator';

// すべての入力パターンを2次元配列で取得
const allPatterns = getAllInputPatterns('こんにちは');
console.log(allPatterns);
// 出力例: [["ko", "n", "ni", "chi", "ha"], ["ko", "nn", "ni", "chi", "ha"], ...]

// カンマ区切りパターンを取得
const segmentedPatterns = getSegmentedPatterns('こんにちは');
console.log(segmentedPatterns);
// 出力例: [["ko", "n", "ni", "chi", "ha"], ["ko", "nn", "ni", "chi", "ha"], ...]

// 完全な入力パターン情報
const completePatterns = getCompletePatterns('こんにちは');
console.log(completePatterns.patterns); // すべてのパターン
console.log(completePatterns.charactersMap); // 文字ごとのマップ
console.log(completePatterns.segmented); // 分割パターン
```

### パフォーマンス改善

このバージョンでは、Trieデータ構造とストリーミング処理を取り入れ、メモリ使用量を大幅に削減しました：

- **Trie構造**: 効率的な文字列検索と一致パターン取得
- **ストリーミング処理**: 大量のデータをメモリに保持せず処理
- **チャンク処理**: 長い入力を適切にチャンク分割して処理
- **結果の制限**: 爆発的な数の組み合わせを防止


