"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const convert_utils_1 = __importDefault(require("../utils/convert.utils"));
const pattern_1 = require("../data/pattern");
const base_transliterator_1 = __importDefault(require("./abstract/base-transliterator"));
/**
 * ローマ字 → かな・カナ変換クラス
 */
class Japanizer extends base_transliterator_1.default {
    /**
     * ローマ字 → かな・カナ変換
     */
    transliterate(str, chunkSize = 1000) {
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
                const kanaPattern = this.transformCombination(combinations);
                results.push(kanaPattern);
            }
            return this.mergeResults(results);
        }
        catch (e) {
            return { error: `An error occurred: ${e}` };
        }
    }
    mergeResults(results) {
        return [
            results.map((r) => r[0]).join(""),
            results.map((r) => r[1]).join(""),
        ];
    }
    /**
     * ローマ字のかな文字パターンを配列で返す
     * @param str - かな文字変換対象文字列
     * @returns patterns - 各文字ごとのかな文字パターン配列
     */
    generatePatternArray(str) {
        const patterns = [];
        let i = 0;
        let matchedPattern;
        const checkAndAddPattern = (length) => {
            if (i + length <= str.length) {
                const chars = str.slice(i, i + length);
                matchedPattern = pattern_1.romajiToKanaMap[chars];
                if (matchedPattern) {
                    patterns.push(matchedPattern);
                    i += length;
                    return true;
                }
            }
            return false;
        };
        const isNextNaLine = () => {
            if (i + 1 < str.length) {
                const nextChars = str.slice(i + 1, i + 3);
                return ["na", "ni", "nu", "ne", "no"].includes(nextChars);
            }
            return false;
        };
        const isDoubleConsonant = () => {
            if (i + 1 < str.length) {
                const currentChar = str[i];
                const nextChar = str[i + 1];
                return (currentChar === nextChar &&
                    "bcdfghjklmpqrstvwxyz".includes(currentChar));
            }
            return false;
        };
        while (i < str.length) {
            if (str[i] === "n" && isNextNaLine()) {
                patterns.push(pattern_1.romajiToKanaMap["n"]);
                i++;
                continue;
            }
            if (isDoubleConsonant()) {
                patterns.push(pattern_1.romajiToKanaMap["xtu"]);
                i++;
                continue;
            }
            if ([4, 3, 2].some(checkAndAddPattern))
                continue;
            matchedPattern = pattern_1.romajiToKanaMap[str[i]];
            if (matchedPattern) {
                patterns.push(matchedPattern);
            }
            else {
                patterns.push([str[i], str[i]]);
            }
            i++;
        }
        return patterns;
    }
    /**
     * ひらがな・カタカナのパターンを返す
     * @param patterns
     * @returns [[[hiragana], [katakana]]]
     */
    generateAllCombinations(patterns) {
        const converter = new convert_utils_1.default();
        const hiragana = patterns.map((pair) => pair[0]).join("");
        const katakana = patterns.map((pair) => pair[1]).join("");
        return [
            [
                [converter.toFullWidthEnhanced(hiragana)],
                [converter.toFullWidthEnhanced(katakana)],
            ],
        ];
    }
    /**
     * コンビネーション型変換
     * @param combination
     * @returns [hiragana, katakana] [[[]]]の配列を[]にする
     */
    transformCombination(combination) {
        const [[hiragana], [katakana]] = combination[0];
        return [hiragana, katakana];
    }
}
exports.default = Japanizer;
