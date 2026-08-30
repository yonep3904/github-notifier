import { DocsPageModelBuilder } from "@/services/docs";

describe("DocsPageModelBuilder", () => {
  const builder = new DocsPageModelBuilder();

  it("builds navigation and examples from the same localized sections", () => {
    const model = builder.createPageModel("https://notifier.example", "ja");

    expect(model.locale).toBe("ja");
    expect(model.sections.map(({ id }) => id)).toEqual([
      "overview",
      "deployment",
      "configuration",
      "github-webhook",
      "manual-notification",
      "diagnostics",
    ]);
    expect(JSON.stringify(model)).toContain("https://notifier.example/notify/github");
    expect(JSON.stringify(model)).toContain("https://notifier.example/notify");
  });

  it("provides equivalent English content without changing the document structure", () => {
    const japanese = builder.createPageModel("https://notifier.example", "ja");
    const english = builder.createPageModel("https://notifier.example", "en");

    expect(english.locale).toBe("en");
    expect(english.sections.map(({ id }) => id)).toEqual(japanese.sections.map(({ id }) => id));
    expect(english.sections[0]?.title).toBe("Overview");
  });
});
