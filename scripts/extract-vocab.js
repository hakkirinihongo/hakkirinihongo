import fs from "fs";
import path from "path";

const ARTICLES_DIR = path.join(process.cwd(), "src/content/articoli");

const japaneseRegex = /[\u3040-\u30ff\u3400-\u9fff々〆〤ー]+/g;

const blacklist = new Set([
  "は",
  "が",
  "を",
  "に",
  "で",
  "と",
  "も",
  "の",
  "へ",
  "や",
  "から",
  "まで",
  "より",
  "です",
  "ます",
  "する",
  "した",
  "して",
  "いる",
  "ある",
  "ない",
  "こと",
  "もの",
]);

function getMdxFiles(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  return files.flatMap((file) => {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory()) {
      return getMdxFiles(fullPath);
    }

    if (file.name.endsWith(".mdx")) {
      return [fullPath];
    }

    return [];
  });
}

function extractJapaneseTerms(content) {
  const matches = content.match(japaneseRegex) ?? [];

  return [...new Set(matches)]
    .map((term) => term.trim())
    .filter((term) => term.length > 1)
    .filter((term) => !blacklist.has(term))
    .sort((a, b) => a.localeCompare(b, "ja"));
}

const files = getMdxFiles(ARTICLES_DIR);

for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  const terms = extractJapaneseTerms(content);

  console.log("\n==============================");
  console.log(path.relative(process.cwd(), file));
  console.log("==============================");

  for (const term of terms) {
    console.log(`- ${term}`);
  }
}