const ENTITIES: Record<string, string> = {
  amp: "&",
  copy: "©",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: '"',
  apos: "'",
};

/**
 * Turns a source's attribution into plain text. Attributions are often HTML
 * links, such as `<a href="…">© OpenStreetMap</a>` with a target. Tags are
 * dropped and the link text stays, so a link shows as its text without its
 * target. Common entities are decoded, and runs of whitespace collapse to one
 * space.
 */
export function attributionText(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/gi, (entity, name: string) => {
      if (name[0] === "#") {
        const code =
          name[1] === "x" || name[1] === "X"
            ? parseInt(name.slice(2), 16)
            : parseInt(name.slice(1), 10);
        return code > 0 && code <= 0x10ffff
          ? String.fromCodePoint(code)
          : entity;
      }
      return ENTITIES[name.toLowerCase()] ?? entity;
    })
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * The distinct, non-empty attributions of a style's sources, as plain text, in
 * source order.
 */
export function collectAttributions(
  sources: readonly { readonly attribution: string }[],
): string[] {
  const texts = new Set<string>();
  for (const { attribution } of sources) {
    const text = attributionText(attribution);
    if (text !== "") texts.add(text);
  }
  return [...texts];
}
