import type { Child } from "hono/jsx";
import styleUrl from "@/app/style.css?url";

export interface LayoutProps {
  children: Child;
  title: string;
  description: string;
  lang?: "ja" | "en";
}

export function Layout({ children, title, description, lang = "en" }: LayoutProps) {
  const skipToMainContentText = lang === "en" ? "Skip to main content" : "本文へ移動";

  return (
    <html lang={lang}>
      <head>
        <meta charSet="utf-8" />
        <link rel="stylesheet" href={styleUrl} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
        <meta name="description" content={description} />
      </head>
      <body class="app-background min-h-screen text-stone-100 antialiased">
        <a
          href="#main-content"
          class="sr-only fixed top-4 left-4 z-50 rounded-lg bg-white px-4 py-2 font-medium text-stone-950 focus:not-sr-only"
        >
          {skipToMainContentText}
        </a>
        <main
          id="main-content"
          class="mx-auto min-h-screen w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8"
        >
          {children}
        </main>
      </body>
      <script src="/copy.js" defer></script>
    </html>
  );
}
