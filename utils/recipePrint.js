import { Platform } from "react-native";

// Escape text before putting it into HTML so recipe content can't inject markup.
const esc = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

function recipeHtml(r) {
  const ingredients = (r.ingredients || [])
    .map((item) => `<li>${esc(item)}</li>`)
    .join("");
  const steps = (r.steps || []).map((s) => `<li>${esc(s)}</li>`).join("");

  return `
    <section class="recipe">
      ${r.imageUrl ? `<img src="${esc(r.imageUrl)}" alt="" />` : ""}
      <h1>${esc(r.title)}</h1>
      ${r.authorName ? `<p class="by">By ${esc(r.authorName)}</p>` : ""}
      ${r.comments ? `<div class="notes"><strong>Author's notes</strong><p>${esc(r.comments)}</p></div>` : ""}
      ${ingredients ? `<h2>Ingredients</h2><ul>${ingredients}</ul>` : ""}
      ${steps ? `<h2>Instructions</h2><ol>${steps}</ol>` : ""}
    </section>`;
}

const STYLES = `
  @page { margin: 0.75in; }
  body { font-family: Georgia, "Times New Roman", serif; color: #222; line-height: 1.45; }
  .recipe { page-break-after: always; }
  .recipe:last-of-type { page-break-after: auto; }
  h1 { font-size: 28pt; margin: 12pt 0 2pt; text-align: center; }
  h2 { font-size: 15pt; margin: 18pt 0 6pt; border-bottom: 1px solid #999; padding-bottom: 2pt; }
  .by { text-align: center; color: #666; margin: 0 0 14pt; font-style: italic; }
  img { display: block; width: 100%; max-height: 3in; object-fit: cover; border-radius: 6px; }
  .notes { background: #f3f3f3; border-radius: 6px; padding: 8pt 12pt; margin: 10pt 0; }
  .notes p { margin: 4pt 0 0; }
  ul, ol { padding-left: 22pt; margin: 0; }
  li { margin-bottom: 5pt; break-inside: avoid; }
  .cover { text-align: center; padding-top: 3in; page-break-after: always; }
  .cover h1 { font-size: 40pt; }
  .cover p { color: #666; font-size: 14pt; }
  .toc { page-break-after: always; }
  .toc ol { font-size: 13pt; padding-left: 28pt; }
`;

const coverHtml = (title, subtitle) =>
  `<div class="cover"><h1>${esc(title)}</h1>${subtitle ? `<p>${esc(subtitle)}</p>` : ""}</div>`;

const tocHtml = (recipes) =>
  `<div class="toc"><h1>Contents</h1><ol>${recipes
    .map((r) => `<li>${esc(r.title)}</li>`)
    .join("")}</ol></div>`;

/**
 * Opens a print-friendly page for the given recipes and starts the print
 * dialog, where the user can choose "Save as PDF". Web only.
 * Each recipe: { title, authorName, imageUrl, ingredients[], steps[], comments }
 * Call this directly from a button press so the browser doesn't block the popup.
 */
export function printRecipes(
  recipes,
  { title = "Recipes", cover = false, subtitle = "", toc = false } = {}
) {
  if (Platform.OS !== "web") {
    throw new Error("Saving as PDF is only available in the web version.");
  }

  const win = window.open("", "_blank");

  if (!win) {
    throw new Error(
      "Your browser blocked the new window. Allow pop-ups for this site and try again."
    );
  }

  win.document.open();
  win.document.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${esc(title)}</title>
    <style>${STYLES}</style>
  </head>
  <body>
    ${cover ? coverHtml(title, subtitle) : ""}
    ${toc ? tocHtml(recipes) : ""}
    ${recipes.map(recipeHtml).join("")}
    <script>
      window.addEventListener("load", function () {
        setTimeout(function () { window.print(); }, 300);
      });
    </script>
  </body>
</html>`);
  win.document.close();
}