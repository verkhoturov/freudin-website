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
    { platform: "instagram", url: "https://www.instagram.com/anna" },
    { platform: "website", url: "https://example.com/" },
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

/** Диалог Share: QR-код страницы. */
export const ShareDialog: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Share" }));
  },
};

// Подпись главной кнопки зависит от выбранного способа связи
const preferredContacts = [
  "email",
  "phone",
  "whatsapp",
  "telegram",
  "https://www.instagram.com/anna",
  "https://example.com/",
];

export const PreferredContact: Story = {
  render: () => (
    <ul className="mx-auto flex max-w-md flex-col gap-3">
      {preferredContacts.map((preferredContact) => (
        <li key={preferredContact}>
          <PreferredContactButton profile={{ ...fullProfile, preferredContact }} />
        </li>
      ))}
    </ul>
  ),
};
