import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ComponentProps, useState } from "react";
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
  socialLinks: [
    { platform: "instagram", url: "https://www.instagram.com/anna", title: "" },
    { platform: "website", url: "https://example.com/", title: "Articles on anxiety" },
  ],
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
  faq: [{ question: "What happens in the first session?", answer: "" }],
  services: [
    {
      clientType: "couples",
      title: "Couples session",
      description: "",
      durationMinutes: "80",
      priceAmount: "90",
      priceCurrency: "USD",
      highlighted: true,
    },
  ],
  highlightedSections: ["bio"],
  birthDate: "1990-05-20",
  gender: "female",
  concerns: ["stress", "burnout", "couple-infidelity", "child-bullying"],
};

const meta = {
  title: "Widgets/Profile form",
  component: ProfileForm,
  decorators: [
    // С превью форме нужна ширина сайта: превью встаёт рядом
    (Story, { args }) => (
      <QueryProvider>
        <div className={args.renderPreview ? "mx-auto max-w-site" : "mx-auto max-w-lg"}>
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

/** Настройки, раздел Public profile: конструктор страницы. */
export const Settings: Story = { args: { section: "profile" } };

export const SettingsEmpty: Story = { args: { defaultValues: emptySettings, section: "profile" } };

/**
 * Раздел Account: адрес страницы и контактная почта. Способы входа, выход и удаление на странице
 * приходят слотом `accountBlock`.
 */
export const AccountSection: Story = {
  args: {
    section: "account",
    showContactEmail: true,
    accountBlock: <p className="text-muted-foreground text-sm">Sign-in methods, Sign out…</p>,
  },
};

/** Раздел Search details: закрытые данные для поиска. */
export const SearchDetailsSection: Story = { args: { section: "search" } };

// Свёрнутые блоки хранит страница: здесь — состояние истории
function CollapsibleForm(props: ComponentProps<typeof ProfileForm>) {
  const [collapsed, setCollapsed] = useState<string[]>(["bio", "approaches"]);
  return (
    <ProfileForm
      {...props}
      collapsedBlocks={collapsed}
      onCollapsedChange={(blockId, isCollapsed) =>
        setCollapsed((current) =>
          isCollapsed ? [...current, blockId] : current.filter((id) => id !== blockId),
        )
      }
      documentsSummary="1 document"
    />
  );
}

/** Свёрнутые блоки: заголовок разворачивает блок, у свёрнутого видна сводка. */
export const SettingsCollapsed: Story = {
  args: { section: "profile" },
  render: (args) => <CollapsibleForm {...args} />,
};

/**
 * Превью страницы: на широком экране — рядом с формой, на телефоне — по кнопке Preview
 * в панели Save. В настройках и онбординге на месте заглушки — карточка `ProfileCard`.
 */
export const WithPreview: Story = {
  args: {
    section: "profile",
    renderPreview: (profile) => (
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="font-heading text-page-title">{profile.displayName}</p>
        <p className="text-muted-foreground text-sm">@{profile.username}</p>
        <p className="whitespace-pre-line">{profile.bio}</p>
      </div>
    ),
  },
};

/**
 * Редактор на весь экран, как в настройках: колонка формы фиксированной ширины и холст превью
 * на остальную ширину (фон холста задаёт страница), заголовок раздела — слотом `header`.
 */
export const Workspace: Story = {
  args: {
    ...WithPreview.args,
    layout: "workspace",
    header: <h1 className="font-heading text-page-title">Public profile</h1>,
  },
  decorators: [
    (Story) => (
      <div className="bg-muted">
        <Story />
      </div>
    ),
  ],
};
