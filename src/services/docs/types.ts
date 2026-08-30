export type DocsLocale = "ja" | "en";

export type DocsCodeSample = {
  title: string;
  language: string;
  code: string;
};

export type DocsArticle = {
  title: string;
  paragraphs: string[];
  codeSamples?: DocsCodeSample[];
};

export type DocsBlock =
  | { type: "steps"; items: DocsArticle[] }
  | { type: "cards"; columns?: 1 | 2; items: DocsArticle[] }
  | { type: "table"; label: string; columns: string[]; rows: string[][] }
  | { type: "note"; title: string; body: string; tone: "info" | "warning" };

export type DocsSectionModel = {
  id: string;
  title: string;
  description?: string;
  blocks: DocsBlock[];
};

export type DocsPageModel = {
  locale: DocsLocale;
  title: string;
  introduction: string;
  baseUrlLabel: string;
  baseUrl: string;
  contentsLabel: string;
  statusLinkLabel: string;
  sections: DocsSectionModel[];
};
