/**
 * Builds the submission PDF from PRODUCT_THINKING.md and docs/submission/details.json,
 * so the answers have a single source and the PDF can be regenerated after edits.
 *
 * Run: yarn docs:pdf   (uses Chrome; set CHROME_PATH if it isn't in the default place)
 */
import { spawnSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const ROOT = new URL('../', import.meta.url);
const TEMPLATE = new URL('docs/submission/template.html', ROOT);
const HTML_OUT = new URL('docs/submission/submission.html', ROOT);
const PDF_OUT = new URL('docs/FOMI-Submission-Muhammad-Amir.pdf', ROOT);
const CHROME =
  process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const MISSING = '<span class="missing">add before sending</span>';

/** @param {string} text */
const escapeHtml = (text) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Inline markdown used in the document: **bold** and `code`. @param {string} text */
const inline = (text) =>
  escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code>$1</code>');

const IMAGE = /^!\[(.*)\]\((.+)\)$/;

/**
 * Paths in the markdown are relative to the repo root; the HTML lives in docs/submission.
 * @param {string} line
 */
function imageToHtml(line) {
  const [, alt, src] = /** @type {RegExpMatchArray} */ (line.match(IMAGE));
  return `<figure><img src="${src.replace(/^docs\//, '../')}" alt="" /><figcaption>${escapeHtml(alt)}</figcaption></figure>`;
}

/**
 * Bullet list with one level of nesting (indented "- " lines belong to the item above).
 * @param {string[]} lines
 */
function listToHtml(lines) {
  /** @type {{ text: string, children: string[] }[]} */
  const items = [];
  for (const line of lines) {
    const text = line.replace(/^\s*- /, '');
    if (/^\s+- /.test(line) && items.length) items[items.length - 1].children.push(text);
    else items.push({ text, children: [] });
  }
  return `<ul>${items
    .map(
      (item) =>
        `<li>${inline(item.text)}${
          item.children.length
            ? `<ul>${item.children.map((child) => `<li>${inline(child)}</li>`).join('')}</ul>`
            : ''
        }</li>`,
    )
    .join('')}</ul>`;
}

/**
 * Converts the small markdown subset PRODUCT_THINKING.md uses (headings, paragraphs,
 * bullet lists, numbered paragraphs, rows of images) — enough to avoid a markdown dependency.
 * @param {string} markdown
 */
function markdownToHtml(markdown) {
  return markdown
    .trim()
    .split(/\n{2,}/)
    .map((block) => {
      const lines = block.split('\n');
      if (block.startsWith('## ')) return `<h2>${inline(block.slice(3))}</h2>`;
      if (lines.every((line) => IMAGE.test(line))) {
        return `<div class="figures">${lines.map(imageToHtml).join('')}</div>`;
      }
      if (block.startsWith('# ')) return `<h1>${inline(block.slice(2))}</h1>`;
      if (lines.every((line) => /^\s*- /.test(line))) return listToHtml(lines);
      const numbered = block.match(/^(\d+)\.\s+([\s\S]*)$/);
      if (numbered) {
        return `<p class="numbered"><span>${numbered[1]}.</span><span>${inline(numbered[2].replace(/\n/g, ' '))}</span></p>`;
      }
      return `<p>${inline(block.replace(/\n/g, ' '))}</p>`;
    })
    .join('\n');
}

/** @param {string} value */
const link = (value) => (value ? `<a href="${value}">${escapeHtml(value)}</a>` : MISSING);

const details = JSON.parse(await readFile(new URL('docs/submission/details.json', ROOT), 'utf8'));
const answers = markdownToHtml(await readFile(new URL('PRODUCT_THINKING.md', ROOT), 'utf8'));
const html = (await readFile(TEMPLATE, 'utf8'))
  .replaceAll('{{name}}', escapeHtml(details.name))
  .replace('{{role}}', escapeHtml(details.role))
  .replace(
    '{{email}}',
    details.email ? `<a href="mailto:${details.email}">${escapeHtml(details.email)}</a>` : MISSING,
  )
  .replace('{{phone}}', details.phone ? escapeHtml(details.phone) : MISSING)
  .replace('{{liveUrl}}', link(details.liveUrl))
  .replace('{{studioUrl}}', link(details.studioUrl))
  .replace('{{repoUrl}}', link(details.repoUrl))
  .replace('{{answers}}', answers);

await writeFile(HTML_OUT, html);

const result = spawnSync(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-pdf-header-footer',
    '--virtual-time-budget=8000',
    `--print-to-pdf=${fileURLToPath(PDF_OUT)}`,
    HTML_OUT.href,
  ],
  { stdio: 'inherit' },
);
if (result.status !== 0) {
  process.stderr.write('Chrome failed to print the PDF. Set CHROME_PATH to your Chrome binary.\n');
  process.exit(1);
}
process.stdout.write(`Wrote ${fileURLToPath(PDF_OUT)}\n`);
