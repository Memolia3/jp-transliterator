"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_transliterator_1 = __importDefault(require("../../../features/abstract/base-transliterator"));
class MockTransliterator extends base_transliterator_1.default {
    generatePatternArray(str) {
        return str.split("").map((char) => [char]);
    }
    generateAllCombinations(patterns) {
        const array = [];
        return array;
    }
    transliterate(str) {
        if (!str)
            return null;
        const patterns = this.generatePatternArray(str);
        return this.generateAllCombinations(patterns);
    }
    exposedSplitIntoChunks(str, size) {
        return this.splitIntoChunks(str, size);
    }
}
describe("BaseTransliterator", () => {
    let mockTransliterator;
    beforeEach(() => {
        mockTransliterator = new MockTransliterator();
    });
    describe("splitIntoChunks", () => {
        it("文字列を指定サイズのチャンクに分割する", () => {
            const input = "abcdefghij";
            const size = 3;
            const expected = ["abc", "def", "ghi", "j"];
            expect(mockTransliterator.exposedSplitIntoChunks(input, size)).toEqual(expected);
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
