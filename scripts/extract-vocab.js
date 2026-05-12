import fs from "fs";
import path from "path";
import kuromoji from "kuromoji";

const ARTICLES_DIR = path.join(process.cwd(), "src/content/articoli");

const blacklist = new Set([
  "これ",
  "それ",
  "あれ",
  "ここ",
  "そこ",
  "ため",
  "よう",
  "こと",
  "もの",
  "する",
  "いる",
  "ある",
  "なる",
  "ない",
  "です",
  "ます",
  "まま",
  "その",
  "この",
  "あの",
  "どの",
  "はは",
]);

function getMdxFiles(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  return files.flatMap((file) => {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory()) return getMdxFiles(fullPath);
    if (file.name.endsWith(".mdx")) return [fullPath];

    return [];
  });
}

function stripFrontmatter(content) {
  return content.replace(/^---[\s\S]*?---/, "");
}

function extractJapaneseText(content) {
  return content.match(/[\u3040-\u30ff\u3400-\u9fff々〆〤ー]+/g)?.join("。") ?? "";
}

function buildTokenizer() {
  return new Promise((resolve, reject) => {
    kuromoji
      .builder({ dicPath: "node_modules/kuromoji/dict" })
      .build((err, tokenizer) => {
        if (err) reject(err);
        else resolve(tokenizer);
      });
  });
}

const tokenizer = await buildTokenizer();
const files = getMdxFiles(ARTICLES_DIR);

for (const file of files) {
  const content = stripFrontmatter(fs.readFileSync(file, "utf8"));
  const japaneseText = extractJapaneseText(content);
  const tokens = tokenizer.tokenize(japaneseText);

  const terms = tokens
    .filter((token) =>
      ["名詞", "動詞", "形容詞", "副詞"].includes(token.pos)
    )
    .map((token) => token.basic_form || token.surface_form)
    .filter((term) => term && term !== "*")
    .filter((term) => term.length > 1)
    .filter((term) => !blacklist.has(term));

  const uniqueTerms = [...new Set(terms)].sort((a, b) =>
    a.localeCompare(b, "ja")
  );

  const vocabData = uniqueTerms.map((term) => {
  const matchingToken = tokens.find(
    (token) =>
      (token.basic_form || token.surface_form) === term
  );

  return {
    term,
    reading: matchingToken?.reading || "",
  };
});

  const parsedPath = path.parse(file);

const outputPath = path.join(
  process.cwd(),
  "src/data/vocab",
  `${parsedPath.name}.vocab.json`
);

  fs.writeFileSync(
    outputPath,
    JSON.stringify(vocabData, null, 2),
    "utf8"
  );

  console.log(`Creato: ${path.relative(process.cwd(), outputPath)}`);
}