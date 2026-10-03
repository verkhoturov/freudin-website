import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { HiddenPageNotice } from "./hidden-page-notice";

// Форме пароля нужен QueryClient для мутации; запросы к API в ките не проходят
function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { mutations: { retry: false } } }),
  );
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

const meta = {
  title: "Views/Hidden page",
  component: HiddenPageNotice,
  decorators: [
    (Story) => (
      <QueryProvider>
        <Story />
      </QueryProvider>
    ),
  ],
  args: { username: "anna", visibility: "private" },
} satisfies Meta<typeof HiddenPageNotice>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Страница скрыта от всех, кроме автора. */
export const Hidden: Story = {};

/** Страница по паролю: после верного пароля сервер ставит cookie и показывает страницу. */
export const Protected: Story = { args: { visibility: "password" } };
