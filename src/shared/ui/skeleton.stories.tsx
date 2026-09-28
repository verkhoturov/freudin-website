import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Skeleton } from "./skeleton";

const meta = {
  title: "Components/Skeleton",
  component: Skeleton,
} satisfies Meta<typeof Skeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Line: Story = { args: { className: "h-4 w-48" } };

// Как скелетон карточки профиля: фото, имя, описание
export const ProfileCard: Story = {
  render: () => (
    <div className="flex max-w-md flex-col items-center gap-4">
      <Skeleton className="size-32 rounded-full" />
      <Skeleton className="h-7 w-48" />
      <div className="flex w-full flex-col gap-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <Skeleton className="h-9 w-full" />
    </div>
  ),
};
