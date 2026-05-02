import type { Meta, StoryObj } from "@storybook/react";
import { RadioSelector, RadioSelectorItem } from "./index";

const meta = {
  title: "Components/RadioSelector",
  component: RadioSelector,
  args: {
    defaultValue: "option-1",
    disabled: false,
    error: false,
  },
} satisfies Meta<typeof RadioSelector>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <RadioSelector {...args} aria-label="Radio selector example">
      <RadioSelectorItem value="option-1" label="Option 1" />
      <RadioSelectorItem value="option-2" label="Option 2" />
      <RadioSelectorItem value="option-3" label="Option 3" />
    </RadioSelector>
  ),
};

export const WithMessages: Story = {
  render: () => (
    <RadioSelector defaultValue="option-1" aria-label="Radio selector with messages">
      <RadioSelectorItem value="option-1" label="Primary" message="Default supporting message" messageType="info" />
      <RadioSelectorItem value="option-2" label="Warning" message="Review this option" messageType="warning" />
      <RadioSelectorItem value="option-3" label="Error" message="Selection is invalid" messageType="error" error />
    </RadioSelector>
  ),
};

export const Disabled: Story = {
  render: () => (
    <RadioSelector defaultValue="option-1" aria-label="Disabled radio selector">
      <RadioSelectorItem value="option-1" label="Enabled option" />
      <RadioSelectorItem value="option-2" label="Disabled option" disabled />
      <RadioSelectorItem value="option-3" label="Disabled with message" disabled message="Unavailable" messageType="info" />
    </RadioSelector>
  ),
};
