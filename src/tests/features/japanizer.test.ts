import Japanizer from "../../features/japanizer";
import {
  Pattern,
  Combinations,
  OnePattern,
} from "../../types/transliterate.types";

describe("Japanizer", () => {
  let japanizer: Japanizer;

  beforeEach(() => {
    japanizer = new Japanizer();
  });

  /**
   * メソッドテスト
   */
  // transliterateメソッド
  describe("transliterateメソッド正常系", () => {
    it("ひらがな/カタカナ変換が正しく行える", () => {
      const result = japanizer.transliterate("hajimemasite");
      expect(result).toEqual(["はじめまして", "ハジメマシテ"]);
    });

    it("ん＋な行の文章のひらがな/カタカナ変換が正しく行える", () => {
        const result = japanizer.transliterate("konnitiha");
        expect(result).toEqual(["こんにちは", "コンニチハ"]);
      });

    it("空文字入力時にnullを返す", () => {
      expect(japanizer.transliterate("")).toBeNull();
    });
  });

  describe("transliterateメソッド異常系", () => {
    it("変換不能文字入力時に値を全角文字で返す", () => {
      const invalidInput = "xyz";
      const result = japanizer.transliterate(invalidInput);
      expect(result).toEqual(["ｘｙｚ", "ｘｙｚ"]);
    });

    it("変換不能文字(記号)入力時に値を全角文字で返す", () => {
      const invalidInput = "!@#$%^&*()_+-={}[]:;',./?<>";
      const result = japanizer.transliterate(invalidInput);
      expect(result).toEqual([
        "！＠＃＄％＾＆＊（）＿＋－＝｛｝「」：；＇、。・？＜＞",
        "！＠＃＄％＾＆＊（）＿＋－＝｛｝「」：；＇、。・？＜＞",
      ]);
    });
  });

  // generatePatternArrayメソッド
  describe("generatePatternArrayメソッド正常系", () => {
    it("4文字のローマ字パターンを正しく認識", () => {
      const japanizer = new Japanizer();
      const spyFn = jest.spyOn(japanizer as any, "generatePatternArray");

      japanizer.transliterate("ltsu");

      expect(spyFn).toHaveBeenCalledWith("ltsu");
      expect(spyFn.mock.results[0].value).toEqual([["っ", "ッ"]]);

      spyFn.mockRestore();
    });

    it("3文字のローマ字パターンを正しく認識", () => {
      const japanizer = new Japanizer();
      const spyFn = jest.spyOn(japanizer as any, "generatePatternArray");

      japanizer.transliterate("kyatya");

      expect(spyFn).toHaveBeenCalledWith("kyatya");
      expect(spyFn.mock.results[0].value).toEqual([
        ["きゃ", "キャ"],
        ["ちゃ", "チャ"],
      ]);

      spyFn.mockRestore();
    });

    it("2文字のローマ字パターンを正しく認識", () => {
      const japanizer = new Japanizer();
      const spyFn = jest.spyOn(japanizer as any, "generatePatternArray");

      japanizer.transliterate("kawo");

      expect(spyFn).toHaveBeenCalledWith("kawo");
      expect(spyFn.mock.results[0].value).toEqual([
        ["か", "カ"],
        ["を", "ヲ"],
      ]);

      spyFn.mockRestore();
    });

    it("1文字のローマ字パターンを正しく認識", () => {
      const japanizer = new Japanizer();
      const spyFn = jest.spyOn(japanizer as any, "generatePatternArray");

      japanizer.transliterate("aiueo");

      expect(spyFn).toHaveBeenCalledWith("aiueo");
      expect(spyFn.mock.results[0].value).toEqual([
        ["あ", "ア"],
        ["い", "イ"],
        ["う", "ウ"],
        ["え", "エ"],
        ["お", "オ"],
      ]);

      spyFn.mockRestore();
    });
  });

  describe("generatePatternArrayメソッド異常系", () => {
    it("変換不能文字を含む値で一致しない文字はそのまま返す", () => {
      const japanizer = new Japanizer();
      const spyFn = jest.spyOn(japanizer as any, "generatePatternArray");

      japanizer.transliterate("kjafl");

      expect(spyFn).toHaveBeenCalledWith("kjafl");
      expect(spyFn.mock.results[0].value).toEqual([
        ["k", "k"],
        ["じゃ", "ジャ"],
        ["f", "f"],
        ["l", "l"],
      ]);

      spyFn.mockRestore();
    });
  });

  // generateAllCombinationsメソッド
  describe("generateAllCombinationsメソッド正常系", () => {
    it("文章を正しく返す", () => {
      const japanizer = new Japanizer();
      const spyFn = jest.spyOn(japanizer as any, "generateAllCombinations");
      const pattern: Pattern = [
        ["あ", "ア"],
        ["い", "イ"],
        ["う", "ウ"],
        ["え", "エ"],
        ["お", "オ"],
      ];

      japanizer.transliterate("aiueo");

      expect(spyFn).toHaveBeenCalledWith(pattern);
      expect(spyFn.mock.results[0].value).toEqual([
        [["あいうえお"], ["アイウエオ"]],
      ]);

      spyFn.mockRestore();
    });
  });

  describe("generateAllCombinationsメソッド異常系", () => {
    it("変換不能文字を含む文章で一致しない文字はそのまま返す", () => {
      const japanizer = new Japanizer();
      const spyFn = jest.spyOn(japanizer as any, "generateAllCombinations");
      const pattern: Pattern = [
        ["2", "2"],
        ["0", "0"],
        ["0", "0"],
        ["0", "0"],
        ["ね", "ネ"],
        ["ん", "ン"],
        ["の", "ノ"],
        ["x", "x"],
        ["が", "ガ"],
        ["つ", "ツ"],
      ];

      japanizer.transliterate("2000nennnoxgatu");

      expect(spyFn).toHaveBeenCalledWith(pattern);
      expect(spyFn.mock.results[0].value).toEqual([
        [["２０００ねんのｘがつ"], ["２０００ネンノｘガツ"]],
      ]);

      spyFn.mockRestore();
    });
  });

  describe("transformCombinationメソッド正常系", () => {
    it("正しく変換する", () => {
      const japanizer = new Japanizer();
      const spyFn = jest.spyOn(japanizer as any, "transformCombination");
      const pattern: Combinations = [[["あいうえお"], ["アイウエオ"]]];

      japanizer.transliterate("aiueo");

      expect(spyFn).toHaveBeenCalledWith(pattern);
      expect(spyFn.mock.results[0].value).toEqual(["あいうえお", "アイウエオ"]);

      spyFn.mockRestore();
    });
  });

  /**
   * パフォーマンステスト
   */
  function generateLargeInput(length: number): string {
    const characters = "abcdefghijklmnopqrstuvwxyz";
    return Array(length)
      .fill(null)
      .map(() => characters[Math.floor(Math.random() * characters.length)])
      .join("");
  }

  describe("パフォーマンステスト", () => {
    const japanizer = new Japanizer();
    const inputSizes = [1000, 10000, 100000, 1000000];

    inputSizes.forEach((size) => {
      it(`${size} 文字の入力を処理`, async () => {
        const input = generateLargeInput(size);

        const startMemory = process.memoryUsage().heapUsed;
        const startTime = performance.now();

        japanizer.transliterate(input);

        const endTime = performance.now();
        const endMemory = process.memoryUsage().heapUsed;

        const executionTime = endTime - startTime;
        const memoryUsage = (endMemory - startMemory) / 1024 / 1024;

        console.log(`Input size: ${size} characters`);
        console.log(`Execution time: ${executionTime} ms`);
        console.log(`Memory usage: ${memoryUsage} MB`);

        expect(executionTime).toBeLessThan(1000); // 1秒未満
        expect(memoryUsage).toBeLessThan(100); // 100MB未満
      });
    });
  });

  describe("並列処理テスト", () => {
    it("非同期で並行処理をテスト", async () => {
      const japanizer = new Japanizer();
      const inputStrings = [
        "konnichiha",
        "sayounara",
        "arigatou",
        "ohayou",
        "oyasumi",
      ];

      const concurrentCalls = inputStrings.map(
        (str) =>
          new Promise<OnePattern | null | { error: string }>((resolve) => {
            setTimeout(() => {
              resolve(japanizer.transliterate(str));
            }, Math.random() * 100);
          })
      );

      const results = await Promise.all(concurrentCalls);

      expect(results).toEqual([
        ["こんにちは", "コンニチハ"],
        ["さようなら", "サヨウナラ"],
        ["ありがとう", "アリガトウ"],
        ["おはよう", "オハヨウ"],
        ["おやすみ", "オヤスミ"],
      ]);
    });
  });

  describe("ストレステスト", () => {
    it("安定性を確認", async () => {
      const japanizer = new Japanizer();
      const inputStrings = [
        "konnichiwa",
        "sayounara",
        "arigatou",
        "ohayougozaimasu",
        "oyasuminasai",
      ];

      const numberOfCalls = 10000;
      const concurrentCalls = Array(numberOfCalls)
        .fill(null)
        .map(
          () =>
            new Promise<string[]>((resolve) => {
              const randomInput =
                inputStrings[Math.floor(Math.random() * inputStrings.length)];
              resolve(japanizer.transliterate(randomInput) as string[]);
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
        expect(result.length).toBe(2);
        expect(typeof result[0]).toBe("string");
        expect(typeof result[1]).toBe("string");
      });
    });
  });
});
