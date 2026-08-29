import type { Child } from "hono/jsx";
import styleUrl from "@/app/style.css?url";

interface LayoutProps {
  children: Child;
  title: string;
  description: string;
}

export function Layout({ children, title, description }: LayoutProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <link rel="stylesheet" href={styleUrl} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
        <meta name="description" content={description} />
      </head>
      <body class="min-h-screen bg-stone-950 text-stone-100 antialiased">
        <div class="pointer-events-none fixed inset-0 overflow-hidden">
          <div class="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_58%)]" />
          <div class="absolute top-24 right-0 h-80 w-80 rounded-full bg-emerald-400/8 blur-3xl" />
          <div class="absolute top-56 left-0 h-80 w-80 rounded-full bg-sky-400/8 blur-3xl" />
        </div>
        <main class="relative mx-auto min-h-screen w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
        <script src="/copy.js" defer></script>
      </body>
    </html>
  );
}
