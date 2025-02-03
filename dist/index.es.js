const o = class o {
  /**
   * 全角文字を半角に変換
   * @param str 変換対象文字列
   * @returns 変換後の文字列
   */
  static toHalfWidth(t) {
    return t != null && t.length ? t.replace(
      o.FULL_TO_HALF_REGEX,
      (e) => String.fromCharCode(e.charCodeAt(0) - 65248)
    ).replace(
      o.FULL_SYMBOLS_REGEX,
      (e) => o.fullToHalfMap[e] || e
    ) : t;
  }
  /**
   * 半角文字を全角に変換
   * @param str 変換対象文字列
   * @returns 変換後の文字列
   */
  static toFullWidth(t) {
    return t != null && t.length ? t.replace(
      o.HALF_TO_FULL_REGEX,
      (e) => String.fromCharCode(e.charCodeAt(0) + 65248)
    ).replace(
      o.HALF_SYMBOLS_REGEX,
      (e) => o.halfToFullMap[e] || e
    ) : t;
  }
};
o.FULL_TO_HALF_REGEX = /[Ａ-Ｚａ-ｚ０-９！-～]/g, o.HALF_TO_FULL_REGEX = /[A-Za-z0-9!-~]/g, o.FULL_SYMBOLS_REGEX = /[、。・ーー「」‐]/g, o.HALF_SYMBOLS_REGEX = /[，．／［］]/g, o.fullToHalfMap = Object.freeze({
  "、": ",",
  "。": ".",
  "・": "/",
  ー: "-",
  "‐": "-",
  "「": "[",
  "」": "]"
}), o.halfToFullMap = Object.freeze({
  "，": "、",
  "．": "。",
  "／": "・",
  "［": "「",
  "］": "」"
});
let g = o;
const m = {
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
  "ゎ|ヮ": ["xwa", "lwa"]
}, c = {};
for (const [d, t] of Object.entries(m)) {
  const [e, n] = d.split("|");
  t.forEach((a) => {
    c[a] ? (c[a].includes(e) || c[a].push(e), c[a].includes(n) || c[a].push(n)) : c[a] = [e, n];
  });
}
class C {
  constructor() {
    this.convertedStr = [], this.combinations = [];
  }
  /**
   * チャンク分けのメソッド
   * @param str 
   * @param size 
   * @returns chunks
   */
  splitIntoChunks(t, e) {
    const n = [];
    for (let a = 0; a < t.length; a += e)
      n.push(t.slice(a, a + e));
    return n;
  }
}
const r = class r extends C {
  constructor() {
    super(...arguments), this.optimizedMap = Object.freeze(
      Object.entries(
        m
      ).reduce((t, [e, n]) => (e.split("|").forEach((a) => {
        t[a] = n;
      }), t), {})
    ), this.patternCache = /* @__PURE__ */ new Map(), this.MAX_CACHE_SIZE = 1e3;
  }
  /**
   * かな・カナ → ローマ字変換
   * @param str 変換対象文字列
   * @param chunkSize チャンクサイズ
   */
  transliterate(t, e = 100) {
    if (!(t != null && t.length)) return null;
    try {
      const n = this.splitIntoChunks(t, e);
      let a = [];
      for (const i of n) {
        const h = g.toHalfWidth(i), s = this.generatePatternArray(h);
        if (!s.length) continue;
        const u = this.generateAllCombinations(s);
        this.mergeResults(a, u), this.patternCache.size > this.MAX_CACHE_SIZE && this.patternCache.clear();
      }
      return a.length ? a : null;
    } catch (n) {
      return {
        error: `変換エラーが発生しました: ${n instanceof Error ? n.message : String(n)}`
      };
    }
  }
  /**
   * チャンク処理の結果を合成
   */
  mergeResults(t, e) {
    for (const n of e)
      t.push(n);
  }
  /**
   * かな文字のローマ字パターンを配列で返す
   */
  generatePatternArray(t) {
    const e = this.patternCache.get(t);
    if (e) return e;
    const n = [];
    let a = 0;
    for (; a < t.length; ) {
      if (this.handleSpecialN(t, a, n)) {
        a++;
        continue;
      }
      if (this.handleTsu(t, a, n)) {
        a++;
        continue;
      }
      const i = this.handleYoon(t, a);
      if (i) {
        n.push(i.pattern), a += i.length;
        continue;
      }
      const h = this.optimizedMap[t[a]];
      n.push(h || [t[a]]), a++;
    }
    return t.length <= 10 && this.patternCache.set(t, n), n;
  }
  /**
   * 「ん」「ン」の特殊処理
   */
  handleSpecialN(t, e, n) {
    return r.N_CHARS.has(t[e]) && e + 1 < t.length && r.NA_LINE_CHARS.has(t[e + 1]) ? (n.push(["nn"]), !0) : r.N_CHARS.has(t[e]) ? (n.push(["n", "nn"]), !0) : !1;
  }
  /**
   * 「っ」「ッ」の処理
   */
  handleTsu(t, e, n) {
    if (!r.TSU_CHARS.has(t[e])) return !1;
    const a = this.optimizedMap[t[e]], i = t[e + 1];
    if (i && this.optimizedMap[i]) {
      const s = this.optimizedMap[i][0].charAt(0);
      return n.push([...a, s]), !0;
    }
    return n.push(a), !0;
  }
  /**
   * 拗音の処理
   */
  handleYoon(t, e) {
    if (e + 1 >= t.length) return null;
    const n = t.slice(e, e + 2), a = this.optimizedMap[n];
    return a ? { pattern: a, length: 2 } : null;
  }
  /**
   * ローマ字パターンの組み合わせを生成
   */
  generateAllCombinations(t) {
    const e = [];
    let n = [{ current: [], parts: [], index: 0 }];
    const a = 1e3;
    for (; n.length > 0; ) {
      const i = [];
      for (const { current: h, parts: s, index: u } of n) {
        if (u === t.length) {
          if (e.push([[h.join("")], s]), e.length >= 5e3) return e;
          continue;
        }
        const l = t[u];
        for (let f = 0; f < l.length; f++) {
          const p = l[f];
          if (i.push({
            current: h.concat(p),
            parts: s.concat(p),
            index: u + 1
          }), i.length >= a)
            return n = i, this.processBatch(n, t, a);
        }
      }
      n = i;
    }
    return e;
  }
  processBatch(t, e, n) {
    const a = [];
    let i = t;
    for (; i.length > 0; ) {
      const h = [];
      for (const { current: s, parts: u, index: l } of i) {
        if (l === e.length) {
          if (a.push([[s.join("")], u]), a.length >= 5e3) return a;
          continue;
        }
        const f = e[l];
        for (let p = 0; p < f.length; p++) {
          const w = f[p];
          if (h.push({
            current: s.concat(w),
            parts: u.concat(w),
            index: l + 1
          }), h.length >= n) break;
        }
      }
      i = h;
    }
    return a;
  }
};
r.NA_LINE_CHARS = /* @__PURE__ */ new Set([
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
]), r.N_CHARS = /* @__PURE__ */ new Set(["ん", "ン"]), r.TSU_CHARS = /* @__PURE__ */ new Set(["っ", "ッ"]);
let A = r;
const y = class y extends C {
  /**
   * ローマ字 → かな・カナ変換
   * @param str 変換対象文字列
   * @param chunkSize チャンクサイズ
   */
  transliterate(t, e = 1e3) {
    if (!(t != null && t.length)) return null;
    try {
      const n = this.splitIntoChunks(t, e), a = [];
      for (const i of n) {
        const h = g.toHalfWidth(i), s = this.generatePatternArray(h);
        if (!s.length) continue;
        const u = this.generateAllCombinations(s), l = this.transformCombination(u);
        a.push(l);
      }
      return a.length ? this.mergeResults(a) : null;
    } catch (n) {
      return {
        error: `変換エラーが発生しました: ${n instanceof Error ? n.message : String(n)}`
      };
    }
  }
  /**
   * チャンク処理の結果を合成
   */
  mergeResults(t) {
    return [
      t.map((e) => e[0]).join(""),
      t.map((e) => e[1]).join("")
    ];
  }
  /**
   * ローマ字のかな文字パターンを配列で返す
   */
  generatePatternArray(t) {
    const e = [];
    let n = 0;
    for (; n < t.length; ) {
      if (this.handleSpecialN(t, n, e)) {
        n++;
        continue;
      }
      if (this.handleDoubleConsonant(t, n, e)) {
        n++;
        continue;
      }
      const a = this.matchPattern(t, n);
      if (a) {
        e.push(a.pattern), n += a.length;
        continue;
      }
      e.push([t[n], t[n]]), n++;
    }
    return e;
  }
  /**
   * 「ん」の特殊処理
   */
  handleSpecialN(t, e, n) {
    return t[e] === "n" && e + 1 < t.length && y.NA_LINE_CHARS.has(t.slice(e + 1, e + 3)) ? (n.push(c.n), !0) : !1;
  }
  /**
   * 促音の処理
   */
  handleDoubleConsonant(t, e, n) {
    return e + 1 < t.length && t[e] === t[e + 1] && y.CONSONANTS.has(t[e]) ? (n.push(c.xtu), !0) : !1;
  }
  /**
   * パターンマッチング
   */
  matchPattern(t, e) {
    for (const n of y.PATTERN_LENGTHS)
      if (e + n <= t.length) {
        const a = t.slice(e, e + n), i = c[a];
        if (i)
          return { pattern: i, length: n };
      }
    return null;
  }
  /**
   * ひらがな・カタカナのパターンを生成
   */
  generateAllCombinations(t) {
    const e = t.map((a) => a[0]).join(""), n = t.map((a) => a[1]).join("");
    return [[[g.toFullWidth(e)], [g.toFullWidth(n)]]];
  }
  /**
   * コンビネーション変換
   */
  transformCombination(t) {
    const [[e], [n]] = t[0];
    return [e, n];
  }
};
y.NA_LINE_CHARS = /* @__PURE__ */ new Set([
  "na",
  "ni",
  "nu",
  "ne",
  "no"
]), y.CONSONANTS = /* @__PURE__ */ new Set([
  "b",
  "c",
  "d",
  "f",
  "g",
  "h",
  "j",
  "k",
  "l",
  "m",
  "p",
  "q",
  "r",
  "s",
  "t",
  "v",
  "w",
  "x",
  "y",
  "z"
]), y.PATTERN_LENGTHS = [4, 3, 2, 1];
let S = y;
export {
  S as Japanizer,
  A as Romanizer
};
