"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const romanizer_1 = __importDefault(require("../../features/romanizer"));
describe("Romanizer", () => {
    let romanizer;
    beforeEach(() => {
        romanizer = new romanizer_1.default();
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
            const result = romanizer.transliterate("がっこう");
            const expected = [["gakkou"], ["ga", "k", "ko", "u"]];
            expect(result).toContainEqual(expected);
        });
        it("空文字入力時にnullを返す", () => {
            expect(romanizer.transliterate("")).toBeNull();
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
            const romanizer = new romanizer_1.default();
            const spyFn = jest.spyOn(romanizer, "generatePatternArray");
            romanizer.transliterate("こんにちは");
            expect(spyFn).toHaveBeenCalledWith("こんにちは");
            expect(spyFn.mock.results[0].value).toContainEqual(["nn"]);
            spyFn.mockRestore();
        });
    });
    // generateAllCombinationsメソッド
    describe("generateAllCombinationsメソッド正常系", () => {
        it("文章を正しく返す", () => {
            const romanizer = new romanizer_1.default();
            const spyFn = jest.spyOn(romanizer, "generateAllCombinations");
            const pattern = [
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
    function generateLargeInput(length) {
        const characters = "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん";
        return Array(length)
            .fill(null)
            .map(() => characters[Math.floor(Math.random() * characters.length)])
            .join("");
    }
    describe("パフォーマンステスト", () => {
        const romanizer = new romanizer_1.default();
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
                expect(executionTime).toBeLessThan(1000); // 1秒未満
                expect(memoryUsage).toBeLessThan(100); // 100MB未満
            });
        });
    });
    describe("並列処理テスト", () => {
        it("非同期で並行処理をテスト", async () => {
            const romanizer = new romanizer_1.default();
            const inputStrings = [
                "こんにちは",
                "さようなら",
                "ありがとう",
                "おはよう",
                "おやすみ",
            ];
            const results = await Promise.all(inputStrings.map((str) => romanizer.transliterate(str)));
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
            const romanizer = new romanizer_1.default();
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
                .map(() => new Promise((resolve) => {
                const randomInput = inputStrings[Math.floor(Math.random() * inputStrings.length)];
                resolve(romanizer.transliterate(randomInput));
            }));
            const startTime = Date.now();
            const results = await Promise.all(concurrentCalls);
            const endTime = Date.now();
            console.log(`Processed ${numberOfCalls} calls in ${endTime - startTime}ms`);
            expect(results.length).toBe(numberOfCalls);
            results.forEach((result) => {
                expect(Array.isArray(result)).toBe(true);
            });
        });
    });
});
