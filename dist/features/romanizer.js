"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const convert_utils_1 = __importDefault(require("../utils/convert.utils"));
const pattern_1 = require("../data/pattern");
const base_transliterator_1 = __importDefault(require("./abstract/base-transliterator"));
/**
 * かな・カナ → ローマ字変換クラス
 */
class Romanizer extends base_transliterator_1.default {
    NA_LINE_CHARS = "なにぬねのナニヌネノ";
    N_CHARS = "んン";
    TSU_CHARS = "っッ";
    // かな・カナを区切ったマップ
    optimizedMap = Object.entries(pattern_1.kanaToRomajiMap).reduce((acc, [key, value]) => {
        key.split("|").forEach((char) => {
            acc[char] = value;
        });
        return acc;
    }, {});
    /**
     * かな・カナ → ローマ字変換
     * @param str - ローマ字変換対象文字列
     * @returns combinations Array<[string[文章], string[１文字識別可能文章]]>
     */
    transliterate(str, chunkSize = 500) {
        try {
            if (!str) {
                return null;
            }
            const chunks = this.splitIntoChunks(str, chunkSize);
            const results = [];
            for (const chunk of chunks) {
                const convertedChunk = new convert_utils_1.default().toHalfWidthEnhanced(chunk);
                const patternArray = this.generatePatternArray(convertedChunk);
                const combinations = this.generateAllCombinations(patternArray);
                results.push(...combinations);
            }
            return results;
        }
        catch (e) {
            return { error: `An error occurred: ${e}` };
        }
    }
    /**
     * かな文字のローマ字パターンを配列で返す
     * @param str - ローマ字変換対象文字列
     * @returns patterns - 各文字ごとのローマ字パターン配列
     */
    generatePatternArray(str) {
        const patterns = [];
        let i = 0;
        let matchedPattern;
        while (i < str.length) {
            // 「ん」「ン」の場合の処理
            if (this.N_CHARS.includes(str[i])) {
                patterns.push(i + 1 < str.length && this.NA_LINE_CHARS.includes(str[i + 1])
                    ? ["nn"]
                    : ["n", "nn"]);
                i++;
                continue;
            }
            // 「っ」「ッ」の場合の処理
            if (this.TSU_CHARS.includes(str[i])) {
                const tsuPattern = this.optimizedMap[str[i]];
                const nextChar = str[i + 1];
                if (nextChar && this.optimizedMap[nextChar]) {
                    const nextCharPattern = this.optimizedMap[nextChar][0];
                    const consonant = nextCharPattern.charAt(0);
                    patterns.push([...tsuPattern, consonant]);
                }
                else {
                    patterns.push(tsuPattern);
                }
                i++;
                continue;
            }
            // 拗音の処理
            if (i + 1 < str.length) {
                const twoChars = str.slice(i, i + 2);
                matchedPattern = this.optimizedMap[twoChars];
                if (matchedPattern) {
                    patterns.push(matchedPattern);
                    i += 2;
                    continue;
                }
            }
            // 単音の処理
            matchedPattern = this.optimizedMap[str[i]];
            if (matchedPattern) {
                patterns.push(matchedPattern);
            }
            else {
                patterns.push([str[i]]);
            }
            i++;
        }
        return patterns;
    }
    /**
     * 全てのローマ字パターンを出力
     * @param patterns
     * @returns result Array<[string[文章], string[１文字識別可能文章]]>
     */
    generateAllCombinations(patterns) {
        const results = [];
        const stack = [
            {
                current: [],
                parts: [],
                index: 0,
            },
        ];
        while (stack.length > 0) {
            const { current, parts, index } = stack.pop();
            if (index === patterns.length) {
                results.push([[current.join("")], parts]);
                continue;
            }
            for (const char of patterns[index].slice().reverse()) {
                stack.push({
                    current: [...current, char],
                    parts: [...parts, char],
                    index: index + 1,
                });
            }
        }
        return results;
    }
}
exports.default = Romanizer;
