import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { DisclosureButton } from "./disclosure-button";

const meta = {
  title: "Freudin/Disclosure Button",
  component: DisclosureButton,
  args: { expanded: true, controls: "disclosure-content" },
} satisfies Meta<typeof DisclosureButton>;

export default meta;

type Story = StoryObj<typeof meta>;

function Block({ defaultExpanded }: { defaultExpanded: boolean }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  return (
    <div className="flex max-w-sm flex-col gap-3 rounded-xl border p-3">
      <h3 className="font-medium text-sm">
        <DisclosureButton
          expanded={expanded}
          controls="disclosure-content"
          onClick={() => setExpanded(!expanded)}>
          Approaches
        </DisclosureButton>
      </h3>
      {expanded ? null : (
        <p className="text-muted-foreground text-sm">Cognitive behavioral therapy (CBT), EMDR</p>
      )}
      <div id="disclosure-content" hidden={!expanded} className="text-sm">
        Fields of the block stay in the page while it is collapsed.
      </div>
    </div>
  );
}

/** Блок настроек: заголовок разворачивает и сворачивает его, у свёрнутого видна сводка. */
export const Expanded: Story = { render: () => <Block defaultExpanded /> };

export const Collapsed: Story = { render: () => <Block defaultExpanded={false} /> };
