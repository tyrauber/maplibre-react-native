import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { preProcessFile } from "typescript";

const SRC = resolve(__dirname, "..");
const FFI_PACKAGE = "@maplibre/native-ffi-react-native";
const EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];

function resolveLocal(from: string, specifier: string): string {
  const base = specifier.startsWith("@/")
    ? join(SRC, specifier.slice(2))
    : resolve(dirname(from), specifier);
  const candidates = [
    base,
    ...EXTENSIONS.map((extension) => base + extension),
    ...EXTENSIONS.map((extension) => join(base, "index" + extension)),
  ];
  const found = candidates.find(
    (candidate) => existsSync(candidate) && statSync(candidate).isFile(),
  );
  if (!found) {
    throw new Error(`Cannot resolve "${specifier}" from ${from}`);
  }
  return found;
}

/**
 * Walks every static import, re-export, `require()` and `import()` reachable
 * from the entry file. Returns the local files reached and the package
 * specifiers they name.
 */
function walk(entry: string) {
  const files = new Set<string>();
  const packages = new Set<string>();
  const pending = [entry];

  while (pending.length > 0) {
    const file = pending.pop()!;
    if (files.has(file)) continue;
    files.add(file);
    if (!EXTENSIONS.some((extension) => file.endsWith(extension))) continue;

    const { importedFiles } = preProcessFile(
      readFileSync(file, "utf8"),
      true,
      true,
    );
    for (const { fileName: specifier } of importedFiles) {
      if (specifier.startsWith(".") || specifier.startsWith("@/")) {
        pending.push(resolveLocal(file, specifier));
      } else {
        packages.add(specifier);
      }
    }
  }

  return {
    files: [...files].map((file) => relative(SRC, file)),
    packages: [...packages],
  };
}

describe("FFI isolation", () => {
  const main = walk(join(SRC, "index.ts"));

  test("the walk covers the main entry", () => {
    expect(main.files).toEqual(
      expect.arrayContaining([
        "components/map/Map.tsx",
        "components/map/engine/MapEngine.ts",
        "components/map/engine/MapEngineProvider.tsx",
        "components/map/engine/MapControllerContext.ts",
      ]),
    );
    expect(main.packages).toEqual(expect.arrayContaining(["react-native"]));
  });

  test("nothing reachable from the main entry imports the ffi module", () => {
    expect(main.files.filter((file) => file.startsWith("ffi"))).toEqual([]);
  });

  test("nothing reachable from the main entry imports the ffi package", () => {
    expect(
      main.packages.filter((specifier) => specifier.startsWith(FFI_PACKAGE)),
    ).toEqual([]);
  });

  test("the walk finds the ffi module from the ffi entry", () => {
    const ffi = walk(join(SRC, "ffi", "index.ts"));

    expect(ffi.files).toEqual(
      expect.arrayContaining([
        "ffi/index.ts",
        "components/map/engine/MapEngine.ts",
      ]),
    );
  });
});
