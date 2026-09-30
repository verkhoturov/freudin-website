"use client";

import { ThemeProvider } from "next-themes";
import type { ComponentProps } from "react";
import { siteConfig } from "@/shared/config";
import { ErrorView } from "@/views/error";
import { fontVariables } from "./fonts";
import "./globals.css";

// Заменяет корневой layout, когда упал он сам: свои html и body, тема, но без шапки и данных.
// metadata здесь не работает, поэтому заголовок вкладки — элементом <title>
export default function GlobalError(props: ComponentProps<typeof ErrorView>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${fontVariables} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <title>{`Something went wrong — ${siteConfig.name}`}</title>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <main id="content" className="flex flex-1 flex-col">
            <ErrorView {...props} />
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
