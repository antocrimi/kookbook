import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from "./index";

const meta = {
  title: "Components/Checkbox",
  component: Checkbox,
  argTypes: {
    checked: { control: false },
    defaultChecked: { control: "boolean" },
    disabled: { control: "boolean" },
    label: { control: "text" },
    tone: {
      control: "inline-radio",
      options: ["default", "critical"],
    },
  },
  args: {
    tone: "default",
    defaultChecked: false,
    disabled: false,
    label: "Checkbox item",
  },
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Checked: Story = {
  args: {
    checked: true,
  },
};

export const Indeterminate: Story = {
  args: {
    checked: "indeterminate",
  },
};

export const Critical: Story = {
  args: {
    tone: "critical",
    checked: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    checked: true,
  },
};
