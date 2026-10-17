"use client";

import { useId, useState } from "react";
import type { ProfileFaqItem } from "@/entities/profile";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";

type FaqListProps = {
  faq: ProfileFaqItem[];
  /** В превью страницы заголовок — не заголовок: у превью нет места в структуре страницы. */
  isPreview?: boolean;
};

/** Вопросы и ответы психолога: ответ раскрывается по нажатию и с клавиатуры. */
export function FaqList({ faq, isPreview = false }: FaqListProps) {
  const id = useId();
  const [open, setOpen] = useState<string[]>([]);
  const Title = isPreview ? "p" : "h2";
  return (
    <section aria-labelledby="profile-faq-title" className="flex w-full flex-col gap-3">
      <Title id="profile-faq-title" className="font-heading text-section-title">
        FAQ
      </Title>
      <Accordion
        type="multiple"
        value={open}
        onValueChange={setOpen}
        className="rounded-xl border text-left">
        {faq.map((item, index) => (
          // Вопросы могут повторяться, порядок задаёт владелец
          // biome-ignore lint/suspicious/noArrayIndexKey: список только для чтения
          <AccordionItem key={index} value={String(index)} className="px-4">
            <AccordionTrigger aria-controls={`${id}-${index}`}>{item.question}</AccordionTrigger>
            <AccordionContent
              forceMount
              id={`${id}-${index}`}
              hidden={!open.includes(String(index))}
              className="h-auto whitespace-pre-line wrap-break-word text-muted-foreground">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
