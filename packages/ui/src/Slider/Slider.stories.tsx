import type { Meta, StoryObj } from "@storybook/react";
import { Slider } from "./index";

const meta = {
  title: "Components/Slider",
  component: Slider,
  decorators: [
    (Story) => (
      <div style={{ padding: "32px", width: "100%", maxWidth: "760px" }}>
        <Story />
      </div>
    ),
  ],
  args: {
    min: 0,
    max: 100,
    step: 1,
    defaultValue: [40],
    "aria-label": "Volume",
  },
} satisfies Meta<typeof Slider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const Range: Story = {
  args: {
    defaultValue: [25, 75],
    "aria-label": "Price range",
  },
};

export const FixedCustomWidth: Story = {
  args: {
    fixedWidth: 480,
    "aria-label": "Custom fixed width",
  },
};

export const FullWidth: Story = {
  args: {
    widthMode: "fullWidth",
    "aria-label": "Full width",
  },
};
