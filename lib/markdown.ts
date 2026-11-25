/**
 * Lightweight and safe markdown to HTML parser for blog articles.
 * Converts headings, paragraphs, lists, bold, italics, and blockquotes
 * without pulling in heavy external dependencies.
 */
export function formatMarkdown(text: string): string {
  if (!text) return "";

  // Split into paragraphs / blocks
  const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const blocks = escaped.split(/\n\s*\n/);

  const htmlBlocks = blocks.map((block) => {
    const trimmed = block.trim();
    if (!trimmed) return "";

    // Heading 3: ###
    if (trimmed.startsWith("### ")) {
      return `<h3>${inlineFormat(trimmed.slice(4))}</h3>`;
    }
    // Heading 2: ##
    if (trimmed.startsWith("## ")) {
      return `<h2>${inlineFormat(trimmed.slice(3))}</h2>`;
    }
    // Heading 1: #
    if (trimmed.startsWith("# ")) {
      return `<h1>${inlineFormat(trimmed.slice(2))}</h1>`;
    }

    // Unordered list: starts with - or *
    if (trimmed.split("\n").every((line) => line.trim().startsWith("- ") || line.trim().startsWith("* "))) {
      const items = trimmed
        .split("\n")
        .map((line) => `<li>${inlineFormat(line.trim().replace(/^[-*]\s+/, ""))}</li>`)
        .join("");
      return `<ul>${items}</ul>`;
    }

    // Numbered list: starts with 1. 2. etc
    if (trimmed.split("\n").every((line) => /^\d+\.\s+/.test(line.trim()))) {
      const items = trimmed
        .split("\n")
        .map((line) => `<li>${inlineFormat(line.trim().replace(/^\d+\.\s+/, ""))}</li>`)
        .join("");
      return `<ol>${items}</ol>`;
    }

    // Blockquote
    if (trimmed.startsWith("&gt; ")) {
      const quote = trimmed
        .split("\n")
        .map((l) => l.replace(/^&gt;\s*/, ""))
        .join("<br />");
      return `<blockquote>${inlineFormat(quote)}</blockquote>`;
    }

    // Regular paragraph
    return `<p>${inlineFormat(trimmed.replace(/\n/g, "<br />"))}</p>`;
  });

  return htmlBlocks.filter(Boolean).join("\n");
}

function inlineFormat(str: string): string {
  return str
    // Bold: **text**
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    // Italic: *text*
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    // Inline code: `text`
    .replace(/`(.*?)`/g, "<code>$1</code>")
    // Links: [text](url)
    .replace(/\[(.*?)\]\((.*?)\)/g, (_, label: string, url: string) => {
      if (!/^(https?:\/\/|mailto:|\/(?!\/)|#)/i.test(url) || /[<>\s]/.test(url)) return label;
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`;
    });
}
