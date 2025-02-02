import { Romanizer, Japanizer } from "jp-transliterator";
import type { Combinations } from "jp-transliterator";

export function useSentence() {
  const getRomanSentence = (str: string): string[][] => {
    const pattern = new Romanizer().transliterate(str);
    if (Array.isArray(pattern)) {
      return combinationsToStringArray(pattern);
    } else if (pattern && "error" in pattern) {
      console.error(pattern.error);
      return [];
    } else {
      console.error("Unexpected null result from transliterate");
      return [];
    }
  };

  const getJapaneseSentence = (str: string): string[][] => {
    const pattern = new Japanizer().transliterate(str);
    if (Array.isArray(pattern)) {
      return pattern;
    } else if (pattern && "error" in pattern) {
      console.error(pattern.error);
      return [];
    } else {
      console.error("Unexpected null result from transliterate");
      return [];
    }
  };

  function combinationsToStringArray(combinations: Combinations): string[][] {
    return combinations.map(([hiragana, romaji]) => [
      hiragana.join(""),
      romaji.join(""),
    ]);
  }

  return {
    getRomanSentence,
    getJapaneseSentence,
  };
}
