import type { Meta, StoryObj } from "@storybook/react";
import { Tag } from "./index";

const meta = {
  title: "Components/Tag",
  component: Tag,
  argTypes: {
    children: { control: "text" },
    variant: {
      control: "inline-radio",
      options: ["solid", "outline"],
    },
  },
  args: {
    children: "Label",
    variant: "solid",
  },
} satisfies Meta<typeof Tag>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
      <Tag {...args} variant="solid">Solid</Tag>
      <Tag {...args} variant="outline">Outline</Tag>
    </div>
  ),
};
