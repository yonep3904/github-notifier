import { englishDocs, japaneseDocs } from "./contents";
import type { DocsLocale, DocsPageModel } from "./types";

export class DocsPageModelBuilder {
  createPageModel(baseUrl: string, locale: DocsLocale): DocsPageModel {
    switch (locale) {
      case "en":
        return englishDocs(baseUrl, locale);
      case "ja":
        return japaneseDocs(baseUrl, locale);
      default:
        throw new Error(`Unsupported locale: ${locale}`);
    }
  }
}
