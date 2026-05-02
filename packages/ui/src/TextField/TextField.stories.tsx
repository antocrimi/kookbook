import type { Meta, StoryObj } from "@storybook/react";
import { TextField } from "./index";

const meta = {
  title: "Components/TextField",
  component: TextField,
  argTypes: {
    variant: { control: "radio", options: ["solid", "outline", "exposed"] },
    messageType: { control: "radio", options: ["error", "warning", "info"] },
    disabled: { control: "boolean" },
    error: { control: "boolean" },
    size: { control: "radio", options: ["fixed", "full"] },
    fixedWidth: { control: "text" },
  },
  args: {
    label: "Label",
    placeholder: "Input text",
    variant: "outline",
    disabled: false,
    error: false,
    size: "fixed",
    fixedWidth: 360,
  },
} satisfies Meta<typeof TextField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Filled: Story = {
  args: {
    defaultValue: "Input text",
  },
};

export const Error: Story = {
  args: {
    defaultValue: "Input text",
    error: true,
    messageType: "error",
    message: "[Notification message]",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};


export const FullWidth: Story = {
  args: {
    size: "full",
    defaultValue: "Input text",
  },
};

export const FixedCustomWidth: Story = {
  args: {
    size: "fixed",
    fixedWidth: "420px",
    defaultValue: "Input text",
  },
};
