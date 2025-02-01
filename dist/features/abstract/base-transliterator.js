"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BaseTransliterator {
    convertedStr = [];
    combinations = [];
    /**
     * チャンク分けのメソッド
     * @param str
     * @param size
     * @returns chunks
     */
    splitIntoChunks(str, size) {
        const chunks = [];
        for (let i = 0; i < str.length; i += size) {
            chunks.push(str.slice(i, i + size));
        }
        return chunks;
    }
}
exports.default = BaseTransliterator;
