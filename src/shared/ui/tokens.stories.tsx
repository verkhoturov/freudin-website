import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

const meta = {
  title: "Foundations/Tokens",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

// Пары «фон — текст на нём» из src/app/globals.css. Значения берутся из CSS, поэтому видны
// в текущей теме (переключается в тулбаре)
const colorPairs = [
  { name: "background", fg: "foreground", note: "Фон страницы и основной текст" },
  { name: "card", fg: "card-foreground", note: "Карточки" },
  { name: "popover", fg: "popover-foreground", note: "Меню, списки, тосты с информацией" },
  { name: "success", fg: "success-foreground", note: "Тост об успехе" },
  { name: "error", fg: "error-foreground", note: "Тост об ошибке" },
  { name: "cta", fg: "cta-foreground", note: "Главная кнопка" },
  { name: "secondary", fg: "secondary-foreground", note: "Второстепенная кнопка" },
  { name: "primary", fg: "primary-foreground", note: "Активные элементы: чекбоксы, ползунок" },
  { name: "accent", fg: "accent-foreground", note: "Выбранный элемент в меню и списках" },
  { name: "muted", fg: "muted-foreground", note: "Скелетоны, приглушённый текст" },
];

const singleColors = [
  { name: "link", note: "Ссылки в тексте" },
  { name: "destructive", note: "Ошибки и удаление" },
  { name: "border", note: "Рамки" },
  { name: "input", note: "Рамки полей" },
  { name: "ring", note: "Обводка фокуса" },
  { name: "overlay", note: "Затемнение под диалогами" },
  { name: "page-backdrop", note: "Личная страница: фон за карточкой (пресет Classic)" },
  { name: "page-surface", note: "Личная страница: карточка" },
  { name: "page-banner", note: "Личная страница: обложка Banner" },
];

// Примитивы палитры: одинаковы в обеих темах, компоненты берут не их, а семантические токены
const ramps = [
  { name: "violet", note: "Активные элементы, второстепенная кнопка, выбранный элемент" },
  { name: "pink", note: "Главная кнопка, ссылки" },
  { name: "neutral", note: "Бумага (50), чернила (900), рамки и приглушённый текст" },
  { name: "red", note: "Ошибки и удаление" },
  { name: "sage", note: "Пресет личной страницы Sage" },
  { name: "sky", note: "Пресет личной страницы Sky" },
];

const rampSteps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

// Заголовки из раздела «Типографика» в globals.css: один класс на размер, трекинг и насыщенность.
// Классы записаны целиком: Tailwind не находит собранные из частей имена
const headings = [
  { className: "text-page-title", note: "Заголовок страницы (h1)", sample: "Page title" },
  { className: "text-section-title", note: "Заголовок раздела", sample: "Section title" },
  { className: "text-document-title", note: "Заголовок документа", sample: "Privacy Policy" },
  { className: "text-document-heading", note: "Раздел документа", sample: "1. Who we are" },
];

// Ширины колонок из раздела «Размеры и отступы»
const widths = [
  { className: "max-w-site", note: "Шапка, подвал и контент (Container)" },
  { className: "max-w-document", note: "Юридические документы" },
  { className: "max-w-form", note: "Онбординг и настройки" },
  { className: "max-w-profile", note: "Карточка личной страницы" },
  { className: "max-w-sign-in", note: "Вход" },
];

// Все радиусы считаются от --radius
const radii = [
  "rounded-sm",
  "rounded-md",
  "rounded-lg",
  "rounded-xl",
  "rounded-2xl",
  "rounded-3xl",
  "rounded-4xl",
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-heading text-section-title">{title}</h2>
      {children}
    </section>
  );
}

export const Palette: Story = {
  render: () => (
    <div className="flex flex-col gap-10">
      <Section title="Brand ramps">
        <div className="flex flex-col gap-4">
          {ramps.map(({ name, note }) => (
            <div key={name} className="flex flex-col gap-1.5">
              <span className="text-sm">
                <span className="font-medium">{name}</span>{" "}
                <span className="text-muted-foreground">— {note}</span>
              </span>
              <div className="grid grid-cols-11 gap-1">
                {rampSteps.map((step) => (
                  <div key={step} className="flex flex-col gap-1">
                    <div
                      className="h-10 rounded-md border"
                      style={{ background: `var(--${name}-${step})` }}
                    />
                    <span className="text-center text-muted-foreground text-xs">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Background and text">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {colorPairs.map(({ name, fg, note }) => (
            <div
              key={name}
              className="flex h-28 flex-col justify-between rounded-lg border p-3"
              style={{ background: `var(--${name})`, color: `var(--${fg})` }}>
              <span className="font-medium">Aa Бб</span>
              <span className="text-xs">
                --{name} / --{fg}
                <br />
                {note}
              </span>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Other colors">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {singleColors.map(({ name, note }) => (
            <div key={name} className="flex flex-col gap-2">
              <div className="h-16 rounded-lg border" style={{ background: `var(--${name})` }} />
              <span className="text-xs">
                --{name}
                <br />
                <span className="text-muted-foreground">{note}</span>
              </span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  ),
};

export const Typography: Story = {
  render: () => (
    <div className="flex flex-col gap-10">
      <Section title="Headings">
        <p className="text-muted-foreground text-sm">
          Geist (latin, cyrillic) — --font-sans, заголовки — font-heading
        </p>
        {headings.map(({ className, note, sample }) => (
          <div key={className} className="flex flex-col gap-1">
            <span className={cn("font-heading", className)}>{sample} — Заголовок</span>
            <span className="text-muted-foreground text-xs">
              font-heading {className} — {note}
            </span>
          </div>
        ))}
      </Section>
      <Section title="Text">
        <p className="max-w-document text-document">
          text-document — Body text of legal documents. A personal page with your photo, bio, and
          social links. Основной текст: имена и описания пользователей бывают на любом языке.
        </p>
        <p>text-base — Body text, fields</p>
        <p className="text-sm">text-sm — Buttons, labels, hints</p>
        <p className="text-muted-foreground text-sm">Caption and hints — подписи и подсказки</p>
        <p>
          Inline{" "}
          <a href="https://www.freud.in" className="text-link underline underline-offset-4">
            link in text
          </a>{" "}
          and <code>inline_code</code> (--font-mono).
        </p>
      </Section>
    </div>
  ),
};

export const Layout: Story = {
  render: () => (
    <div className="flex flex-col gap-10">
      <Section title="Widths">
        {widths.map(({ className, note }) => (
          <div key={className} className="flex flex-col gap-1">
            <div className={cn("h-6 w-full rounded-md bg-accent", className)} />
            <span className="text-xs">
              {className} — <span className="text-muted-foreground">{note}</span>
            </span>
          </div>
        ))}
      </Section>
      <Section title="Spacing">
        <div className="flex items-end gap-6">
          <div className="flex flex-col gap-1">
            <div className="size-1 bg-primary" />
            <span className="text-xs">
              --spacing — <span className="text-muted-foreground">шаг сетки: p-1, gap-1</span>
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="w-6 bg-primary py-page" />
            <span className="text-xs">
              py-page — <span className="text-muted-foreground">отступ контента страницы</span>
            </span>
          </div>
        </div>
      </Section>
    </div>
  ),
};

export const Radius: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      {radii.map((radius) => (
        <div key={radius} className="flex flex-col items-center gap-2">
          <div className={`size-16 border-2 border-primary bg-accent ${radius}`} />
          <span className="text-xs">{radius}</span>
        </div>
      ))}
    </div>
  ),
};
