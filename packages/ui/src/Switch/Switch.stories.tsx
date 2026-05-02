import type { Meta, StoryObj } from "@storybook/react";
import { Switch } from "./index";

const meta = {
  title: "Components/Switch",
  component: Switch,
  argTypes: {
    checked: { control: false },
    defaultChecked: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    defaultChecked: false,
    disabled: false,
    "aria-label": "Enable notifications",
  },
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Checked: Story = {
  args: {
    checked: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
