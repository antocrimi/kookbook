import { HeartFilledIcon } from "@radix-ui/react-icons";
import type { Meta, StoryObj } from "@storybook/react";
import { Chip } from "./index";

const meta = {
  title: "Components/Chip",
  component: Chip,
  argTypes: {
    children: { control: "text" },
    variant: {
      control: "inline-radio",
      options: ["ghost", "outline"],
    },
  },
  args: {
    children: "Item",
    variant: "ghost",
    icon: <HeartFilledIcon aria-hidden />,
  },
} satisfies Meta<typeof Chip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
      <Chip {...args} variant="ghost">Ghost</Chip>
      <Chip {...args} variant="outline">Outline</Chip>
    </div>
  ),
};

export const MultipleChips: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
      <Chip {...args} variant="ghost">Item</Chip>
      <Chip {...args} variant="ghost">Item</Chip>
      <Chip {...args} variant="ghost">Item</Chip>
      <Chip {...args} variant="outline">Item</Chip>
      <Chip {...args} variant="outline">Item</Chip>
      <Chip {...args} variant="outline">Item</Chip>
    </div>
  ),
};
