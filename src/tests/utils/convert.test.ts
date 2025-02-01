import Convert from "../../utils/convert.utils";

describe("Convert", () => {
  let convert: Convert;

  beforeEach(() => {
    convert = new Convert();
  });

  describe("toHalfWidthEnhanced", () => {
    it("全角英数字を半角に変換する", () => {
      expect(convert.toHalfWidthEnhanced("ＡＢＣａｂｃ１２３")).toBe(
        "ABCabc123"
      );
    });

    it("全角記号を半角に変換する", () => {
      expect(convert.toHalfWidthEnhanced("！＠＃＄％＾＆＊（）")).toBe(
        "!@#$%^&*()"
      );
    });

    it("特定の全角記号を対応する半角記号に変換する", () => {
      expect(convert.toHalfWidthEnhanced("、。・")).toBe(",./");
    });

    it("半角文字はそのまま", () => {
      expect(convert.toHalfWidthEnhanced("ABC123!@#")).toBe("ABC123!@#");
    });

    it("混合した文字列を正しく変換する", () => {
      expect(convert.toHalfWidthEnhanced("ＡＢＣ123、。・ａｂｃ！＠＃")).toBe(
        "ABC123,./abc!@#"
      );
    });
  });

  describe("toFullWidthEnhanced", () => {
    it("半角英数字を全角に変換する", () => {
      expect(convert.toFullWidthEnhanced("ABCabc123")).toBe(
        "ＡＢＣａｂｃ１２３"
      );
    });

    it("半角記号を全角に変換する", () => {
      expect(convert.toFullWidthEnhanced("!@#$%^&*()")).toBe(
        "！＠＃＄％＾＆＊（）"
      );
    });

    it("特定の半角記号を対応する全角記号に変換する", () => {
      expect(convert.toFullWidthEnhanced(",./[]")).toBe("、。・「」");
    });

    it("全角文字はそのまま", () => {
      expect(convert.toFullWidthEnhanced("ＡＢＣ１２３！＠＃")).toBe(
        "ＡＢＣ１２３！＠＃"
      );
    });

    it("混合した文字列を正しく変換する", () => {
      expect(convert.toFullWidthEnhanced("ABC123,./abc!@#")).toBe(
        "ＡＢＣ１２３、。・ａｂｃ！＠＃"
      );
    });
  });
});
