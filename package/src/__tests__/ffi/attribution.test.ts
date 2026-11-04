import { attributionText, collectAttributions } from "@/ffi/attribution";

describe("attributionText", () => {
  test("keeps a link's text and drops its target", () => {
    expect(
      attributionText(
        '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap</a> contributors',
      ),
    ).toBe("© OpenStreetMap contributors");
  });

  test("decodes named and numeric entities", () => {
    expect(attributionText("A &amp; B &#169; C &#xA9; &lt;D&gt;")).toBe(
      "A & B © C © <D>",
    );
  });

  test("leaves an unknown entity as is", () => {
    expect(attributionText("&bogus; x")).toBe("&bogus; x");
  });
});

describe("collectAttributions", () => {
  test("drops empty ones and keeps the first of each text", () => {
    expect(
      collectAttributions([
        { attribution: "<b>B</b>" },
        { attribution: "" },
        { attribution: "<p> </p>" },
        { attribution: "A" },
        { attribution: "B" },
      ]),
    ).toEqual(["B", "A"]);
  });
});
