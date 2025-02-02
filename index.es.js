class y {
  // 全角英数字記号を半角に変換
  toHalfWidthEnhanced(t) {
    return t.replace(/[Ａ-Ｚａ-ｚ０-９！-～]/g, (n) => String.fromCharCode(n.charCodeAt(0) - 65248)).replace(/、/g, ",").replace(/。/g, ".").replace(/・/g, "/");
  }
  // 半角英数字記号を全角に変換
  toFullWidthEnhanced(t) {
    return t.replace(/[A-Za-z0-9!-~]/g, (n) => String.fromCharCode(n.charCodeAt(0) + 65248)).replace(/，/g, "、").replace(/\．/g, "。").replace(/\／/g, "・").replace(/［/g, "「").replace(/］/g, "」");
  }
}
const l = {
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
}, s = {};
for (const [c, t] of Object.entries(l)) {
  const [n, e] = c.split("|");
  t.forEach((a) => {
    s[a] ? (s[a].includes(n) || s[a].push(n), s[a].includes(e) || s[a].push(e)) : s[a] = [n, e];
  });
}
class p {
  constructor() {
    this.convertedStr = [], this.combinations = [];
  }
  /**
   * チャンク分けのメソッド
   * @param str 
   * @param size 
   * @returns chunks
   */
  splitIntoChunks(t, n) {
    const e = [];
    for (let a = 0; a < t.length; a += n)
      e.push(t.slice(a, a + n));
    return e;
  }
}
class d extends p {
  constructor() {
    super(...arguments), this.NA_LINE_CHARS = "なにぬねのナニヌネノ", this.N_CHARS = "んン", this.TSU_CHARS = "っッ", this.optimizedMap = Object.entries(
      l
    ).reduce((t, [n, e]) => (n.split("|").forEach((a) => {
      t[a] = e;
    }), t), {});
  }
  /**
   * かな・カナ → ローマ字変換
   * @param str - ローマ字変換対象文字列
   * @returns combinations Array<[string[文章], string[１文字識別可能文章]]>
   */
  transliterate(t, n = 500) {
    try {
      if (!t)
        return null;
      const e = this.splitIntoChunks(t, n), a = [];
      for (const i of e) {
        const r = new y().toHalfWidthEnhanced(i), u = this.generatePatternArray(r), o = this.generateAllCombinations(u);
        a.push(...o);
      }
      return a;
    } catch (e) {
      return { error: `An error occurred: ${e}` };
    }
  }
  /**
   * かな文字のローマ字パターンを配列で返す
   * @param str - ローマ字変換対象文字列
   * @returns patterns - 各文字ごとのローマ字パターン配列
   */
  generatePatternArray(t) {
    const n = [];
    let e = 0, a;
    for (; e < t.length; ) {
      if (this.N_CHARS.includes(t[e])) {
        n.push(
          e + 1 < t.length && this.NA_LINE_CHARS.includes(t[e + 1]) ? ["nn"] : ["n", "nn"]
        ), e++;
        continue;
      }
      if (this.TSU_CHARS.includes(t[e])) {
        const i = this.optimizedMap[t[e]], r = t[e + 1];
        if (r && this.optimizedMap[r]) {
          const o = this.optimizedMap[r][0].charAt(0);
          n.push([...i, o]);
        } else
          n.push(i);
        e++;
        continue;
      }
      if (e + 1 < t.length) {
        const i = t.slice(e, e + 2);
        if (a = this.optimizedMap[i], a) {
          n.push(a), e += 2;
          continue;
        }
      }
      a = this.optimizedMap[t[e]], a ? n.push(a) : n.push([t[e]]), e++;
    }
    return n;
  }
  /**
   * 全てのローマ字パターンを出力
   * @param patterns
   * @returns result Array<[string[文章], string[１文字識別可能文章]]>
   */
  generateAllCombinations(t) {
    const n = [], e = [
      {
        current: [],
        parts: [],
        index: 0
      }
    ];
    for (; e.length > 0; ) {
      const { current: a, parts: i, index: r } = e.pop();
      if (r === t.length) {
        n.push([[a.join("")], i]);
        continue;
      }
      for (const u of t[r].slice().reverse())
        e.push({
          current: [...a, u],
          parts: [...i, u],
          index: r + 1
        });
    }
    return n;
  }
}
class f extends p {
  /**
   * ローマ字 → かな・カナ変換
   */
  transliterate(t, n = 1e3) {
    try {
      if (!t)
        return null;
      const e = this.splitIntoChunks(t, n), a = [];
      for (const i of e) {
        const r = new y().toHalfWidthEnhanced(i), u = this.generatePatternArray(r), o = this.generateAllCombinations(u), h = this.transformCombination(o);
        a.push(h);
      }
      return this.mergeResults(a);
    } catch (e) {
      return { error: `An error occurred: ${e}` };
    }
  }
  mergeResults(t) {
    return [
      t.map((n) => n[0]).join(""),
      t.map((n) => n[1]).join("")
    ];
  }
  /**
   * ローマ字のかな文字パターンを配列で返す
   * @param str - かな文字変換対象文字列
   * @returns patterns - 各文字ごとのかな文字パターン配列
   */
  generatePatternArray(t) {
    const n = [];
    let e = 0, a;
    const i = (o) => {
      if (e + o <= t.length) {
        const h = t.slice(e, e + o);
        if (a = s[h], a)
          return n.push(a), e += o, !0;
      }
      return !1;
    }, r = () => {
      if (e + 1 < t.length) {
        const o = t.slice(e + 1, e + 3);
        return ["na", "ni", "nu", "ne", "no"].includes(o);
      }
      return !1;
    }, u = () => {
      if (e + 1 < t.length) {
        const o = t[e], h = t[e + 1];
        return o === h && "bcdfghjklmpqrstvwxyz".includes(o);
      }
      return !1;
    };
    for (; e < t.length; ) {
      if (t[e] === "n" && r()) {
        n.push(s.n), e++;
        continue;
      }
      if (u()) {
        n.push(s.xtu), e++;
        continue;
      }
      [4, 3, 2].some(i) || (a = s[t[e]], a ? n.push(a) : n.push([t[e], t[e]]), e++);
    }
    return n;
  }
  /**
   * ひらがな・カタカナのパターンを返す
   * @param patterns
   * @returns [[[hiragana], [katakana]]]
   */
  generateAllCombinations(t) {
    const n = new y(), e = t.map((i) => i[0]).join(""), a = t.map((i) => i[1]).join("");
    return [
      [
        [n.toFullWidthEnhanced(e)],
        [n.toFullWidthEnhanced(a)]
      ]
    ];
  }
  /**
   * コンビネーション型変換
   * @param combination
   * @returns [hiragana, katakana] [[[]]]の配列を[]にする
   */
  transformCombination(t) {
    const [[n], [e]] = t[0];
    return [n, e];
  }
}
export {
  f as Japanizer,
  d as Romanizer
};
