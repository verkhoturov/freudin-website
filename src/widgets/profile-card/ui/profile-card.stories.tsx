import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent, within } from "storybook/test";
import { type PublicProfile, profileSectionIds } from "@/entities/profile";
import { PreferredContactButton } from "./preferred-contact-button";
import { ProfileCard } from "./profile-card";

// Профиль со всеми блоками: так выглядит заполненная страница психолога
const fullProfile: PublicProfile = {
  username: "anna",
  displayName: "Anna Smith",
  bio: "I help adults and couples cope with anxiety, burnout, and relationship difficulties.",
  avatarUrl: null,
  socialLinks: [
    { platform: "instagram", url: "https://www.instagram.com/anna", title: "", highlighted: false },
    // Свой заголовок почти предельной длины: кнопка в одну строку
    {
      platform: "website",
      url: "https://example.com/",
      title: "Articles on anxiety, burnout and stress",
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
  documents: [
    {
      id: "00000000-0000-4000-8000-000000000001",
      url: "/demo-certificate.svg",
      thumbnailUrl: "/demo-certificate.svg",
      title: "Sample certificate",
      width: 1400,
      height: 1000,
    },
  ],
  sectionOrder: [...profileSectionIds],
  practiceStartedOn: "2016-09-01",
  education: [
    { qualification: "MA in Clinical Psychology", institution: "Sample University", year: 2015 },
    { qualification: "CBT practitioner certificate", institution: "Sample Institute", year: null },
  ],
  contacts: {
    email: "hello@example.com",
    phone: "+995 555 12 34 56",
    whatsapp: "+995 555 12 34 56",
    telegram: "https://t.me/telegram",
  },
  preferredContact: "whatsapp",
  faq: [
    {
      question: "What happens in the first session?",
      answer: "We talk about what brings you here and agree on how we’ll work together.",
    },
    { question: "How long is a session?", answer: "50 minutes for individuals, 80 for couples." },
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
      description: "For partners who want to understand each other better.",
      durationMinutes: 80,
      price: { amount: 90, currency: "USD" },
      highlighted: true,
    },
  ],
  highlightedSections: [],
  cover: "classic",
  visibility: "public",
};

// Только обязательное: пустые блоки на странице не показываются
const minimalProfile: PublicProfile = {
  ...fullProfile,
  bio: "",
  socialLinks: [],
  country: null,
  city: null,
  workFormats: [],
  clientTypes: [],
  approaches: [],
  languages: [],
  price: null,
  documents: [],
  practiceStartedOn: null,
  education: [],
  contacts: {},
  preferredContact: null,
  faq: [],
  services: [],
};

const meta = {
  title: "Widgets/Profile card",
  component: ProfileCard,
  args: { profile: fullProfile },
} satisfies Meta<typeof ProfileCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Full: Story = {};

export const Owner: Story = { args: { isOwner: true } };

export const Minimal: Story = { args: { profile: minimalProfile } };

/** Владелец незаполненной страницы: подсказки, что добавить, со ссылками на блоки настроек. */
export const OwnerChecklist: Story = {
  args: { profile: { ...minimalProfile, username: "storybook-owner" }, isOwner: true },
};

/** Превью в редакторе: без Share, Edit и подсказок, имя — не заголовок страницы. */
export const Preview: Story = {
  args: { isPreview: true, isOwner: true },
  decorators: [
    (Story) => (
      <section aria-label="Preview" className="mx-auto max-w-profile rounded-xl border p-4">
        <Story />
      </section>
    ),
  ],
};

/** Выделенные блок, пункт практики, ссылка и карточка услуги. */
export const Highlighted: Story = {
  args: {
    profile: {
      ...fullProfile,
      socialLinks: fullProfile.socialLinks.map((link, index) => ({
        ...link,
        highlighted: index === 0,
      })),
      highlightedSections: ["bio", "price", "contacts"],
    },
  },
};

/** Диалог Share: QR-код страницы. */
export const ShareDialog: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Share" }));
  },
};

// Подпись главной кнопки зависит от выбранного способа связи, у ссылки — ещё и от её заголовка
const preferredContacts = [
  "email",
  "phone",
  "whatsapp",
  "telegram",
  "https://www.instagram.com/anna",
  "https://example.com/",
];

// Сайт без своего заголовка
const untitledWebsiteProfile: PublicProfile = {
  ...fullProfile,
  socialLinks: [
    { platform: "website", url: "https://example.com/", title: "", highlighted: false },
  ],
  preferredContact: "https://example.com/",
};

export const PreferredContact: Story = {
  render: () => (
    <ul className="mx-auto flex max-w-md flex-col gap-3">
      {preferredContacts.map((preferredContact) => (
        <li key={preferredContact}>
          <PreferredContactButton profile={{ ...fullProfile, preferredContact }} />
        </li>
      ))}
      <li>
        <PreferredContactButton profile={untitledWebsiteProfile} />
      </li>
    </ul>
  ),
};
