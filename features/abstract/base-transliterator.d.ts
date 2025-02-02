import type { OnePattern, Pattern, Combinations } from "../../types/transliterate.types";
export default abstract class BaseTransliterator {
    protected convertedStr: Pattern;
    protected combinations: Combinations;
    /**
     * チャンク分けのメソッド
     * @param str
     * @param size
     * @returns chunks
     */
    protected splitIntoChunks(str: string, size: number): string[];
    protected abstract generatePatternArray(str: string): Pattern;
    protected abstract generateAllCombinations(patterns: Pattern): Combinations;
    abstract transliterate(str: string): OnePattern | Combinations | null | {
        error: string;
    };
}
//# sourceMappingURL=base-transliterator.d.ts.map