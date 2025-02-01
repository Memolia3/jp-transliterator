export type TransliterationTable = {
  [key: string]: string[];
};

export type Combination = [string[], string[]];
export type Combinations = Array<Combination>;
export type Pattern = string[][];
export type OnePattern = string[];

export class Romanizer {
  transliterate(
    str: string,
    chunkSize?: number
  ): Combinations | null | { error: string };
}

export class Japanizer {
  transliterate(
    str: string,
    chunkSize?: number
  ): OnePattern | null | { error: string };
}
