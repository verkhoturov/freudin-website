import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { getEmptySettingsInput, type ProfileInput } from "@/entities/profile";
import { ProfileForm } from "./profile-form";

// Форма проверяет адрес через TanStack Query. API в ките нет: ошибку запроса форма пропускает
function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false } } }),
  );
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

const emptySettings: ProfileInput = {
  username: "anna",
  displayName: "Anna Smith",
  bio: "",
  socialLinks: [],
  contactEmail: "",
  ...getEmptySettingsInput(),
};

// Отмечены пары и подростки: видны все группы запросов
const filledSettings: ProfileInput = {
  ...emptySettings,
  bio: "I help adults and couples cope with anxiety, burnout, and relationship difficulties.",
  socialLinks: [{ platform: "instagram", url: "https://www.instagram.com/anna" }],
  clientTypes: ["individuals", "couples", "teens"],
  practiceStartedOn: "2016-09-01",
  education: [
    { qualification: "MA in Clinical Psychology", institution: "Sample University", year: "2015" },
  ],
  contacts: {
    email: "hello@example.com",
    phone: "+995 555 12 34 56",
    whatsapp: "+995 555 12 34 56",
    telegram: "https://t.me/telegram",
  },
  preferredContact: "whatsapp",
  birthDate: "1990-05-20",
  gender: "female",
  concerns: ["stress", "burnout", "couple-infidelity", "child-bullying"],
};

const meta = {
  title: "Widgets/Profile form",
  component: ProfileForm,
  decorators: [
    (Story) => (
      <QueryProvider>
        <div className="mx-auto max-w-lg">
          <Story />
        </div>
      </QueryProvider>
    ),
  ],
  args: {
    mode: "edit",
    defaultValues: filledSettings,
    defaultAvatar: { type: "none" },
    accountPhotos: [],
    currentUsername: "anna",
    showPractice: true,
    showSectionOrder: true,
    submitLabel: "Save",
    onSubmit: async () => {},
  },
} satisfies Meta<typeof ProfileForm>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Настройки: блоки стажа, образования и контактов, раздел Search details. */
export const Settings: Story = {};

export const SettingsEmpty: Story = { args: { defaultValues: emptySettings } };
