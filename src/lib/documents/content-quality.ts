/** Detect visibly corrupted prose without treating source text as instructions. */
export function documentContentIssue(markdown: string): string | null {
  const paragraphs = markdown
    .replace(/```[\s\S]*?```/g, "")
    .split(/\n\s*\n/)
    .map((block) => block.split("\n").filter((line) => !/^\s*(?:[#>|-]|\d+\.|\|)/.test(line)).join(" ").trim())
    .filter(Boolean);

  for (const paragraph of paragraphs) {
    const words = paragraph.toLowerCase().match(/[a-z][a-z0-9'-]*/g) ?? [];
    if (words.length < 140) continue;

    const sentences = paragraph.split(/[.!?]+(?:\s|$)/).map((part) => part.match(/[a-z][a-z0-9'-]*/gi)?.length ?? 0);
    const longestSentence = Math.max(...sentences);
    const shingles = new Map<string, number>();
    for (let index = 0; index <= words.length - 4; index += 1) {
      const phrase = words.slice(index, index + 4).join(" ");
      shingles.set(phrase, (shingles.get(phrase) ?? 0) + 1);
    }
    const repeatedShare = [...shingles.values()].reduce((total, count) => total + Math.max(0, count - 1), 0) / Math.max(1, words.length - 3);
    if (longestSentence > 165 || repeatedShare > 0.19) {
      return "This report contains a long, repetitive passage that needs repair before it can be shared or exported.";
    }
  }
  return null;
}

export function assertDocumentContentQuality(markdown: string): void {
  const issue = documentContentIssue(markdown);
  if (issue) throw new Error(`${issue} The previous version was preserved. Regenerate it from the saved sources.`);
}
