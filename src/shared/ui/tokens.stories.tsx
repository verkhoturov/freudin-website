import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ReactNode } from "react";

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
];

// Примитивы палитры: одинаковы в обеих темах, компоненты берут не их, а семантические токены
const ramps = [
  { name: "violet", note: "Активные элементы, второстепенная кнопка, выбранный элемент" },
  { name: "pink", note: "Главная кнопка, ссылки" },
  { name: "neutral", note: "Бумага (50), чернила (900), рамки и приглушённый текст" },
  { name: "red", note: "Ошибки и удаление" },
];

const rampSteps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

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
      <h2 className="font-semibold text-xl tracking-tight">{title}</h2>
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
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground text-sm">Geist (latin, cyrillic) — --font-sans</p>
      <h1 className="font-semibold text-2xl tracking-tight">Page title — Заголовок страницы</h1>
      <h2 className="font-semibold text-xl tracking-tight">Section title — Заголовок раздела</h2>
      <p className="max-w-prose leading-7">
        Body text. A personal page with your photo, bio, and social links. Основной текст: имена и
        описания пользователей бывают на любом языке.
      </p>
      <p className="text-muted-foreground text-sm">Caption and hints — подписи и подсказки</p>
      <p>
        Inline{" "}
        <a href="https://www.freud.in" className="text-link underline underline-offset-4">
          link in text
        </a>
        .
      </p>
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
