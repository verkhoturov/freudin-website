import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./accordion";

const items = [
  {
    question: "How long is a session?",
    answer: "A session lasts 50 minutes.",
  },
  {
    question: "Do you work online?",
    answer: "Yes, I work online and in person.",
  },
  {
    question: "How do I cancel a session?",
    answer: "Let me know at least 24 hours in advance.",
  },
];

const meta = {
  title: "Components/Accordion",
  component: Accordion,
  args: { type: "multiple" },
  render: (args) => (
    <Accordion {...args} className="max-w-md">
      {items.map((item) => (
        <AccordionItem key={item.question} value={item.question}>
          <AccordionTrigger>{item.question}</AccordionTrigger>
          <AccordionContent>{item.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  ),
} satisfies Meta<typeof Accordion>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Single: Story = { args: { type: "single", collapsible: true } };
