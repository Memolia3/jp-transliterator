import Convert from "../../utils/convert.utils";

describe("Convert", () => {

  describe("toHalfWidth", () => {
    it("全角英数字を半角に変換する", () => {
      expect(Convert.toHalfWidth("ＡＢＣａｂｃ１２３")).toBe(
        "ABCabc123"
      );
    });

    it("全角記号を半角に変換する", () => {
      expect(Convert.toHalfWidth("！＠＃＄％＾＆＊（）")).toBe(
        "!@#$%^&*()"
      );
    });

    it("特定の全角記号を対応する半角記号に変換する", () => {
      expect(Convert.toHalfWidth("、。・")).toBe(",./");
    });

    it("半角文字はそのまま", () => {
      expect(Convert.toHalfWidth("ABC123!@#")).toBe("ABC123!@#");
    });

    it("混合した文字列を正しく変換する", () => {
      expect(Convert.toHalfWidth("ＡＢＣ123、。・ａｂｃ！＠＃")).toBe(
        "ABC123,./abc!@#"
      );
    });
  });

  describe("toFullWidth", () => {
    it("半角英数字を全角に変換する", () => {
      expect(Convert.toFullWidth("ABCabc123")).toBe(
        "ＡＢＣａｂｃ１２３"
      );
    });

    it("半角記号を全角に変換する", () => {
      expect(Convert.toFullWidth("!@#$%^&*()")).toBe(
        "！＠＃＄％＾＆＊（）"
      );
    });

    it("特定の半角記号を対応する全角記号に変換する", () => {
      expect(Convert.toFullWidth(",./[]")).toBe("、。・「」");
    });

    it("全角文字はそのまま", () => {
      expect(Convert.toFullWidth("ＡＢＣ１２３！＠＃")).toBe(
        "ＡＢＣ１２３！＠＃"
      );
    });

    it("混合した文字列を正しく変換する", () => {
      expect(Convert.toFullWidth("ABC123,./abc!@#")).toBe(
        "ＡＢＣ１２３、。・ａｂｃ！＠＃"
      );
    });
  });
});
