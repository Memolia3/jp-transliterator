class x {
  /**
   * チャンク分けのメソッド
   * メモリ使用量を最適化するため長い入力を適切なサイズに分割
   * 拗音や促音などの特殊な文字が途中で分割されないように調整
   * @param str 入力文字列
   * @param size チャンクサイズ（0の場合は分割しない）
   * @returns 分割されたチャンク配列
   */
  splitIntoChunks(t, r) {
    if (!t) return [];
    if (r <= 0)
      return [t];
    const e = [];
    let n = 0;
    for (; n < t.length; ) {
      let i = Math.min(n + r, t.length);
      if (i >= t.length) {
        e.push(t.slice(n));
        break;
      }
      let s = i;
      const a = /[ぁぃぅぇぉっゃゅょゎァィゥェォッャュョヮ]/;
      for (; s > n; ) {
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
      s <= n && (s = n + 1), e.push(t.slice(n, s)), n = s;
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
class I {
  constructor() {
    this.textProcessor = new x();
  }
  /**
   * エラーハンドリングを含む変換プロセス
   * @param str 変換対象文字列
   * @param options 変換オプション
   */
  transliterate(t, r) {
    const e = (r == null ? void 0 : r.chunkSize) ?? 0;
    if (!(t != null && t.length)) return null;
    try {
      return this.processTransliteration(t, e);
    } catch (n) {
      return {
        error: `変換エラーが発生しました: ${n instanceof Error ? n.message : String(n)}`
      };
    }
  }
}
class M {
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
  insert(t, r) {
    let e = this.root;
    for (let n = 0; n < t.length; n++) {
      const i = t[n];
      e.children.has(i) || e.children.set(i, this.createNode()), e = e.children.get(i);
    }
    e.isEndOfWord = !0, e.patterns = r;
  }
  /**
   * キーに対応するパターンを検索
   * @param key 検索キー
   * @returns パターン配列または未定義
   */
  search(t) {
    let r = this.root;
    for (let e = 0; e < t.length; e++) {
      const n = t[e];
      if (!r.children.has(n))
        return null;
      r = r.children.get(n);
    }
    return r.isEndOfWord ? r.patterns : null;
  }
  /**
   * 文字列の先頭から最長一致するパターンを検索
   * @param str 入力文字列
   * @param startIndex 開始インデックス
   * @returns 一致したノードとその長さ、またはnull
   */
  searchLongestPrefix(t, r = 0) {
    let e = this.root, n = null, i = 0;
    for (let s = r; s < t.length; s++) {
      const a = t[s];
      if (!e.children.has(a))
        break;
      e = e.children.get(a), e.isEndOfWord && (n = e, i = s - r + 1);
    }
    return n ? { node: n, length: i } : null;
  }
}
class T {
  /**
   * コンストラクタ
   * @param transliterationMap 変換マップ
   */
  constructor(t) {
    this.specialCharSets = [], this.patternCache = /* @__PURE__ */ new Map(), this.searchCache = /* @__PURE__ */ new Map(), this.longestMatchCache = /* @__PURE__ */ new Map(), this.MAX_CACHE_SIZE = 1e3, this.MAX_SEARCH_CACHE_SIZE = 500, this.MAX_MATCH_CACHE_SIZE = 200;
    const r = Object.entries(
      t
    ).reduce((e, [n, i]) => (n.split("|").forEach((s) => {
      e[s] = i;
    }), e), {});
    this.mapTrie = new M(), this.specialPatterns = {}, this.initializePatternContainers(r);
  }
  /**
   * 特殊文字セットを初期化
   * @param specialSets 特殊文字セットの配列
   */
  initializeSpecialSets(t) {
    this.specialCharSets = t;
    const r = new M(), e = {
      ...this.specialPatterns
    }, n = /* @__PURE__ */ new Set();
    for (const i of t)
      for (const s of i) {
        n.add(s);
        const a = this.mapTrie.search(s);
        a && (e[s] = a);
      }
    for (const [i, s] of Object.entries(e))
      n.has(i) || r.insert(i, s);
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
    const r = this.searchCache.get(t);
    if (r !== void 0)
      return r;
    let e = null;
    return t in this.specialPatterns ? e = this.specialPatterns[t] : e = this.mapTrie.search(t), this.searchCache.size >= this.MAX_SEARCH_CACHE_SIZE && this.searchCache.clear(), this.searchCache.set(t, e), e;
  }
  /**
   * マップの内容をTrieと特殊パターンに振り分ける
   * @param optimizedMap 最適化されたマップ
   */
  initializePatternContainers(t) {
    const r = /* @__PURE__ */ new Set();
    for (const n of this.specialCharSets)
      for (const i of n)
        r.add(i);
    const e = [];
    for (const [n, i] of Object.entries(t))
      r.has(n) ? this.specialPatterns[n] = i : e.push([n, i]);
    for (const [n, i] of e)
      this.mapTrie.insert(n, i);
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
  findLongestMatch(t, r, ...e) {
    const n = `${t.substring(
      r,
      r + 10
    )}_${r}`, i = this.longestMatchCache.get(n);
    if (i !== void 0)
      return i;
    let s = null;
    if (e.some((a) => a.has(t[r]))) {
      const a = t[r], c = this.specialPatterns[a];
      c && (s = { pattern: c, length: 1 });
    } else {
      const a = this.mapTrie.searchLongestPrefix(t, r);
      a && a.node.patterns && (s = {
        pattern: a.node.patterns,
        length: a.length
      });
    }
    return this.longestMatchCache.size >= this.MAX_MATCH_CACHE_SIZE && this.longestMatchCache.clear(), this.longestMatchCache.set(n, s), s;
  }
  /**
   * 入力文字列に対応するすべてのパターンを取得
   * @param str 入力文字列
   */
  getInputPatterns(t) {
    const r = [];
    for (let e = 0; e < t.length; e++) {
      const n = t[e], i = this.mapTrie.search(n);
      if (i)
        r.push({ pattern: i, char: n });
      else {
        const s = this.specialPatterns[n];
        s ? r.push({ pattern: s, char: n }) : r.push({ pattern: [n], char: n });
      }
    }
    return r;
  }
  /**
   * 変換結果から入力文字列を取得
   * @param combinations Romanizer/Japanizerからの変換結果
   * @param index 取得するインデックス（デフォルトは0）
   * @returns 入力文字列
   */
  getInput(t, r = 0) {
    return typeof t == "string" ? t in this.specialPatterns ? this.specialPatterns[t] : this.mapTrie.search(t) || [t] : !t || !t.length ? "" : t.length > r && t[r] && t[r][0].length > 0 ? t[r][0][0] : "";
  }
  /**
   * キャッシュからパターンを取得、またはキャッシュに追加
   * @param key キャッシュキー
   * @param generator パターン生成関数
   */
  getOrCachePatterns(t, r) {
    const e = this.patternCache.get(t);
    if (e) return e;
    const n = r();
    return this.patternCache.size >= this.MAX_CACHE_SIZE && this.patternCache.clear(), t.length <= 20 && this.patternCache.set(t, n), n;
  }
  /**
   * 複合パターン（2文字以上の連続）を取得
   * @param str 入力文字列
   * @param startIndex 開始インデックス
   */
  getCompoundPatterns(t, r) {
    const e = [];
    for (let n = 2; n <= 4 && r + n <= t.length; n++) {
      const i = t.substring(r, r + n), s = this.mapTrie.search(i);
      s && e.push({ patterns: [s], length: n });
    }
    return e;
  }
  /**
   * 変換結果から全ての入力パターンを2次元配列で取得
   * @param combinations Romanizer/Japanizerからの変換結果
   * @returns 入力パターンの2次元配列
   */
  getAllInputPatterns(t) {
    if (!t || !t.length) return [];
    const r = [];
    for (const [e, n] of t)
      e && e.length > 0 && n.length > 0 && r.push([n.join("")]);
    return r;
  }
  /**
   * 変換結果から日本語文字ごとのカンマ区切りパターンを2次元配列で取得
   * @param combinations Romanizer/Japanizerからの変換結果
   * @returns カンマ区切りされた入力パターンの2次元配列
   */
  getSegmentedPatterns(t) {
    if (!t || !t.length) return [];
    const r = [];
    for (const [e, n] of t)
      n && n.length > 0 && r.push(n);
    return r;
  }
  /**
   * 変換結果から完全な入力パターン情報を取得
   * @param combinations Romanizer/Japanizerからの変換結果
   * @param originalText 元の日本語テキスト（オプション）
   * @returns 全入力パターン情報
   */
  getCompletePatterns(t, r) {
    if (!t || !t.length)
      return {
        patterns: [],
        segmented: []
      };
    const e = this.getAllInputPatterns(t), n = this.getSegmentedPatterns(t);
    return {
      patterns: e,
      segmented: n
    };
  }
  /**
   * 変換結果を標準的なパターンセット配列に変換
   * @param combinations Romanizer/Japanizerからの変換結果
   * @returns パターンセット配列
   */
  toPatternSetArray(t) {
    return !t || !t.length ? [] : t.map(([r, e]) => [r.length > 0 ? r[0] : "", e]);
  }
  /**
   * 指定された文字列のパターンを配列形式で取得します
   * @param query 検索する文字列またはCombinations
   * @returns 可能なローマ字入力パターンの2次元配列
   */
  getInputMatrix(t) {
    const r = this.getSpecialPatterns(t);
    if (r)
      return [r];
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
    const r = [];
    let e = 0;
    for (; e < t.length; )
      e + 1 < t.length && t.charCodeAt(e) >= 55296 && t.charCodeAt(e) <= 56319 ? (r.push(t.substring(e, e + 2)), e += 2) : (r.push(t[e]), e++);
    return r;
  }
}
class U {
  /**
   * ストリーミング方式でカーテシアン積を計算
   * メモリ使用量を制御しながら大きな直積を計算
   * @param set1 最初の集合
   * @param set2 2番目の集合
   * @param maxResults 最大結果数
   */
  combineCartesian(t, r, e) {
    const n = [];
    let i = 0;
    for (const [s, a] of t) {
      for (const [c, p] of r) {
        if (i >= e) break;
        const g = s.flatMap(
          (o) => c.map((u) => o + u)
        ), S = [...a, ...p];
        n.push([g, S]), i++;
      }
      if (i >= e) break;
    }
    return n;
  }
  /**
   * 複数の配列のカーテシアン積を計算
   * @param arrays 配列の配列
   * @param maxResults 最大結果数
   */
  calculateCartesianProduct(t, r = Number.MAX_SAFE_INTEGER) {
    if (t.length === 0) return [[]];
    if (t.length === 1) return t[0].map((a) => [a]);
    const e = [], n = t[0], i = t.slice(1), s = this.calculateCartesianProduct(
      i,
      r
    );
    for (const a of n) {
      for (const c of s) {
        if (e.length >= r) break;
        e.push([a, ...c]);
      }
      if (e.length >= r) break;
    }
    return e;
  }
  /**
   * 複数のパターンの直積を計算
   * @param patterns パターンの配列
   * @param maxResults 最大結果数
   */
  calculatePatternProduct(t, r = 1e4) {
    if (t.length === 0) return [];
    if (t.length === 1) return t[0];
    let e = t[0];
    for (let n = 1; n < t.length; n++) {
      const i = t[n], s = [];
      for (let a = 0; a < e.length && s.length < r; a++)
        for (let c = 0; c < i.length && s.length < r; c++)
          s.push(e[a] + i[c]);
      if (e = s, e.length >= r) {
        e = e.slice(0, r);
        break;
      }
    }
    return e;
  }
}
class b {
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
    return t.replace(/[\u30a1-\u30f6]/g, (r) => {
      const e = r.charCodeAt(0) - 96;
      return String.fromCharCode(e);
    });
  }
  /**
   * ひらがなをカタカナに変換
   * @param str 変換対象文字列
   */
  hiraganaToKatakana(t) {
    return t.replace(/[\u3041-\u3096]/g, (r) => {
      const e = r.charCodeAt(0) + 96;
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
const k = {
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
  "０": ["0"]
}, C = {};
for (const [l, t] of Object.entries(
  k
)) {
  const [r, e] = l.split("|");
  t.forEach((n) => {
    C[n] ? (C[n].includes(r) || C[n].push(r), C[n].includes(e) || C[n].push(e)) : C[n] = [r, e];
  });
}
const h = class h extends I {
  constructor() {
    super(), this.MAX_RESULT_SIZE = Number.MAX_SAFE_INTEGER, this.patternService = new T(
      k
    ), this.cartesianService = new U(), this.textConverterService = new b(), this.patternService.initializeSpecialSets([
      h.N_CHARS,
      h.TSU_CHARS
    ]);
  }
  /**
   * 実際の変換プロセスを実装
   */
  processTransliteration(t, r) {
    if (!t) return null;
    const e = this.textConverterService.toHalfWidth(t);
    if (this.isOnlySpecialCharacters(e)) {
      const c = this.createDirectMapping(e);
      return c.length > 0 ? c : null;
    }
    const n = t.length > 20 ? Math.min(r, 8) : r, i = this.textProcessor.splitIntoChunks(
      e,
      n
    ), s = [];
    for (const c of i) {
      const p = this.generatePatternArray(c);
      if (!p.length) continue;
      const g = this.generateAllCombinations(p, c);
      if (g.length === 0) {
        const S = p.map((u) => u[0]), o = S.join("");
        s.push([[[o], S]]);
      } else
        s.push(g);
    }
    if (s.length === 0) return null;
    if (s.length === 1) return s[0];
    let a = s[0];
    for (let c = 1; c < s.length; c++)
      a = this.cartesianService.combineCartesian(
        a,
        s[c],
        this.MAX_RESULT_SIZE
      );
    return a.length ? a : null;
  }
  /**
   * 文字列が特殊文字のみで構成されているかチェック
   */
  isOnlySpecialCharacters(t) {
    for (const r of t)
      if (!this.isSpecialCharacter(r))
        return !1;
    return !0;
  }
  /**
   * 特殊文字のための直接マッピングを作成
   */
  createDirectMapping(t) {
    const r = [], e = [];
    for (const i of t) {
      const s = this.patternService.search(i);
      s ? e.push(s[0]) : e.push(i);
    }
    const n = e.join("");
    return r.push([[n], e]), r;
  }
  /**
   * パターンを単純化する追加メソッド
   */
  simplifyPatterns(t) {
    return t.length > 20 ? t.map((r) => r.length <= 1 || r.length <= 2 ? r : [r[0]]) : t.map((r) => r.length <= 2 ? r : r.slice(0, 2));
  }
  /**
   * パターン配列生成メソッド
   * 入力文字列から変換パターンの配列を生成
   */
  generatePatternArray(t) {
    const r = [];
    for (let e = 0; e < t.length; e++) {
      const n = t[e];
      if (this.isSpecialCharacter(n)) {
        const a = this.patternService.search(n);
        a ? r.push(a) : r.push([n]);
        continue;
      }
      if (this.handleSpecialN(t, e, r) || this.handleTsu(t, e, r))
        continue;
      const s = this.patternService.findLongestMatch(
        t,
        e,
        h.N_CHARS,
        h.TSU_CHARS
      );
      s ? (r.push(s.pattern), e += s.length - 1) : r.push([n]);
    }
    return r;
  }
  /**
   * 特殊文字かどうかをチェック（単一文字用）
   */
  isSpecialCharacter(t) {
    return t ? t.length === 1 ? h.HALF_WIDTH_SPECIAL_CHARS.test(t) || h.FULL_WIDTH_SPECIAL_CHARS.test(t) || h.PUNCTUATIONS.test(t) : this.isSpecialCharacter(t[0]) : !1;
  }
  /**
   * 「ん」の特殊処理
   */
  handleSpecialN(t, r, e) {
    const n = t[r];
    if (!h.N_CHARS.has(n)) return !1;
    const i = this.patternService.getSpecialPatterns(n);
    return i ? (r + 1 < t.length && h.NA_LINE_CHARS.has(t[r + 1]) ? e.push(["nn"]) : e.push(i), !0) : !1;
  }
  /**
   * 「っ」の特殊処理
   */
  handleTsu(t, r, e) {
    var s;
    const n = t[r];
    if (!h.TSU_CHARS.has(n)) return !1;
    const i = this.patternService.getSpecialPatterns(n);
    if (!i) return !1;
    if (r + 1 < t.length) {
      const a = this.patternService.findLongestMatch(
        t,
        r + 1,
        h.N_CHARS,
        h.TSU_CHARS
      );
      if (a && a.pattern[0][0] && /^[a-z]/.test(a.pattern[0][0])) {
        const c = ((s = a.pattern[0][0].match(/^[^aiueo]*/)) == null ? void 0 : s[0]) || "";
        if (c) {
          const p = [c, ...i];
          return e.push(p), !0;
        }
      }
    }
    return e.push(i), !0;
  }
  /**
   * 子音の組み合わせが有効かどうかをチェック
   */
  isValidConsonantCombination(t) {
    for (let e = 0; e < t.length - 1; e++) {
      const n = t[e], i = t[e + 1];
      if (!this.isSpecialCharacter(n) && n.length === 1 && !h.CONSONANT_CHECK_THROUGH_ROMAN_CHARS.has(n) && !i.startsWith(n))
        return !1;
    }
    const r = t[t.length - 1];
    return !(r.length === 1 && !h.CONSONANT_CHECK_THROUGH_ROMAN_CHARS.has(r) && !this.isSpecialCharacter(r));
  }
  /**
   * すべての組み合わせを生成
   */
  generateAllCombinations(t, r) {
    if (!t.length) return [];
    const e = [], n = Number.MAX_SAFE_INTEGER;
    let i = [{ current: [], parts: [], index: 0 }], s = [];
    const a = /* @__PURE__ */ new Set(["xtu", "xtsu", "ltu", "ltsu"]), c = h.CONSONANT_CHECK_THROUGH_ROMAN_CHARS, p = /* @__PURE__ */ new Set(["n", "nn"]), g = [];
    if (r)
      for (let o = 0; o < r.length; o++)
        g[o] = this.isSpecialCharacter(r[o]);
    let S = t.reduce((o, u) => o + u.length, 0) / t.length;
    for (Math.pow(
      S,
      t.length
    ); i.length > 0; ) {
      s.length = 0;
      for (let u = 0; u < i.length; u++) {
        const { current: v, parts: d, index: A } = i[u];
        if (A === t.length) {
          this.isValidConsonantCombination(d) && e.push([[v.join("")], d.slice()]);
          continue;
        }
        const N = t[A], L = g[A] || !1, O = A > 0 && g[A - 1] || !1;
        for (let m = 0; m < N.length; m++) {
          const y = N[m];
          if (s.length < n) {
            let R = !0;
            if (d.length > 0) {
              const P = d[d.length - 1], W = a.has(y), j = p.has(y) || p.has(P);
              !O && // 前が記号でない場合
              !L && // 現在も記号でない場合
              !j && // 「ん」でない場合
              P.length === 1 && !c.has(P) && !y.startsWith(P) && !W && (P.length === 1 && y.startsWith(P) || (R = !1));
            }
            R && s.push({
              current: [...v, y],
              parts: [...d, y],
              index: A + 1
            });
          }
        }
      }
      const o = i;
      o.length = 0;
      for (let u = 0; u < s.length; u++)
        o.push({
          current: [...s[u].current],
          parts: [...s[u].parts],
          index: s[u].index
        });
      i = o, s = [];
    }
    if (e.length === 0 && t.length > 0) {
      const o = t.map((u) => u[0]);
      e.push([[o.join("")], o]);
    }
    return e;
  }
};
h.NA_LINE_CHARS = /* @__PURE__ */ new Set([
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
]), h.N_CHARS = /* @__PURE__ */ new Set(["ん", "ン"]), h.TSU_CHARS = /* @__PURE__ */ new Set(["っ", "ッ"]), h.CONSONANT_CHECK_THROUGH_ROMAN_CHARS = /* @__PURE__ */ new Set([
  "a",
  "i",
  "u",
  "e",
  "o",
  "n"
]), h.HALF_WIDTH_SPECIAL_CHARS = /[!@#$%^&*()_+\-=\[\]{}|;:'",.\/<>?]/, h.FULL_WIDTH_SPECIAL_CHARS = /[！＠＃＄％＾＆＊（）＿＋－＝［］｛｝｜；：'"、。・＜＞？]/, h.PUNCTUATIONS = /[、。，．・：；？！´｀¨＾￣＿―‐／＼～∥｜…‥''""（）〔〕［］｛｝〈〉《》「」『』【】＋－±×÷＝≠＜＞≦≧∞∴♂♀°′″℃￥＄￠￡％＃＆＊＠§☆★○●◎◇◆□■△▲▽▼※〒→←↑↓〓]/;
let _ = h;
const f = class f extends I {
  constructor() {
    super(), this.MAX_RESULT_SIZE = Number.MAX_SAFE_INTEGER, this.patternService = new T(
      C
    ), this.textConverterService = new b(), this.patternService.initializeSpecialSets([
      f.N_CHARS,
      f.SPECIAL_CHARS
    ]);
  }
  /**
   * 実際の変換プロセスを実装
   */
  processTransliteration(t, r) {
    if (!t) return null;
    const e = this.textConverterService.toHalfWidth(
      t.toLowerCase()
    );
    if (this.isOnlySpecialCharacters(e)) {
      const s = this.createDirectMapping(e);
      return s.length > 0 ? s : null;
    }
    const n = this.textProcessor.splitIntoChunks(e, r), i = [];
    for (const s of n) {
      const a = this.generatePatternArray(s);
      if (a.length === 0)
        continue;
      const c = this.generateAllCombinations(a), p = this.toFullWidthCombinations(c);
      i.push(p);
    }
    return i.length === 0 ? null : i.length === 1 ? i[0] : this.mergeResults(i);
  }
  /**
   * 結果配列をマージ
   */
  mergeResults(t) {
    const r = [];
    for (const e of t)
      for (const [n, i] of e)
        r.push([n, i]);
    return r;
  }
  /**
   * 特殊文字かどうかをチェック（単一文字用）
   */
  isSpecialCharacter(t) {
    return t ? t.length === 1 ? f.HALF_WIDTH_SPECIAL_CHARS.test(t) || f.FULL_WIDTH_SPECIAL_CHARS.test(t) || f.PUNCTUATIONS.test(t) : this.isSpecialCharacter(t[0]) : !1;
  }
  /**
   * 文字列が特殊文字のみかどうかをチェック
   */
  isOnlySpecialCharacters(t) {
    if (!t) return !1;
    for (let r = 0; r < t.length; r++) {
      const e = t[r];
      if (!this.isSpecialCharacter(e))
        return !1;
    }
    return !0;
  }
  /**
   * 特殊文字のための直接マッピングを作成
   */
  createDirectMapping(t) {
    const r = [], e = [];
    for (const n of t)
      e.push(n);
    return r.push([[t], e]), r;
  }
  /**
   * 組み合わせを全角文字列に変換
   */
  toFullWidthCombinations(t) {
    return t.map(([r, e]) => [r.map(
      (i) => this.textConverterService.toFullWidth(i)
    ), e]);
  }
  /**
   * パターン配列生成メソッド
   */
  generatePatternArray(t) {
    const r = [];
    let e = 0;
    for (; e < t.length; ) {
      const n = this.handleSpecialCases(t, e, r);
      if (n.processed) {
        e += n.advance;
        continue;
      }
      let i = !1;
      for (let s = 4; s > 0; s--)
        if (e + s <= t.length) {
          const a = t.substring(e, e + s), c = this.patternService.getInput(a);
          if (c && Array.isArray(c)) {
            r.push(c), e += s, i = !0;
            break;
          }
        }
      i || (r.push([t[e]]), e++);
    }
    return r;
  }
  /**
   * 特殊ケースの処理
   */
  handleSpecialCases(t, r, e) {
    if (t[r] === "n")
      return this.handleSpecialN(t, r, e);
    if (r + 1 < t.length && t[r] === t[r + 1] && this.isConsonant(t[r])) {
      const n = this.patternService.getInput("xtsu");
      if (n && Array.isArray(n))
        return e.push(n), { processed: !0, advance: 1 };
    }
    return { processed: !1, advance: 0 };
  }
  /**
   * 'n'の特殊処理
   */
  handleSpecialN(t, r, e) {
    if (r === t.length - 1) {
      const s = this.patternService.getSpecialPatterns("n");
      return s ? (e.push(s), { processed: !0, advance: 1 }) : { processed: !1, advance: 0 };
    }
    if (t[r + 1] === "'") {
      const s = this.patternService.getSpecialPatterns("n");
      return s ? (e.push(s), { processed: !0, advance: 2 }) : { processed: !1, advance: 0 };
    }
    const n = t[r + 1];
    if (f.VOWEL_CHARS.has(n) || n === "y") {
      const s = t.substring(r, r + 2), a = this.patternService.getInput(s);
      if (a && Array.isArray(a))
        return e.push(a), { processed: !0, advance: 2 };
      const c = this.patternService.getSpecialPatterns("n");
      if (c)
        return e.push(c), { processed: !0, advance: 1 };
    }
    const i = t.substring(r, r + 3);
    if (i === "nny" || i === "nnw") {
      const s = this.patternService.getSpecialPatterns("n");
      if (s)
        return e.push(s), { processed: !0, advance: 1 };
    }
    return { processed: !1, advance: 0 };
  }
  /**
   * 文字が子音かどうかをチェック
   */
  isConsonant(t) {
    return !f.VOWEL_CHARS.has(t) && t !== "n";
  }
  /**
   * すべての組み合わせを生成
   */
  generateAllCombinations(t) {
    if (!t.length) return [];
    const r = [], e = t.map((i) => i[0]), n = e.join("");
    return r.push([[n], e]), r;
  }
};
f.SPECIAL_CHARS = /* @__PURE__ */ new Set(["xn", "xtsu", "xtu"]), f.VOWEL_CHARS = /* @__PURE__ */ new Set(["a", "i", "u", "e", "o"]), f.N_CHARS = /* @__PURE__ */ new Set(["n"]), f.SMALL_CHARS = [
  "ぁ",
  "ぃ",
  "ぅ",
  "ぇ",
  "ぉ",
  "っ",
  "ゃ",
  "ゅ",
  "ょ",
  "ゎ"
], f.SPECIAL_CHARS_N = ["ん", "n"], f.HALF_WIDTH_SPECIAL_CHARS = /[!@#$%^&*()_+\-=\[\]{}|;:'",.\/<>?]/, f.FULL_WIDTH_SPECIAL_CHARS = /[！＠＃＄％＾＆＊（）＿＋－＝［］｛｝｜；：'"、。・＜＞？]/, f.PUNCTUATIONS = /[、。，．・：；？！´｀¨＾￣＿―‐／＼～∥｜…‥''""（）〔〕［］｛｝〈〉《》「」『』【】＋－±×÷＝≠＜＞≦≧∞∴♂♀°′″℃￥＄￠￡％＃＆＊＠§☆★○●◎◇◆□■△▲▽▼※〒→←↑↓〓]/;
let E = f;
const w = new _(), F = new E(), H = new T(
  C
);
function q(l) {
  const t = w.transliterate(l);
  return t ? "error" in t ? t : Array.isArray(t) && t.length > 0 && t[0][0].length > 0 ? t[0][0][0] : "" : "";
}
function D(l) {
  const t = F.transliterate(l);
  return t ? "error" in t ? t : (Array.isArray(t), typeof t[0] == "string" ? t[0] : "") : "";
}
function Z(l) {
  const t = w.transliterate(l);
  return t ? "error" in t ? t : Array.isArray(t) ? H.getAllInputPatterns(t) : [] : [];
}
function z(l) {
  const t = w.transliterate(l);
  return t ? "error" in t ? t : Array.isArray(t) ? H.getSegmentedPatterns(t) : [] : [];
}
function K(l) {
  const t = w.transliterate(l);
  return t ? "error" in t ? t : Array.isArray(t) ? H.getCompletePatterns(t, l) : {
    patterns: [],
    segmented: []
  } : {
    patterns: [],
    segmented: []
  };
}
function G(l) {
  const t = w.transliterate(l);
  return t ? "error" in t ? t : Array.isArray(t) ? H.toPatternSetArray(t) : [] : [];
}
export {
  E as Japanizer,
  _ as Romanizer,
  Z as getAllInputPatterns,
  K as getCompletePatterns,
  G as getPatternSets,
  z as getSegmentedPatterns,
  D as toKana,
  q as toRomaji
};
