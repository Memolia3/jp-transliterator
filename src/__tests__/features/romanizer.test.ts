import Romanizer from "../../features/romanizer";
import {
  Pattern,
  Combinations,
  OnePattern,
} from "../../types/transliterate.types";

describe("Romanizer", () => {
  let romanizer: Romanizer;

  beforeEach(() => {
    romanizer = new Romanizer();
  });

  afterEach(() => {
    if (global.gc) {
      global.gc();
    }
  });

  /**
   * メソッドテスト
   */
  // transliterateメソッド
  describe("transliterateメソッド正常系", () => {
    it("ひらがな/カタカナからローマ字への変換が正しく行える", () => {
      const result = romanizer.transliterate("はじめまして");
      const expected = [
        ["hajimemashite"],
        ["ha", "ji", "me", "ma", "shi", "te"],
      ];
      expect(result).toContainEqual(expected);
    });

    it("「ん」を含む文章のローマ字変換が正しく行える", () => {
      const result = romanizer.transliterate("こんにちは");
      const expected = [["konnnichiha"], ["ko", "nn", "ni", "chi", "ha"]];
      expect(result).toContainEqual(expected);
    });

    it("「っ」を含む文章のローマ字変換が正しく行える", () => {
      const result = romanizer.transliterate("ストレッチ");
      const expected = [["sutoretti"], ["su", "to", "re", "t", "ti"]];
      expect(result).toContainEqual(expected);
    });

    it("「っ」を含む文章のローマ字変換が正しく行える2", () => {
      const result = romanizer.transliterate("ストレッチ");
      const expected = [["sutorecchi"], ["su", "to", "re", "c", "chi"]];
      expect(result).toContainEqual(expected);
    });

    it("「っ」を含む文章のローマ字変換が正しく行える3", () => {
      const result = romanizer.transliterate("バッファ");
      const expected = [["baffa"], ["ba", "f", "fa"]];
      expect(result).toContainEqual(expected);
    });

    it("「っ」を含む文章のローマ字変換が正しく行える4", () => {
      const result = romanizer.transliterate("バッフ");
      const expected = [["baffu"], ["ba", "f", "fu"]];
      expect(result).toContainEqual(expected);
    });

    it("「っ」を含む文章のローマ字変換が正しく行える5", () => {
      const result =
        romanizer.transliterate("ちゃっちゅっちょっふぁっふぃっふぉ");
      const expected = [
        ["tyattyuttyoffaffiffo"],
        ["tya", "t", "tyu", "t", "tyo", "f", "fa", "f", "fi", "f", "fo"],
      ];
      expect(result).toContainEqual(expected);
    });

    it("「っ」を含む文章のローマ字変換が正しく行える6", () => {
      const result =
        romanizer.transliterate("チャッチュッチョッファッフィッフォ");
      const expected = [
        ["tyattyuttyoffaffiffo"],
        ["tya", "t", "tyu", "t", "tyo", "f", "fa", "f", "fi", "f", "fo"],
      ];
      expect(result).toContainEqual(expected);
    });

    it("ハイフンを含む文章のローマ字変換が正しく行える", () => {
      const result = romanizer.transliterate("ー‐-");
      const expected = [["---"], ["-", "-", "-"]];
      expect(result).toContainEqual(expected);
    });

    it("記号を含む文章のローマ字変換が正しく行える", () => {
      const result = romanizer.transliterate(
        "！＠＃＄％＾＆＊（）＿＋－＝｛｝「」：；＇、。・？＜＞"
      );
      const expected = [
        ["!@#$%^&*()_+-={}[]:;',./?<>"],
        [
          "!",
          "@",
          "#",
          "$",
          "%",
          "^",
          "&",
          "*",
          "(",
          ")",
          "_",
          "+",
          "-",
          "=",
          "{",
          "}",
          "[",
          "]",
          ":",
          ";",
          "'",
          ",",
          ".",
          "/",
          "?",
          "<",
          ">",
        ],
      ];
      expect(result).toContainEqual(expected);
    });

    describe("５０音のローマ字変換", () => {
      it("あ行のローマ字変換が正しく行える", () => {
        const result = romanizer.transliterate("あいうえお");
        const expected = [["aiueo"], ["a", "i", "u", "e", "o"]];
        expect(result).toContainEqual(expected);
      });

      it("か行のローマ字変換が正しく行える", () => {
        const result = romanizer.transliterate("かきくけこ");
        const expected = [["kakikukeko"], ["ka", "ki", "ku", "ke", "ko"]];
        expect(result).toContainEqual(expected);
      });

      it("さ行のローマ字変換が正しく行える", () => {
        const result = romanizer.transliterate("さしすせそ");
        const expected = [["sashisuseso"], ["sa", "shi", "su", "se", "so"]];
        expect(result).toContainEqual(expected);
      });

      it("た行のローマ字変換が正しく行える", () => {
        const result = romanizer.transliterate("たちつてと");
        const expected = [["tachitsuteto"], ["ta", "chi", "tsu", "te", "to"]];
        expect(result).toContainEqual(expected);
      });

      it("な行のローマ字変換が正しく行える", () => {
        const result = romanizer.transliterate("なにぬねの");
        const expected = [["naninuneno"], ["na", "ni", "nu", "ne", "no"]];
        expect(result).toContainEqual(expected);
      });

      it("は行のローマ字変換が正しく行える", () => {
        const result = romanizer.transliterate("はひふへほ");
        const expected = [["hahihuheho"], ["ha", "hi", "hu", "he", "ho"]];
        expect(result).toContainEqual(expected);
      });

      it("ま行のローマ字変換が正しく行える", () => {
        const result = romanizer.transliterate("まみむめも");
        const expected = [["mamimumemo"], ["ma", "mi", "mu", "me", "mo"]];
        expect(result).toContainEqual(expected);
      });

      it("や行のローマ字変換が正しく行える", () => {
        const result = romanizer.transliterate("やゆよ");
        const expected = [["yayuyo"], ["ya", "yu", "yo"]];
        expect(result).toContainEqual(expected);
      });

      it("ら行のローマ字変換が正しく行える", () => {
        const result = romanizer.transliterate("らりるれろ");
        const expected = [["rarirurero"], ["ra", "ri", "ru", "re", "ro"]];
        expect(result).toContainEqual(expected);
      });

      it("わ行とんのローマ字変換が正しく行える", () => {
        const result = romanizer.transliterate("わをん");
        const expected = [["wawon"], ["wa", "wo", "n"]];
        expect(result).toContainEqual(expected);
      });

      it("カタカナのあ行のローマ字変換が正しく行える", () => {
        const result = romanizer.transliterate("アイウエオ");
        const expected = [["aiueo"], ["a", "i", "u", "e", "o"]];
        expect(result).toContainEqual(expected);
      });

      it("カタカナのか行のローマ字変換が正しく行える", () => {
        const result = romanizer.transliterate("カキクケコ");
        const expected = [["kakikukeko"], ["ka", "ki", "ku", "ke", "ko"]];
        expect(result).toContainEqual(expected);
      });

      it("カタカナのさ行のローマ字変換が正しく行える", () => {
        const result = romanizer.transliterate("サシスセソ");
        const expected = [["sashisuseso"], ["sa", "shi", "su", "se", "so"]];
        expect(result).toContainEqual(expected);
      });

      it("カタカナのた行のローマ字変換が正しく行える", () => {
        const result = romanizer.transliterate("タチツテト");
        const expected = [["tachitsuteto"], ["ta", "chi", "tsu", "te", "to"]];
        expect(result).toContainEqual(expected);
      });

      it("カタカナのな行のローマ字変換が正しく行える", () => {
        const result = romanizer.transliterate("ナニヌネノ");
        const expected = [["naninuneno"], ["na", "ni", "nu", "ne", "no"]];
        expect(result).toContainEqual(expected);
      });

      it("カタカナのは行のローマ字変換が正しく行える", () => {
        const result = romanizer.transliterate("ハヒフヘホ");
        const expected = [["hahifuheho"], ["ha", "hi", "fu", "he", "ho"]];
        expect(result).toContainEqual(expected);
      });

      it("カタカナのま行のローマ字変換が正しく行える", () => {
        const result = romanizer.transliterate("マミムメモ");
        const expected = [["mamimumemo"], ["ma", "mi", "mu", "me", "mo"]];
        expect(result).toContainEqual(expected);
      });

      it("カタカナのや行のローマ字変換が正しく行える", () => {
        const result = romanizer.transliterate("ヤユヨ");
        const expected = [["yayuyo"], ["ya", "yu", "yo"]];
        expect(result).toContainEqual(expected);
      });

      it("カタカナのら行のローマ字変換が正しく行える", () => {
        const result = romanizer.transliterate("ラリルレロ");
        const expected = [["rarirurero"], ["ra", "ri", "ru", "re", "ro"]];
        expect(result).toContainEqual(expected);
      });

      it("カタカナのわ行とンのローマ字変換が正しく行える", () => {
        const result = romanizer.transliterate("ワヲン");
        const expected = [["wawon"], ["wa", "wo", "n"]];
        expect(result).toContainEqual(expected);
      });
    });
  });

  describe("transliterateメソッド異常系", () => {
    it("変換不能文字入力時に値をそのまま返す", () => {
      const invalidInput = "ABC123";
      const result = romanizer.transliterate(invalidInput);
      const expected = [["ABC123"], ["A", "B", "C", "1", "2", "3"]];
      expect(result).toContainEqual(expected);
    });
  });

  // generatePatternArrayメソッド
  describe("generatePatternArrayメソッド正常系", () => {
    it("「ん」のパターンを正しく認識", () => {
      const romanizer = new Romanizer();
      const spyFn = jest.spyOn(romanizer as any, "generatePatternArray");

      romanizer.transliterate("こんにちは");

      expect(spyFn).toHaveBeenCalledWith("こんにちは");
      expect(spyFn.mock.results[0].value).toContainEqual(["nn"]);

      spyFn.mockRestore();
    });
  });

  // generateAllCombinationsメソッド
  describe("generateAllCombinationsメソッド正常系", () => {
    it("文章を正しく返す", () => {
      const romanizer = new Romanizer();
      const spyFn = jest.spyOn(romanizer as any, "generateAllCombinations");
      const pattern: Pattern = [
        ["a"],
        ["i", "yi"],
        ["u", "wu", "whu"],
        ["e"],
        ["o"],
      ];

      romanizer.transliterate("あいうえお");

      expect(spyFn).toHaveBeenCalledWith(pattern);
      expect(spyFn.mock.results[0].value).toContainEqual([
        ["aiueo"],
        ["a", "i", "u", "e", "o"],
      ]);

      spyFn.mockRestore();
    });
  });

  /**
   * パフォーマンステスト
   */
  function generateLargeInput(length: number): string {
    const characters =
      "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん";
    return Array(length)
      .fill(null)
      .map(() => characters[Math.floor(Math.random() * characters.length)])
      .join("");
  }

  describe("パフォーマンステスト", () => {
    const romanizer = new Romanizer();
    const inputSizes = [10, 50];

    inputSizes.forEach((size) => {
      it(`${size} 文字の入力を処理`, async () => {
        const input = generateLargeInput(size);

        const startMemory = process.memoryUsage().heapUsed;
        const startTime = performance.now();

        romanizer.transliterate(input);

        const endTime = performance.now();
        const endMemory = process.memoryUsage().heapUsed;

        const executionTime = endTime - startTime;
        const memoryUsage = (endMemory - startMemory) / 1024 / 1024;

        console.log(`Input size: ${size} characters`);
        console.log(`Execution time: ${executionTime} ms`);
        console.log(`Memory usage: ${memoryUsage} MB`);

        expect(executionTime).toBeLessThan(2000); // 2秒未満
        expect(memoryUsage).toBeLessThan(100); // 100MB未満
      });
    });
  });

  describe("並列処理テスト", () => {
    it("非同期で並行処理をテスト", async () => {
      const romanizer = new Romanizer();
      const inputStrings = [
        "こんにちは",
        "さようなら",
        "ありがとう",
        "おはよう",
        "おやすみ",
      ];

      const results = await Promise.all(
        inputStrings.map((str) => romanizer.transliterate(str))
      );

      const expectedResults = [
        [["konnnichiha"], ["ko", "nn", "ni", "chi", "ha"]],
        [["sayounara"], ["sa", "yo", "u", "na", "ra"]],
        [["arigatou"], ["a", "ri", "ga", "to", "u"]],
        [["ohayou"], ["o", "ha", "yo", "u"]],
        [["oyasumi"], ["o", "ya", "su", "mi"]],
      ];

      expectedResults.forEach((expected, index) => {
        expect(results[index]).toContainEqual(expected);
      });
    });
  });

  describe("ストレステスト", () => {
    it("安定性を確認", async () => {
      const romanizer = new Romanizer();
      const inputStrings = [
        "こんにちは",
        "さようなら",
        "ありがとう",
        "おはようございます",
        "おやすみなさい",
      ];

      const numberOfCalls = 5;
      const concurrentCalls = Array(numberOfCalls)
        .fill(null)
        .map(
          () =>
            new Promise<Combinations>((resolve) => {
              const randomInput =
                inputStrings[Math.floor(Math.random() * inputStrings.length)];
              resolve(romanizer.transliterate(randomInput) as Combinations);
            })
        );

      const startTime = Date.now();
      const results = await Promise.all(concurrentCalls);
      const endTime = Date.now();

      console.log(
        `Processed ${numberOfCalls} calls in ${endTime - startTime}ms`
      );

      expect(results.length).toBe(numberOfCalls);
      results.forEach((result) => {
        expect(Array.isArray(result)).toBe(true);
      });
    });
  });
});
