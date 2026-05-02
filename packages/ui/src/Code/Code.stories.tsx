import type { Meta, StoryObj } from "@storybook/react";
import { Code } from "./index";

const meta = {
  title: "Components/Code",
  component: Code,
  tags: ["autodocs"],
  argTypes: {
    children: { control: "text" },
  },
  args: {
    children: "pnpm --filter @cuckoobook/ui storybook",
  },
} satisfies Meta<typeof Code>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Inline: Story = {};
