import type { ProfileFaqItem } from "@/entities/profile";

type FaqListProps = {
  faq: ProfileFaqItem[];
  /** В превью страницы заголовок — не заголовок: у превью нет места в структуре страницы. */
  isPreview?: boolean;
};

/** Вопросы и ответы психолога: ответ раскрывается по нажатию и с клавиатуры (`details`). */
export function FaqList({ faq, isPreview = false }: FaqListProps) {
  const Title = isPreview ? "p" : "h2";
  return (
    <section aria-labelledby="profile-faq-title" className="flex w-full flex-col gap-3">
      <Title id="profile-faq-title" className="font-heading text-section-title">
        FAQ
      </Title>
      <div className="flex flex-col divide-y rounded-xl border text-left">
        {faq.map((item, index) => (
          // Вопросы могут повторяться, порядок задаёт владелец
          // biome-ignore lint/suspicious/noArrayIndexKey: список только для чтения
          <details key={index} className="group px-4 py-3">
            <summary className="cursor-pointer rounded-sm font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
              {item.question}
            </summary>
            <p className="mt-2 whitespace-pre-line break-words text-muted-foreground">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
