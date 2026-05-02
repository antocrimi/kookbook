import { FontBoldIcon, FontItalicIcon, UnderlineIcon } from "@radix-ui/react-icons";
import type { Meta, StoryObj } from "@storybook/react";
import { Toggle } from "../Toggle/index";
import { ToggleGroup } from "./index";

const meta = {
  title: "Components/ToggleGroup",
  component: ToggleGroup,
  argTypes: {
    type: {
      control: "inline-radio",
      options: ["single", "multiple"],
    },
    size: {
      control: "inline-radio",
      options: ["sm", "md", "lg"],
    },
    disabled: { control: "boolean" },
  },
  args: {
    type: "single",
    size: "md",
    defaultValue: "bold",
    "aria-label": "Text formatting",
  },
  render: (args) => (
    <ToggleGroup {...args}>
      <Toggle aria-label="Bold" icon={<FontBoldIcon />} value="bold" />
      <Toggle aria-label="Italic" icon={<FontItalicIcon />} value="italic" />
      <Toggle aria-label="Underline" icon={<UnderlineIcon />} value="underline" />
    </ToggleGroup>
  ),
} satisfies Meta<typeof ToggleGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Single: Story = {};

export const Multiple: Story = {
  args: {
    type: "multiple",
    defaultValue: ["bold", "underline"],
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
