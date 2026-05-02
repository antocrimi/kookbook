import type { Meta, StoryObj } from "@storybook/react";
import { Avatar } from "./index";

const meta = {
  title: "Components/Avatar",
  component: Avatar,
  argTypes: {
    name: { control: "text" },
    src: { control: "text" },
    size: {
      control: "inline-radio",
      options: ["sm", "md", "lg"],
    },
  },
  args: {
    name: "John Doe",
    src: "https://avatars.githubusercontent.com/u/9919?v=4",
    size: "md",
  },
} satisfies Meta<typeof Avatar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
      <Avatar {...args} size="sm" />
      <Avatar {...args} size="md" />
      <Avatar {...args} size="lg" />
    </div>
  ),
};

export const FallbackInitials: Story = {
  args: {
    src: undefined,
    name: "Ada Lovelace",
  },
};
