import { ChevronUpIcon } from "@radix-ui/react-icons";
import type { Meta, StoryObj } from "@storybook/react";
import { Select, SelectItem } from "./index";

const meta = {
  title: "Components/Select",
  component: Select,
  decorators: [
    (Story) => (
      <div style={{ padding: "32px", width: "100%", maxWidth: "760px" }}>
        <Story />
      </div>
    ),
  ],
  args: {
    label: "Framework",
    placeholder: "Select framework",
    defaultValue: "react",
    children: (
      <>
        <SelectItem value="react">React</SelectItem>
        <SelectItem value="vue">Vue</SelectItem>
        <SelectItem value="svelte">Svelte</SelectItem>
      </>
    ),
  },
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Outline: Story = {};

export const Solid: Story = {
  args: {
    variant: "solid",
  },
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
  },
};

export const CustomIcon: Story = {
  args: {
    triggerIcon: <ChevronUpIcon aria-hidden />,
  },
};

export const Error: Story = {
  args: {
    error: true,
    message: "Please select a valid option",
    messageType: "error",
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
  },
};
