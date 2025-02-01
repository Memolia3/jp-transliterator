import BaseTransliterator from "../../../features/abstract/base-transliterator";
import type {
  OnePattern,
  Pattern,
  Combinations,
} from "../../../types/transliterate.types";

class MockTransliterator extends BaseTransliterator {
  public generatePatternArray(str: string): Pattern {
    return str.split("").map((char) => [char]);
  }

  public generateAllCombinations(patterns: Pattern): Combinations {
    const array: Combinations = [];
    return array;
  }

  public transliterate(
    str: string
  ): OnePattern | Combinations | null | { error: string } {
    if (!str) return null;
    const patterns = this.generatePatternArray(str);
    return this.generateAllCombinations(patterns);
  }

  public exposedSplitIntoChunks(str: string, size: number): string[] {
    return this.splitIntoChunks(str, size);
  }
}

describe("BaseTransliterator", () => {
  let mockTransliterator: MockTransliterator;

  beforeEach(() => {
    mockTransliterator = new MockTransliterator();
  });

  describe("splitIntoChunks", () => {
    it("文字列を指定サイズのチャンクに分割する", () => {
      const input = "abcdefghij";
      const size = 3;
      const expected = ["abc", "def", "ghi", "j"];
      expect(mockTransliterator.exposedSplitIntoChunks(input, size)).toEqual(
        expected
      );
    });

    it("文字列が空の場合、空の配列を返す", () => {
      expect(mockTransliterator.exposedSplitIntoChunks("", 5)).toEqual([]);
    });

    it("チャンクサイズが文字列長より大きい場合、1つのチャンクを返す", () => {
      expect(mockTransliterator.exposedSplitIntoChunks("abc", 5)).toEqual([
        "abc",
      ]);
    });
  });
});
