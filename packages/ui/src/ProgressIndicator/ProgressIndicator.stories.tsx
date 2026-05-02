import type { Meta, StoryObj } from "@storybook/react";
import { ProgressIndicator } from "./index";

const meta = {
  title: "Components/ProgressIndicator",
  component: ProgressIndicator,
  decorators: [
    (Story) => (
      <div style={{ padding: "32px", width: "100%", maxWidth: "760px" }}>
        <Story />
      </div>
    ),
  ],
  args: {
    value: 48,
    max: 100,
  },
} satisfies Meta<typeof ProgressIndicator>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Linear: Story = {};

export const LinearFullWidth: Story = {
  args: {
    size: "fullWidth",
  },
};

export const Circle: Story = {
  args: {
    variant: "circle",
    fixedSize: 96,
  },
};

export const CircleIndeterminate: Story = {
  args: {
    variant: "circle",
    value: undefined,
    fixedSize: 96,
  },
};
