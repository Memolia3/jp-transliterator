/**
 * 日本語文字変換のパターンタイプ定義
 */
export type InputPatternMatrix = string[][];
export type PatternSet = [string, string[]];
export type PatternSetArray = PatternSet[];
export interface AllInputPatterns {
    patterns: InputPatternMatrix;
    segmented: InputPatternMatrix;
}
export interface ConversionError {
    error: string;
}
export type ConversionResult = AllInputPatterns | PatternSetArray | ConversionError | null;
//# sourceMappingURL=pattern.types.d.ts.map