class b {
  /**
   * チャンク分けのメソッド
   * メモリ使用量を最適化するため長い入力を適切なサイズに分割
   * 拗音や促音などの特殊な文字が途中で分割されないように調整
   * @param str 入力文字列
   * @param size チャンクサイズ（0の場合は分割しない）
   * @returns 分割されたチャンク配列
   */
  splitIntoChunks(t, n) {
    if (!t) return [];
    if (n <= 0)
      return [t];
    const e = [];
    let r = 0;
    for (; r < t.length; ) {
      let i = Math.min(r + n, t.length);
      if (i >= t.length) {
        e.push(t.slice(r));
        break;
      }
      let s = i;
      const a = /[ぁぃぅぇぉっゃゅょゎァィゥェォッャュョヮ]/;
      for (; s > r; ) {
        if (s < t.length && a.test(t[s])) {
          s--;
          continue;
        }
        if (s > 0 && s < t.length - 1 && /[しちじにひみきぎりぴびシチジニヒミキギリピビ]/.test(t[s - 1]) && /[ゃゅょャュョ]/.test(t[s])) {
          s--;
          continue;
        }
        if (s > 0 && /[っッ]/.test(t[s - 1])) {
          s--;
          continue;
        }
        break;
      }
      s <= r && (s = r + 1), e.push(t.slice(r, s)), r = s;
    }
    return e;
  }
  /**
   * チャンク処理結果の結合
   * @param results チャンク処理結果の配列
   * @returns 結合された結果
   */
  combineChunkResults(t) {
    return t.length ? t.length === 1 ? t[0] : Array.isArray(t[0]) ? t.flat() : typeof t[0] == "object" && t[0] !== null ? Object.assign({}, ...t) : t[0] : null;
  }
}
class R {
  constructor() {
    this.textProcessor = new b();
  }
  /**
   * エラーハンドリングを含む変換プロセス
   * @param str 変換対象文字列
   * @param options 変換オプション
   */
  transliterate(t, n) {
    const e = (n == null ? void 0 : n.chunkSize) ?? 0;
    if (!(t != null && t.length)) return null;
    try {
      return this.processTransliteration(t, e);
    } catch (r) {
      return {
        error: `変換エラーが発生しました: ${r instanceof Error ? r.message : String(r)}`
      };
    }
  }
}
class m {
  constructor() {
    this.root = this.createNode();
  }
  /**
   * 新しいTrieノードを作成
   */
  createNode() {
    return {
      children: /* @__PURE__ */ new Map(),
      patterns: null,
      isEndOfWord: !1
    };
  }
  /**
   * 文字列とそのパターンをTrieに挿入
   * @param key キー文字列
   * @param patterns パターン配列
   */
  insert(t, n) {
    let e = this.root;
    for (let r = 0; r < t.length; r++) {
      const i = t[r];
      e.children.has(i) || e.children.set(i, this.createNode()), e = e.children.get(i);
    }
    e.isEndOfWord = !0, e.patterns = n;
  }
  /**
   * キーに対応するパターンを検索
   * @param key 検索キー
   * @returns パターン配列または未定義
   */
  search(t) {
    let n = this.root;
    for (let e = 0; e < t.length; e++) {
      const r = t[e];
      if (!n.children.has(r))
        return null;
      n = n.children.get(r);
    }
    return n.isEndOfWord ? n.patterns : null;
  }
  /**
   * 文字列の先頭から最長一致するパターンを検索
   * @param str 入力文字列
   * @param startIndex 開始インデックス
   * @returns 一致したノードとその長さ、またはnull
   */
  searchLongestPrefix(t, n = 0) {
    let e = this.root, r = null, i = 0;
    for (let s = n; s < t.length; s++) {
      const a = t[s];
      if (!e.children.has(a))
        break;
      e = e.children.get(a), e.isEndOfWord && (r = e, i = s - n + 1);
    }
    return r ? { node: r, length: i } : null;
  }
}
class T {
  /**
   * コンストラクタ
   * @param transliterationMap 変換マップ
   */
  constructor(t) {
    this.specialCharSets = [], this.patternCache = /* @__PURE__ */ new Map(), this.searchCache = /* @__PURE__ */ new Map(), this.longestMatchCache = /* @__PURE__ */ new Map(), this.MAX_CACHE_SIZE = 1e3, this.MAX_SEARCH_CACHE_SIZE = 500, this.MAX_MATCH_CACHE_SIZE = 200;
    const n = Object.entries(
      t
    ).reduce((e, [r, i]) => (r.split("|").forEach((s) => {
      e[s] = i;
    }), e), {});
    this.mapTrie = new m(), this.specialPatterns = {}, this.initializePatternContainers(n);
  }
  /**
   * 特殊文字セットを初期化
   * @param specialSets 特殊文字セットの配列
   */
  initializeSpecialSets(t) {
    this.specialCharSets = t;
    const n = new m(), e = {
      ...this.specialPatterns
    }, r = /* @__PURE__ */ new Set();
    for (const i of t)
      for (const s of i) {
        r.add(s);
        const a = this.mapTrie.search(s);
        a && (e[s] = a);
      }
    for (const [i, s] of Object.entries(e))
      r.has(i) || n.insert(i, s);
    this.specialPatterns = e, this.clearCaches();
  }
  /**
   * すべてのキャッシュをクリア
   */
  clearCaches() {
    this.patternCache.clear(), this.searchCache.clear(), this.longestMatchCache.clear();
  }
  /**
   * キーに対応するパターンを検索
   * @param key 検索キー
   * @returns パターン配列または未定義
   */
  search(t) {
    const n = this.searchCache.get(t);
    if (n !== void 0)
      return n;
    let e = null;
    return t in this.specialPatterns ? e = this.specialPatterns[t] : e = this.mapTrie.search(t), this.searchCache.size >= this.MAX_SEARCH_CACHE_SIZE && this.searchCache.clear(), this.searchCache.set(t, e), e;
  }
  /**
   * マップの内容をTrieと特殊パターンに振り分ける
   * @param optimizedMap 最適化されたマップ
   */
  initializePatternContainers(t) {
    const n = /* @__PURE__ */ new Set();
    for (const r of this.specialCharSets)
      for (const i of r)
        n.add(i);
    const e = [];
    for (const [r, i] of Object.entries(t))
      n.has(r) ? this.specialPatterns[r] = i : e.push([r, i]);
    for (const [r, i] of e)
      this.mapTrie.insert(r, i);
  }
  /**
   * 特殊パターンを取得
   * @param char 対象文字
   */
  getSpecialPatterns(t) {
    return this.specialPatterns[t] || null;
  }
  /**
   * 文字列の中で最長一致するパターンを検索
   * @param str 検索対象文字列
   * @param startIndex 開始インデックス
   * @param specialSets 特殊文字のセット（Trieから除外するための）
   */
  findLongestMatch(t, n, ...e) {
    const r = `${t.substring(
      n,
      n + 10
    )}_${n}`, i = this.longestMatchCache.get(r);
    if (i !== void 0)
      return i;
    let s = null;
    if (e.some((h) => h.has(t[n]))) {
      const h = t[n], o = this.specialPatterns[h];
      o && (s = { pattern: o, length: 1 });
    }
    const a = this.mapTrie.searchLongestPrefix(t, n);
    return a && a.node.patterns && (!s || a.length > s.length) && (s = {
      pattern: a.node.patterns,
      length: a.length
    }), this.longestMatchCache.size >= this.MAX_MATCH_CACHE_SIZE && this.longestMatchCache.clear(), this.longestMatchCache.set(r, s), s;
  }
  /**
   * 入力文字列に対応するすべてのパターンを取得
   * @param str 入力文字列
   */
  getInputPatterns(t) {
    const n = [];
    for (let e = 0; e < t.length; e++) {
      const r = t[e], i = this.mapTrie.search(r);
      if (i)
        n.push({ pattern: i, char: r });
      else {
        const s = this.specialPatterns[r];
        s ? n.push({ pattern: s, char: r }) : n.push({ pattern: [r], char: r });
      }
    }
    return n;
  }
  /**
   * 変換結果から入力文字列を取得
   * @param combinations Romanizer/Japanizerからの変換結果
   * @param index 取得するインデックス（デフォルトは0）
   * @returns 入力文字列
   */
  getInput(t, n = 0) {
    return typeof t == "string" ? t in this.specialPatterns ? this.specialPatterns[t] : this.mapTrie.search(t) || [t] : !t || !t.length ? "" : t.length > n && t[n] && t[n][0].length > 0 ? t[n][0][0] : "";
  }
  /**
   * キャッシュからパターンを取得、またはキャッシュに追加
   * @param key キャッシュキー
   * @param generator パターン生成関数
   */
  getOrCachePatterns(t, n) {
    const e = this.patternCache.get(t);
    if (e) return e;
    const r = n();
    return this.patternCache.size >= this.MAX_CACHE_SIZE && this.patternCache.clear(), t.length <= 20 && this.patternCache.set(t, r), r;
  }
  /**
   * 複合パターン（2文字以上の連続）を取得
   * @param str 入力文字列
   * @param startIndex 開始インデックス
   */
  getCompoundPatterns(t, n) {
    const e = [];
    for (let r = 2; r <= 4 && n + r <= t.length; r++) {
      const i = t.substring(n, n + r), s = this.mapTrie.search(i);
      s && e.push({ patterns: [s], length: r });
    }
    return e;
  }
  /**
   * 変換結果から全ての入力パターンを2次元配列で取得
   * @param combinations Romanizer/Japanizerからの変換結果
   * @returns 入力パターンの2次元配列
   */
  getAllRomajiPatterns(t) {
    if (!t || !t.length) return [];
    const n = [];
    for (const [e, r] of t)
      e && e.length > 0 && r.length > 0 && n.push([r.join("")]);
    return n;
  }
  /**
   * 変換結果から日本語文字ごとのカンマ区切りパターンを2次元配列で取得
   * @param combinations Romanizer/Japanizerからの変換結果
   * @returns カンマ区切りされた入力パターンの2次元配列
   */
  getCharacterPatterns(t) {
    if (!t || !t.length) return [];
    const n = [];
    for (const [e, r] of t)
      r && r.length > 0 && n.push(r);
    return n;
  }
  /**
   * 変換結果から完全な入力パターン情報を取得
   * @param combinations Romanizer/Japanizerからの変換結果
   * @param originalText 元の日本語テキスト（オプション）
   * @returns 全入力パターン情報
   */
  getCompletePatterns(t) {
    if (!t || !t.length)
      return {
        patterns: [],
        segmented: []
      };
    const n = this.getAllRomajiPatterns(t), e = this.getCharacterPatterns(t);
    return {
      patterns: n,
      segmented: e
    };
  }
  /**
   * 変換結果を標準的なパターンセット配列に変換
   * @param combinations Romanizer/Japanizerからの変換結果
   * @returns パターンセット配列
   */
  toPatternSetArray(t) {
    return !t || !t.length ? [] : t.map(([n, e]) => [n.length > 0 ? n[0] : "", e]);
  }
  /**
   * 指定された文字列のパターンを配列形式で取得します
   * @param query 検索する文字列またはCombinations
   * @returns 可能なローマ字入力パターンの2次元配列
   */
  getInputMatrix(t) {
    const n = this.getSpecialPatterns(t);
    if (n)
      return [n];
    if (this.mapTrie) {
      const e = this.mapTrie.search(t);
      if (e)
        return [e];
    }
    return t.split("").map((e) => [e]);
  }
  /**
   * 日本語文字列を文字ごとに分割します
   * @param japaneseText 分割する日本語文字列
   * @returns 分割された文字の配列
   */
  segmentJapaneseText(t) {
    const n = [];
    let e = 0;
    for (; e < t.length; )
      e + 1 < t.length && t.charCodeAt(e) >= 55296 && t.charCodeAt(e) <= 56319 ? (n.push(t.substring(e, e + 2)), e += 2) : (n.push(t[e]), e++);
    return n;
  }
}
class M {
  /**
   * ストリーミング方式でカーテシアン積を計算
   * メモリ使用量を制御しながら大きな直積を計算
   * @param set1 最初の集合
   * @param set2 2番目の集合
   * @param maxResults 最大結果数
   */
  combineCartesian(t, n, e) {
    const r = [];
    let i = 0;
    for (const [s, a] of t) {
      for (const [h, o] of n) {
        if (i >= e) break;
        const l = s.flatMap(
          (g) => h.map((C) => g + C)
        ), f = [...a, ...o];
        r.push([l, f]), i++;
      }
      if (i >= e) break;
    }
    return r;
  }
  /**
   * 複数の配列のカーテシアン積を計算
   * @param arrays 配列の配列
   * @param maxResults 最大結果数
   */
  calculateCartesianProduct(t, n = Number.MAX_SAFE_INTEGER) {
    if (t.length === 0) return [[]];
    if (t.length === 1) return t[0].map((a) => [a]);
    const e = [], r = t[0], i = t.slice(1), s = this.calculateCartesianProduct(
      i,
      n
    );
    for (const a of r) {
      for (const h of s) {
        if (e.length >= n) break;
        e.push([a, ...h]);
      }
      if (e.length >= n) break;
    }
    return e;
  }
  /**
   * 複数のパターンの直積を計算
   * @param patterns パターンの配列
   * @param maxResults 最大結果数
   */
  calculatePatternProduct(t, n = Number.MAX_SAFE_INTEGER) {
    if (t.length === 0) return [];
    if (t.length === 1) return t[0];
    let e = t[0];
    for (let r = 1; r < t.length; r++) {
      const i = t[r], s = [];
      for (let a = 0; a < e.length; a++) {
        for (let h = 0; h < i.length && (s.push(e[a] + i[h]), !(s.length >= n)); h++)
          ;
        if (s.length >= n)
          break;
      }
      e = s, e.length >= n && (e = e.slice(0, n));
    }
    return e;
  }
}
class k {
  /**
   * 全角文字を半角に変換
   * @param str 変換対象文字列
   */
  toHalfWidth(t) {
    return t ? t.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (e) => String.fromCharCode(e.charCodeAt(0) - 65248)).replace(/　/g, " ") : "";
  }
  /**
   * 半角文字を全角に変換
   * @param str 変換対象文字列
   */
  toFullWidth(t) {
    return t ? t.replace(/[A-Za-z0-9]/g, (e) => String.fromCharCode(e.charCodeAt(0) + 65248)).replace(/ /g, "　") : "";
  }
  /**
   * カタカナをひらがなに変換
   * @param str 変換対象文字列
   */
  katakanaToHiragana(t) {
    return t.replace(/[\u30a1-\u30f6]/g, (n) => {
      const e = n.charCodeAt(0) - 96;
      return String.fromCharCode(e);
    });
  }
  /**
   * ひらがなをカタカナに変換
   * @param str 変換対象文字列
   */
  hiraganaToKatakana(t) {
    return t.replace(/[\u3041-\u3096]/g, (n) => {
      const e = n.charCodeAt(0) + 96;
      return String.fromCharCode(e);
    });
  }
  /**
   * 特殊記号を正規化
   * @param str 変換対象文字列
   */
  normalizeSymbols(t) {
    return t.replace(/[‐－―]/g, "-").replace(/[～〜]/g, "~").replace(/[""″″]/g, '"').replace(/[''′′]/g, "'").replace(/[　]/g, " ");
  }
  /**
   * 入力文字列を正規化（複数の正規化を一度に適用）
   * @param str 変換対象文字列
   */
  normalizeInput(t) {
    return this.normalizeSymbols(this.toHalfWidth(t));
  }
}
const _ = {
  "あ|ア": ["a"],
  "い|イ": ["i", "yi"],
  "う|ウ": ["u", "wu", "whu"],
  "え|エ": ["e"],
  "お|オ": ["o"],
  "ぁ|ァ": ["xa", "la"],
  "ぃ|ィ": ["xi", "li", "yi"],
  "ぅ|ゥ": ["xu", "lu"],
  "ぇ|ェ": ["xe", "le", "ye"],
  "ぉ|ォ": ["xo", "lo"],
  "ゃ|ャ": ["xya", "lya"],
  "ゅ|ュ": ["xyu", "lyu"],
  "ょ|ョ": ["xyo", "lyo"],
  "か|カ": ["ka", "ca"],
  "き|キ": ["ki"],
  "く|ク": ["ku", "cu", "qu"],
  "け|ケ": ["ke"],
  "こ|コ": ["ko", "co"],
  "きゃ|キャ": ["kya"],
  "きぃ|キィ": ["kyi"],
  "きゅ|キュ": ["kyu"],
  "きぇ|キェ": ["kye"],
  "きょ|キョ": ["kyo"],
  "くぁ|クァ": ["qa", "qwa", "kwa"],
  "くぃ|クィ": ["qi", "qwi", "qyi"],
  "くぅ|クゥ": ["qwu"],
  "くぇ|クェ": ["qe", "qwe", "qye"],
  "くぉ|クォ": ["qo", "qwo"],
  "くゃ|クャ": ["qya"],
  "くゅ|クュ": ["qyu"],
  "くょ|クョ": ["qyo"],
  "が|ガ": ["ga"],
  "ぎ|ギ": ["gi"],
  "ぐ|グ": ["gu"],
  "げ|ゲ": ["ge"],
  "ご|ゴ": ["go"],
  "ぎゃ|ギャ": ["gya"],
  "ぎぃ|ギィ": ["gyi"],
  "ぎゅ|ギュ": ["gyu"],
  "ぎぇ|ギェ": ["gye"],
  "ぎょ|ギョ": ["gyo"],
  "さ|サ": ["sa"],
  "し|シ": ["shi", "si", "ci"],
  "す|ス": ["su"],
  "せ|セ": ["se", "ce"],
  "そ|ソ": ["so"],
  "しゃ|シャ": ["sha", "sya"],
  "しぃ|シィ": ["syi"],
  "しゅ|シュ": ["shu", "syu"],
  "しぇ|シェ": ["she", "sye"],
  "しょ|ショ": ["sho", "syo"],
  "ざ|ザ": ["za"],
  "じ|ジ": ["ji", "zi"],
  "ず|ズ": ["zu"],
  "ぜ|ゼ": ["ze"],
  "ぞ|ゾ": ["zo"],
  "じゃ|ジャ": ["ja", "jya", "zya"],
  "じぃ|ジィ": ["jyi", "zyi"],
  "じゅ|ジュ": ["ju", "jyu", "zyu"],
  "じぇ|ジェ": ["je", "jye", "zye"],
  "じょ|ジョ": ["jo", "jyo", "zyo"],
  "すぁ|スァ": ["swa"],
  "すぃ|スィ": ["swi"],
  "すぅ|スゥ": ["swu"],
  "すぇ|スェ": ["swe"],
  "すぉ|スォ": ["swo"],
  "た|タ": ["ta"],
  "ち|チ": ["chi", "ti"],
  "つ|ツ": ["tsu", "tu"],
  "て|テ": ["te"],
  "と|ト": ["to"],
  "ちゃ|チャ": ["tya", "cya", "cha"],
  "ちぃ|チィ": ["tyi", "cyi", "chi"],
  "ちゅ|チュ": ["tyu", "cyu", "chu"],
  "ちぇ|チェ": ["tye", "cye", "che"],
  "ちょ|チョ": ["tyo", "cyo", "cho"],
  "だ|ダ": ["da"],
  "ぢ|ヂ": ["di"],
  "づ|ヅ": ["du"],
  "で|デ": ["de"],
  "ど|ド": ["do"],
  "ぢゃ|ヂャ": ["dya"],
  "ぢぃ|ヂィ": ["dyi"],
  "ぢゅ|ヂュ": ["dyu"],
  "ぢぇ|ヂェ": ["dye"],
  "ぢょ|ヂョ": ["dyo"],
  "でゃ|デャ": ["dha"],
  "でぃ|ディ": ["dhi"],
  "でゅ|デュ": ["dhu"],
  "でぇ|デェ": ["dhe"],
  "でょ|デョ": ["dho"],
  "つぁ|ツァ": ["tsa"],
  "つぃ|ツィ": ["tsi"],
  "つぇ|ツェ": ["tse"],
  "つぉ|ツォ": ["tso"],
  "てゃ|テャ": ["tha"],
  "てぃ|ティ": ["thi"],
  "てゅ|テュ": ["thu"],
  "てぇ|テェ": ["the"],
  "てょ|テョ": ["tho"],
  "とぁ|トァ": ["twa"],
  "とぃ|トィ": ["twi"],
  "とぅ|トゥ": ["twu"],
  "とぇ|トェ": ["twe"],
  "とぉ|トォ": ["two"],
  "どぁ|ドァ": ["dwa"],
  "どぃ|ドィ": ["dwi"],
  "どぅ|ドゥ": ["dwu"],
  "どぇ|ドェ": ["dwe"],
  "どぉ|ドォ": ["dwo"],
  "な|ナ": ["na"],
  "に|ニ": ["ni"],
  "ぬ|ヌ": ["nu"],
  "ね|ネ": ["ne"],
  "の|ノ": ["no"],
  "にゃ|ニャ": ["nya"],
  "にぃ|ニィ": ["nyi"],
  "にゅ|ニュ": ["nyu"],
  "にぇ|ニェ": ["nye"],
  "にょ|ニョ": ["nyo"],
  "は|ハ": ["ha"],
  "ひ|ヒ": ["hi"],
  "ふ|フ": ["fu", "hu"],
  "へ|ヘ": ["he"],
  "ほ|ホ": ["ho"],
  "ひゃ|ヒャ": ["hya"],
  "ひぃ|ヒィ": ["hyi"],
  "ひゅ|ヒュ": ["hyu"],
  "ひぇ|ヒェ": ["hye"],
  "ひょ|ヒョ": ["hyo"],
  "ぱ|パ": ["pa"],
  "ぴ|ピ": ["pi"],
  "ぷ|プ": ["pu"],
  "ぺ|ペ": ["pe"],
  "ぽ|ポ": ["po"],
  "ぴゃ|ピャ": ["pya"],
  "ぴぃ|ピィ": ["pyi"],
  "ぴゅ|ピュ": ["pyu"],
  "ぴぇ|ピェ": ["pye"],
  "ぴょ|ピョ": ["pyo"],
  "ば|バ": ["ba"],
  "び|ビ": ["bi"],
  "ぶ|ブ": ["bu"],
  "べ|ベ": ["be"],
  "ぼ|ボ": ["bo"],
  "びゃ|ビャ": ["bya"],
  "びぃ|ビィ": ["byi"],
  "びゅ|ビュ": ["byu"],
  "びぇ|ビェ": ["bye"],
  "びょ|ビョ": ["byo"],
  "ふぁ|ファ": ["fa", "fwa"],
  "ふぃ|フィ": ["fi", "fyi", "fwi"],
  "ふぅ|フゥ": ["fwu"],
  "ふぇ|フェ": ["fe", "fye", "fwe"],
  "ふぉ|フォ": ["fo", "fwo"],
  "ふゃ|フャ": ["fya"],
  "ふゅ|フュ": ["fyu"],
  "ふょ|フョ": ["fyo"],
  "ま|マ": ["ma"],
  "み|ミ": ["mi"],
  "む|ム": ["mu"],
  "め|メ": ["me"],
  "も|モ": ["mo"],
  "みゃ|ミャ": ["mya"],
  "みぃ|ミィ": ["myi"],
  "みゅ|ミュ": ["myu"],
  "みぇ|ミェ": ["mye"],
  "みょ|ミョ": ["myo"],
  "や|ヤ": ["ya"],
  "ゆ|ユ": ["yu"],
  "よ|ヨ": ["yo"],
  "ら|ラ": ["ra"],
  "り|リ": ["ri"],
  "る|ル": ["ru"],
  "れ|レ": ["re"],
  "ろ|ロ": ["ro"],
  "りゃ|リャ": ["rya"],
  "りぃ|リィ": ["ryi"],
  "りゅ|リュ": ["ryu"],
  "りぇ|リェ": ["rye"],
  "りょ|リョ": ["ryo"],
  "わ|ワ": ["wa"],
  "うぁ|ウァ": ["wha"],
  "うぃ|ウィ": ["wi", "whi"],
  "うぇ|ウェ": ["we", "whe"],
  "うぉ|ウォ": ["who"],
  "を|ヲ": ["wo"],
  "ん|ン": ["nn", "n"],
  "ゔぁ|ヴァ": ["va", "vya"],
  "ゔぃ|ヴィ": ["vi", "vyi"],
  "ゔ|ヴ": ["vu"],
  "ゔぇ|ヴェ": ["ve", "vye"],
  "ゔぉ|ヴォ": ["vo"],
  "ゔゅ|ヴュ": ["vyu"],
  "ゔょ|ヴョ": ["vyo"],
  "っ|ッ": ["xtu", "xtsu", "ltu", "ltsu"],
  "ゎ|ヮ": ["xwa", "lwa"],
  "ゕ|ヵ": ["xka", "lka"],
  "ゖ|ヶ": ["xke", "lke"],
  "。": ["."],
  "、": [","],
  ー: ["-"],
  "「": ["["],
  "」": ["]"],
  "（": ["("],
  "）": [")"],
  "｛": ["{"],
  "｝": ["}"],
  "【": ["["],
  "】": ["]"],
  "〜": ["~"],
  "・": ["/"],
  "‐": ["-"],
  "！": ["!"],
  "？": ["?"],
  "：": [":"],
  "；": [";"],
  "＃": ["#"],
  "％": ["%"],
  "＆": ["&"],
  "＊": ["*"],
  "＋": ["+"],
  "－": ["-"],
  "＄": ["$"],
  "＠": ["@"],
  "＾": ["^"],
  "＿": ["_"],
  "～": ["~"],
  "｜": ["|"],
  "＝": ["="],
  "＜": ["<"],
  "＞": [">"],
  "１": ["1"],
  "２": ["2"],
  "３": ["3"],
  "４": ["4"],
  "５": ["5"],
  "６": ["6"],
  "７": ["7"],
  "８": ["8"],
  "９": ["9"],
  "０": ["0"],
  1: ["1"],
  2: ["2"],
  3: ["3"],
  4: ["4"],
  5: ["5"],
  6: ["6"],
  7: ["7"],
  8: ["8"],
  9: ["9"],
  0: ["0"]
}, p = {};
for (const [u, t] of Object.entries(
  _
)) {
  const [n, e] = u.split("|");
  t.forEach((r) => {
    p[r] ? (p[r].includes(n) || p[r].push(n), p[r].includes(e) || p[r].push(e)) : p[r] = [n, e];
  });
}
const c = class c extends R {
  constructor() {
    super(), this.MAX_RESULT_SIZE = Number.MAX_SAFE_INTEGER, this.SMALL_CHUNK_SIZE = 5, this.LONG_TEXT_THRESHOLD = 20, this.patternService = new T(
      _
    ), this.cartesianService = new M(), this.textConverterService = new k(), this.patternService.initializeSpecialSets([
      c.N_CHARS,
      c.TSU_CHARS
    ]);
  }
  /**
   * 実際の変換プロセスを実装
   */
  processTransliteration(t, n) {
    if (!t) return null;
    const e = this.textConverterService.toHalfWidth(t), r = [];
    for (let i = 0; i < e.length; i++)
      this.isSpecialCharacter(e[i]) && r.push(i);
    if (this.isOnlySpecialCharacters(e)) {
      const i = this.createDirectMapping(e);
      return i.length > 0 ? i : null;
    }
    return r.length > 0 ? this.processWithSpecialChars(e, r) : this.processNormalText(e, n);
  }
  /**
   * 特殊文字を含む文字列の処理
   */
  processWithSpecialChars(t, n) {
    const e = [];
    let r = 0;
    for (const s of n)
      s > r && e.push(t.substring(r, s)), e.push(t[s]), r = s + 1;
    r < t.length && e.push(t.substring(r));
    const i = [];
    for (const s of e) {
      if (s.length === 1 && this.isSpecialCharacter(s)) {
        const o = this.patternService.search(s) || [s];
        i.push([[[o[0]], [o[0]]]]);
        continue;
      }
      const a = this.generatePatternArray(s);
      if (!a.length) continue;
      const h = s.length > 10 && a.length > 10 ? this.processLongSegment(s, a) : this.generateAllCombinations(a, s);
      if (h.length === 0) {
        const o = a.map((l) => l[0]);
        i.push([[[o.join("")], o]]);
      } else
        i.push(h);
    }
    return this.combineResults(i);
  }
  /**
   * 長いセグメントの処理
   */
  processLongSegment(t, n) {
    const e = [];
    for (let i = 0; i < n.length; i += this.SMALL_CHUNK_SIZE)
      e.push(n.slice(i, i + this.SMALL_CHUNK_SIZE));
    let r = [];
    for (let i = 0; i < e.length; i++) {
      const s = e[i], a = t.substring(
        i * this.SMALL_CHUNK_SIZE,
        Math.min((i + 1) * this.SMALL_CHUNK_SIZE, t.length)
      ), h = this.generateAllCombinations(
        s,
        a
      );
      i === 0 ? r = h : r = this.cartesianService.combineCartesian(
        r,
        h,
        this.MAX_RESULT_SIZE
      );
    }
    return r;
  }
  /**
   * 特殊文字のない通常テキストの処理
   */
  processNormalText(t, n) {
    const e = t.length > this.LONG_TEXT_THRESHOLD ? Math.min(n, 8) : n, r = this.textProcessor.splitIntoChunks(
      t,
      e
    ), i = [];
    for (const s of r) {
      const a = this.generatePatternArray(s);
      if (!a.length) continue;
      const h = this.generateAllCombinations(a, s);
      if (h.length === 0) {
        const o = a.map((l) => l[0]);
        i.push([[[o.join("")], o]]);
      } else
        i.push(h);
    }
    return this.combineResults(i);
  }
  /**
   * 結果を結合する共通メソッド
   */
  combineResults(t) {
    if (t.length === 0) return null;
    if (t.length === 1) return t[0];
    let n = t[0];
    for (let e = 1; e < t.length; e++)
      n = this.cartesianService.combineCartesian(
        n,
        t[e],
        this.MAX_RESULT_SIZE
      );
    return n.length ? n : null;
  }
  /**
   * 文字列が特殊文字のみで構成されているかチェック
   */
  isOnlySpecialCharacters(t) {
    for (const n of t)
      if (!this.isSpecialCharacter(n))
        return !1;
    return !0;
  }
  /**
   * 特殊文字のための直接マッピングを作成
   */
  createDirectMapping(t) {
    const n = [];
    for (const e of t) {
      const r = this.patternService.search(e);
      n.push(r ? r[0] : e);
    }
    return [[[n.join("")], n]];
  }
  /**
   * パターン配列生成メソッド
   */
  generatePatternArray(t) {
    const n = [];
    for (let e = 0; e < t.length; e++) {
      const r = t[e];
      if (this.isSpecialCharacter(r)) {
        const s = this.patternService.search(r);
        n.push(s || [r]);
        continue;
      }
      if (this.handleSpecialN(t, e, n) || this.handleTsu(t, e, n))
        continue;
      const i = this.patternService.findLongestMatch(
        t,
        e,
        c.N_CHARS,
        c.TSU_CHARS
      );
      i ? (n.push(i.pattern), e += i.length - 1) : n.push([r]);
    }
    return n;
  }
  /**
   * 特殊文字チェック
   */
  isSpecialCharacter(t) {
    return t ? t.length === 1 ? c.HALF_WIDTH_SPECIAL_CHARS.test(t) || c.FULL_WIDTH_SPECIAL_CHARS.test(t) || c.PUNCTUATIONS.test(t) : this.isSpecialCharacter(t[0]) : !1;
  }
  /**
   * 「ん」の特殊処理
   */
  handleSpecialN(t, n, e) {
    const r = t[n];
    if (!c.N_CHARS.has(r)) return !1;
    const i = this.patternService.getSpecialPatterns(r);
    return i ? (e.push(
      n + 1 < t.length && c.NA_LINE_CHARS.has(t[n + 1]) ? ["nn"] : i
    ), !0) : !1;
  }
  /**
   * 「っ」の特殊処理
   */
  handleTsu(t, n, e) {
    var s;
    const r = t[n];
    if (!c.TSU_CHARS.has(r)) return !1;
    const i = this.patternService.getSpecialPatterns(r);
    if (!i) return !1;
    if (n + 1 < t.length) {
      const a = this.patternService.findLongestMatch(
        t,
        n + 1,
        c.N_CHARS,
        c.TSU_CHARS
      );
      if (a != null && a.pattern[0][0] && /^[a-z]/.test(a.pattern[0][0])) {
        const h = ((s = a.pattern[0][0].match(/^[^aiueo]*/)) == null ? void 0 : s[0]) || "";
        if (h)
          return e.push([h, ...i]), !0;
      }
    }
    return e.push(i), !0;
  }
  /**
   * すべての組み合わせを生成
   */
  generateAllCombinations(t, n) {
    if (!t.length) return [];
    if (t.length <= 2)
      return this.generateSimpleCombinations(t);
    const e = 12;
    if (t.length > e) {
      const s = t.slice(0, e), a = this.generateAllCombinations(
        s,
        n == null ? void 0 : n.substring(0, e)
      );
      t.slice(e).map((l) => l);
      const h = t.slice(e), o = [];
      for (let l = 0; l < a.length; l++) {
        const [f, g] = a[l], C = this.generateAllCombinations(h);
        for (const [A, d] of C)
          for (const E of f)
            for (const w of A) {
              const H = E + w, N = [...g, ...d];
              o.push([[H], N]);
            }
      }
      return o.length > 0 ? o : [[[t.map((l) => l[0]).join("")], t.map((l) => l[0])]];
    }
    const r = [], i = (s, a, h) => {
      if (s === t.length) {
        r.push([[a], [...h]]);
        return;
      }
      for (const o of t[s]) {
        let l = !0;
        if (s > 0) {
          const f = h[h.length - 1], g = n && this.isSpecialCharacter(n[s - 1]), C = n && this.isSpecialCharacter(n[s]);
          if (!g && !C) {
            const A = c.N_PATTERNS.has(f) || c.N_PATTERNS.has(o), d = c.TSU_PATTERNS.has(o);
            !A && !d && f.length === 1 && !c.CONSONANT_CHECK_THROUGH_ROMAN_CHARS.has(f) && !o.startsWith(f) && (l = !1);
          }
        }
        if (l) {
          const f = [...h, o];
          i(s + 1, a + o, f);
        }
      }
    };
    if (i(0, "", []), r.length === 0) {
      const s = t.map((a) => a[0]);
      r.push([[s.join("")], s]);
    }
    return r;
  }
  /**
   * 単純なケース（1-2パターン）の組み合わせ生成
   */
  generateSimpleCombinations(t) {
    const n = [];
    if (t.length === 1)
      for (const e of t[0])
        n.push([[e], [e]]);
    else if (t.length === 2)
      for (const e of t[0])
        for (const r of t[1])
          this.isValidSimpleConsonantCombination(e, r) && n.push([[e + r], [e, r]]);
    return n;
  }
  /**
   * 単純な子音組み合わせ検証（2パターン用）
   */
  isValidSimpleConsonantCombination(t, n) {
    return this.isSpecialCharacter(t) || this.isSpecialCharacter(n) || c.N_PATTERNS.has(t) || n.startsWith("xtu") || n.startsWith("xtsu") || n.startsWith("ltu") || n.startsWith("ltsu") ? !0 : !(t.length === 1 && !c.CONSONANT_CHECK_THROUGH_ROMAN_CHARS.has(t) && !n.startsWith(t));
  }
};
c.NA_LINE_CHARS = /* @__PURE__ */ new Set([
  "な",
  "に",
  "ぬ",
  "ね",
  "の",
  "ナ",
  "ニ",
  "ヌ",
  "ネ",
  "ノ"
]), c.N_CHARS = /* @__PURE__ */ new Set(["ん", "ン"]), c.TSU_CHARS = /* @__PURE__ */ new Set(["っ", "ッ"]), c.CONSONANT_CHECK_THROUGH_ROMAN_CHARS = /* @__PURE__ */ new Set([
  "a",
  "i",
  "u",
  "e",
  "o",
  "n"
]), c.HALF_WIDTH_SPECIAL_CHARS = /[!@#$%^&*()_+\-=\[\]{}|;:'",.\/<>?0-9]/, c.FULL_WIDTH_SPECIAL_CHARS = /[！＠＃＄％＾＆＊（）＿＋－＝［］｛｝｜；：'"、。・＜＞？０-９]/, c.PUNCTUATIONS = /[、。，．・：；？！´｀¨＾￣＿―‐／＼～∥｜…‥''""（）〔〕［］｛｝〈〉《》「」『』【】＋－±×÷＝≠＜＞≦≧∞∴♂♀°′″℃￥＄￠￡％＃＆＊＠§☆★○●◎◇◆□■△▲▽▼※〒→←↑↓〓ー]/, c.TSU_PATTERNS = /* @__PURE__ */ new Set([
  "xtu",
  "xtsu",
  "ltu",
  "ltsu"
]), c.N_PATTERNS = /* @__PURE__ */ new Set(["n", "nn"]);
let P = c;
const S = new P(), y = new T(
  p
);
function L(u) {
  const t = S.transliterate(u);
  return t ? "error" in t ? t : Array.isArray(t) && t.length > 0 && t[0][0].length > 0 ? t[0][0][0] : "" : "";
}
function v(u) {
  const t = S.transliterate(u);
  return t ? "error" in t ? t : Array.isArray(t) ? y.getAllRomajiPatterns(t) : [] : [];
}
function O(u) {
  const t = S.transliterate(u);
  return t ? "error" in t ? t : Array.isArray(t) ? y.getCharacterPatterns(t) : [] : [];
}
function j(u) {
  const t = S.transliterate(u);
  return t ? "error" in t ? t : Array.isArray(t) ? y.getCompletePatterns(t) : {
    patterns: [],
    segmented: []
  } : {
    patterns: [],
    segmented: []
  };
}
function U(u) {
  const t = S.transliterate(u);
  return t ? "error" in t ? t : Array.isArray(t) ? y.toPatternSetArray(t) : [] : [];
}
export {
  P as Romanizer,
  v as getAllRomajiPatterns,
  O as getCharacterPatterns,
  j as getCompletePatterns,
  U as getPatternSets,
  L as toRomaji
};
