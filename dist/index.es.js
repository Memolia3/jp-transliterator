class j {
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
      let a = Math.min(n + r, t.length);
      if (a >= t.length) {
        e.push(t.slice(n));
        break;
      }
      let s = a;
      const i = /[ぁぃぅぇぉっゃゅょゎァィゥェォッャュョヮ]/;
      for (; s > n; ) {
        if (s < t.length && i.test(t[s])) {
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
    this.textProcessor = new j();
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
      const a = t[n];
      e.children.has(a) || e.children.set(a, this.createNode()), e = e.children.get(a);
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
    let e = this.root, n = null, a = 0;
    for (let s = r; s < t.length; s++) {
      const i = t[s];
      if (!e.children.has(i))
        break;
      e = e.children.get(i), e.isEndOfWord && (n = e, a = s - r + 1);
    }
    return n ? { node: n, length: a } : null;
  }
}
class N {
  /**
   * コンストラクタ
   * @param transliterationMap 変換マップ
   */
  constructor(t) {
    this.specialCharSets = [], this.patternCache = /* @__PURE__ */ new Map(), this.searchCache = /* @__PURE__ */ new Map(), this.longestMatchCache = /* @__PURE__ */ new Map(), this.MAX_CACHE_SIZE = 1e3, this.MAX_SEARCH_CACHE_SIZE = 500, this.MAX_MATCH_CACHE_SIZE = 200;
    const r = Object.entries(
      t
    ).reduce((e, [n, a]) => (n.split("|").forEach((s) => {
      e[s] = a;
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
    for (const a of t)
      for (const s of a) {
        n.add(s);
        const i = this.mapTrie.search(s);
        i && (e[s] = i);
      }
    for (const [a, s] of Object.entries(e))
      n.has(a) || r.insert(a, s);
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
      for (const a of n)
        r.add(a);
    const e = [];
    for (const [n, a] of Object.entries(t))
      r.has(n) ? this.specialPatterns[n] = a : e.push([n, a]);
    for (const [n, a] of e)
      this.mapTrie.insert(n, a);
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
    )}_${r}`, a = this.longestMatchCache.get(n);
    if (a !== void 0)
      return a;
    let s = null;
    if (e.some((i) => i.has(t[r]))) {
      const i = t[r], h = this.specialPatterns[i];
      h && (s = { pattern: h, length: 1 });
    } else {
      const i = this.mapTrie.searchLongestPrefix(t, r);
      i && i.node.patterns && (s = {
        pattern: i.node.patterns,
        length: i.length
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
      const n = t[e], a = this.mapTrie.search(n);
      if (a)
        r.push({ pattern: a, char: n });
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
      const a = t.substring(r, r + n), s = this.mapTrie.search(a);
      s && e.push({ patterns: [s], length: n });
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
  getCharacterPatterns(t) {
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
  getCompletePatterns(t) {
    if (!t || !t.length)
      return {
        patterns: [],
        segmented: []
      };
    const r = this.getAllRomajiPatterns(t), e = this.getCharacterPatterns(t);
    return {
      patterns: r,
      segmented: e
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
class L {
  /**
   * ストリーミング方式でカーテシアン積を計算
   * メモリ使用量を制御しながら大きな直積を計算
   * @param set1 最初の集合
   * @param set2 2番目の集合
   * @param maxResults 最大結果数
   */
  combineCartesian(t, r, e) {
    const n = [];
    let a = 0;
    for (const [s, i] of t) {
      for (const [h, f] of r) {
        if (a >= e) break;
        const p = s.flatMap(
          (o) => h.map((u) => o + u)
        ), C = [...i, ...f];
        n.push([p, C]), a++;
      }
      if (a >= e) break;
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
    if (t.length === 1) return t[0].map((i) => [i]);
    const e = [], n = t[0], a = t.slice(1), s = this.calculateCartesianProduct(
      a,
      r
    );
    for (const i of n) {
      for (const h of s) {
        if (e.length >= r) break;
        e.push([i, ...h]);
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
      const a = t[n], s = [];
      for (let i = 0; i < e.length && s.length < r; i++)
        for (let h = 0; h < a.length && s.length < r; h++)
          s.push(e[i] + a[h]);
      if (e = s, e.length >= r) {
        e = e.slice(0, r);
        break;
      }
    }
    return e;
  }
}
class z {
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
const R = {
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
}, g = {};
for (const [l, t] of Object.entries(
  R
)) {
  const [r, e] = l.split("|");
  t.forEach((n) => {
    g[n] ? (g[n].includes(r) || g[n].push(r), g[n].includes(e) || g[n].push(e)) : g[n] = [r, e];
  });
}
const c = class c extends I {
  constructor() {
    super(), this.MAX_RESULT_SIZE = Number.MAX_SAFE_INTEGER, this.patternService = new N(
      R
    ), this.cartesianService = new L(), this.textConverterService = new z(), this.patternService.initializeSpecialSets([
      c.N_CHARS,
      c.TSU_CHARS
    ]);
  }
  /**
   * 実際の変換プロセスを実装
   */
  processTransliteration(t, r) {
    if (!t) return null;
    const e = this.textConverterService.toHalfWidth(t);
    if (this.isOnlySpecialCharacters(e)) {
      const h = this.createDirectMapping(e);
      return h.length > 0 ? h : null;
    }
    const n = t.length > 20 ? Math.min(r, 8) : r, a = this.textProcessor.splitIntoChunks(
      e,
      n
    ), s = [];
    for (const h of a) {
      const f = this.generatePatternArray(h);
      if (!f.length) continue;
      const p = this.generateAllCombinations(f, h);
      if (p.length === 0) {
        const C = f.map((u) => u[0]), o = C.join("");
        s.push([[[o], C]]);
      } else
        s.push(p);
    }
    if (s.length === 0) return null;
    if (s.length === 1) return s[0];
    let i = s[0];
    for (let h = 1; h < s.length; h++)
      i = this.cartesianService.combineCartesian(
        i,
        s[h],
        this.MAX_RESULT_SIZE
      );
    return i.length ? i : null;
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
    for (const a of t) {
      const s = this.patternService.search(a);
      s ? e.push(s[0]) : e.push(a);
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
        const i = this.patternService.search(n);
        i ? r.push(i) : r.push([n]);
        continue;
      }
      if (this.handleSpecialN(t, e, r) || this.handleTsu(t, e, r))
        continue;
      const s = this.patternService.findLongestMatch(
        t,
        e,
        c.N_CHARS,
        c.TSU_CHARS
      );
      s ? (r.push(s.pattern), e += s.length - 1) : r.push([n]);
    }
    return r;
  }
  /**
   * 特殊文字かどうかをチェック（単一文字用）
   */
  isSpecialCharacter(t) {
    return t ? t.length === 1 ? c.HALF_WIDTH_SPECIAL_CHARS.test(t) || c.FULL_WIDTH_SPECIAL_CHARS.test(t) || c.PUNCTUATIONS.test(t) : this.isSpecialCharacter(t[0]) : !1;
  }
  /**
   * 「ん」の特殊処理
   */
  handleSpecialN(t, r, e) {
    const n = t[r];
    if (!c.N_CHARS.has(n)) return !1;
    const a = this.patternService.getSpecialPatterns(n);
    return a ? (r + 1 < t.length && c.NA_LINE_CHARS.has(t[r + 1]) ? e.push(["nn"]) : e.push(a), !0) : !1;
  }
  /**
   * 「っ」の特殊処理
   */
  handleTsu(t, r, e) {
    var s;
    const n = t[r];
    if (!c.TSU_CHARS.has(n)) return !1;
    const a = this.patternService.getSpecialPatterns(n);
    if (!a) return !1;
    if (r + 1 < t.length) {
      const i = this.patternService.findLongestMatch(
        t,
        r + 1,
        c.N_CHARS,
        c.TSU_CHARS
      );
      if (i && i.pattern[0][0] && /^[a-z]/.test(i.pattern[0][0])) {
        const h = ((s = i.pattern[0][0].match(/^[^aiueo]*/)) == null ? void 0 : s[0]) || "";
        if (h) {
          const f = [h, ...a];
          return e.push(f), !0;
        }
      }
    }
    return e.push(a), !0;
  }
  /**
   * 子音の組み合わせが有効かどうかをチェック
   */
  isValidConsonantCombination(t) {
    for (let e = 0; e < t.length - 1; e++) {
      const n = t[e], a = t[e + 1];
      if (!this.isSpecialCharacter(n) && n.length === 1 && !c.CONSONANT_CHECK_THROUGH_ROMAN_CHARS.has(n) && !a.startsWith(n))
        return !1;
    }
    const r = t[t.length - 1];
    return !(r.length === 1 && !c.CONSONANT_CHECK_THROUGH_ROMAN_CHARS.has(r) && !this.isSpecialCharacter(r));
  }
  /**
   * すべての組み合わせを生成
   */
  generateAllCombinations(t, r) {
    if (!t.length) return [];
    const e = [], n = Number.MAX_SAFE_INTEGER;
    let a = [{ current: [], parts: [], index: 0 }], s = [];
    const i = /* @__PURE__ */ new Set(["xtu", "xtsu", "ltu", "ltsu"]), h = c.CONSONANT_CHECK_THROUGH_ROMAN_CHARS, f = /* @__PURE__ */ new Set(["n", "nn"]), p = [];
    if (r)
      for (let o = 0; o < r.length; o++)
        p[o] = this.isSpecialCharacter(r[o]);
    let C = t.reduce((o, u) => o + u.length, 0) / t.length;
    for (Math.pow(
      C,
      t.length
    ); a.length > 0; ) {
      s.length = 0;
      for (let u = 0; u < a.length; u++) {
        const { current: m, parts: S, index: y } = a[u];
        if (y === t.length) {
          this.isValidConsonantCombination(S) && e.push([[m.join("")], S.slice()]);
          continue;
        }
        const T = t[y], k = p[y] || !1, b = y > 0 && p[y - 1] || !1;
        for (let H = 0; H < T.length; H++) {
          const d = T[H];
          if (s.length < n) {
            let E = !0;
            if (S.length > 0) {
              const A = S[S.length - 1], O = i.has(d), v = f.has(d) || f.has(A);
              !b && // 前が記号でない場合
              !k && // 現在も記号でない場合
              !v && // 「ん」でない場合
              A.length === 1 && !h.has(A) && !d.startsWith(A) && !O && (A.length === 1 && d.startsWith(A) || (E = !1));
            }
            E && s.push({
              current: [...m, d],
              parts: [...S, d],
              index: y + 1
            });
          }
        }
      }
      const o = a;
      o.length = 0;
      for (let u = 0; u < s.length; u++)
        o.push({
          current: [...s[u].current],
          parts: [...s[u].parts],
          index: s[u].index
        });
      a = o, s = [];
    }
    if (e.length === 0 && t.length > 0) {
      const o = t.map((u) => u[0]);
      e.push([[o.join("")], o]);
    }
    return e;
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
]), c.HALF_WIDTH_SPECIAL_CHARS = /[!@#$%^&*()_+\-=\[\]{}|;:'",.\/<>?]/, c.FULL_WIDTH_SPECIAL_CHARS = /[！＠＃＄％＾＆＊（）＿＋－＝［］｛｝｜；：'"、。・＜＞？]/, c.PUNCTUATIONS = /[、。，．・：；？！´｀¨＾￣＿―‐／＼～∥｜…‥''""（）〔〕［］｛｝〈〉《》「」『』【】＋－±×÷＝≠＜＞≦≧∞∴♂♀°′″℃￥＄￠￡％＃＆＊＠§☆★○●◎◇◆□■△▲▽▼※〒→←↑↓〓]/;
let _ = c;
const P = new _(), w = new N(
  g
);
function x(l) {
  const t = P.transliterate(l);
  return t ? "error" in t ? t : Array.isArray(t) && t.length > 0 && t[0][0].length > 0 ? t[0][0][0] : "" : "";
}
function W(l) {
  const t = P.transliterate(l);
  return t ? "error" in t ? t : Array.isArray(t) ? w.getAllRomajiPatterns(t) : [] : [];
}
function q(l) {
  const t = P.transliterate(l);
  return t ? "error" in t ? t : Array.isArray(t) ? w.getCharacterPatterns(t) : [] : [];
}
function X(l) {
  const t = P.transliterate(l);
  return t ? "error" in t ? t : Array.isArray(t) ? w.getCompletePatterns(t) : {
    patterns: [],
    segmented: []
  } : {
    patterns: [],
    segmented: []
  };
}
function Z(l) {
  const t = P.transliterate(l);
  return t ? "error" in t ? t : Array.isArray(t) ? w.toPatternSetArray(t) : [] : [];
}
export {
  _ as Romanizer,
  W as getAllRomajiPatterns,
  q as getCharacterPatterns,
  X as getCompletePatterns,
  Z as getPatternSets,
  x as toRomaji
};
