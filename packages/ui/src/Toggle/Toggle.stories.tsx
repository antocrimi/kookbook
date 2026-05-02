import { FontBoldIcon, UnderlineIcon } from "@radix-ui/react-icons";
import type { Meta, StoryObj } from "@storybook/react";
import { Toggle } from "./index";

const meta = {
  title: "Components/Toggle",
  component: Toggle,
  argTypes: {
    pressed: { control: false },
    defaultPressed: { control: "boolean" },
    disabled: { control: "boolean" },
    size: {
      control: "inline-radio",
      options: ["sm", "md", "lg"],
    },
  },
  args: {
    size: "md",
    defaultPressed: false,
    disabled: false,
    "aria-label": "Bold",
    icon: <FontBoldIcon />,
  },
} satisfies Meta<typeof Toggle>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Pressed: Story = {
  args: {
    pressed: true,
  },
};

export const AlternateIcon: Story = {
  args: {
    "aria-label": "Underline",
    icon: <UnderlineIcon />,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
