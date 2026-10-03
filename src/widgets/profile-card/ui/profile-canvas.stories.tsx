import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  coverIds,
  coverLabels,
  type PageTheme,
  type ProfileCover,
  type PublicProfile,
  pageThemeIds,
  pageThemeLabels,
  profileSectionIds,
} from "@/entities/profile";
import { ProfileCanvas } from "./profile-canvas";
import { ProfileCard } from "./profile-card";

// Условный портрет: обложке Hero нужно фото, а настоящее в кит не кладём
const portrait = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d1d4f7"/><stop offset="1" stop-color="#eaccea"/></linearGradient></defs><rect width="512" height="512" fill="url(#g)"/><circle cx="256" cy="210" r="92" fill="#7975d5"/><path d="M96 512c0-96 72-160 160-160s160 64 160 160z" fill="#7975d5"/></svg>',
)}`;

// Всё, что красит пресет: выделенные ссылка и пункт практики, карточка услуги, FAQ
const profile: PublicProfile = {
  username: "anna",
  displayName: "Anna Smith",
  bio: "I help adults and couples cope with anxiety, burnout, and relationship difficulties.",
  avatarUrl: portrait,
  socialLinks: [
    { platform: "instagram", url: "https://www.instagram.com/anna", title: "", highlighted: true },
    {
      platform: "website",
      url: "https://example.com/",
      title: "Articles on anxiety and stress",
      highlighted: false,
    },
  ],
  country: "GE",
  city: { id: 611717, name: "Tbilisi", region: "Tbilisi", countryCode: "GE" },
  workFormats: ["online", "in-person"],
  clientTypes: ["individuals", "couples"],
  approaches: ["cbt", "act"],
  languages: ["en", "ru"],
  price: { amount: 60, currency: "USD" },
  documents: [],
  sectionOrder: [...profileSectionIds],
  practiceStartedOn: "2016-09-01",
  education: [],
  contacts: { email: "hello@example.com", whatsapp: "+995 555 12 34 56" },
  preferredContact: "whatsapp",
  faq: [
    {
      question: "What happens in the first session?",
      answer: "We talk about what brings you here and agree on how we’ll work together.",
    },
  ],
  services: [
    {
      clientType: "individuals",
      title: "Individual session",
      description: "",
      durationMinutes: 50,
      price: { amount: 60, currency: "USD" },
      highlighted: false,
    },
    {
      clientType: "couples",
      title: "Couples session",
      description: "",
      durationMinutes: 80,
      price: { amount: 90, currency: "USD" },
      highlighted: true,
    },
  ],
  highlightedSections: ["price"],
  cover: "classic",
  pageTheme: "classic",
  linkIcons: true,
  ctaPlacement: "inline",
  visibility: "public",
};

// Короткая страница для сводной таблицы: фото, имя, главная кнопка, ссылки и выделение
const compactProfile: PublicProfile = {
  ...profile,
  approaches: [],
  languages: [],
  practiceStartedOn: null,
  contacts: { whatsapp: "+995 555 12 34 56" },
  faq: [],
  services: [],
};

type AppearanceArgs = { theme: PageTheme; cover: ProfileCover; withPhoto: boolean };

const meta = {
  title: "Widgets/Profile appearance",
  parameters: { layout: "fullscreen" },
  argTypes: {
    theme: { control: "inline-radio", options: pageThemeIds },
    cover: { control: "inline-radio", options: coverIds },
  },
  args: { theme: "classic", cover: "classic", withPhoto: true },
  render: ({ theme, cover, withPhoto }) => (
    <ProfileCanvas theme={theme}>
      <ProfileCard profile={{ ...profile, cover, avatarUrl: withPhoto ? portrait : null }} />
    </ProfileCanvas>
  ),
} satisfies Meta<AppearanceArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Все пресеты и обложки рядом. Тема — в тулбаре. */
export const Overview: Story = {
  render: () => (
    <div className="overflow-x-auto">
      {pageThemeIds.map((theme) => (
        <section
          key={theme}
          aria-label={pageThemeLabels[theme]}
          className="grid grid-cols-[repeat(3,minmax(22rem,1fr))]">
          {coverIds.map((cover) => (
            // Фон ячейки — до низа строки, даже если карточка короче соседних
            <div key={cover} className="flex flex-col *:data-page-theme:flex-1">
              <p className="px-4 py-2 text-muted-foreground text-sm">
                {pageThemeLabels[theme]} · {coverLabels[cover]}
              </p>
              <ProfileCanvas theme={theme}>
                <ProfileCard profile={{ ...compactProfile, cover }} isPreview />
              </ProfileCanvas>
            </div>
          ))}
        </section>
      ))}
    </div>
  ),
};

/** Как сейчас: контент прямо на фоне страницы, без карточки. */
export const Classic: Story = {};

export const Paper: Story = { args: { theme: "paper" } };

export const Lavender: Story = { args: { theme: "lavender" } };

export const Orchid: Story = { args: { theme: "orchid" } };

export const Sage: Story = { args: { theme: "sage" } };

export const Sky: Story = { args: { theme: "sky" } };

/** Полоса цвета пресета, фото на её краю. */
export const Banner: Story = { args: { theme: "lavender", cover: "banner" } };

/** Большое фото, имя под ним. */
export const Hero: Story = { args: { theme: "lavender", cover: "hero" } };

/** Hero без фото — как Banner с инициалами. */
export const HeroWithoutPhoto: Story = {
  args: { theme: "lavender", cover: "hero", withPhoto: false },
};
