import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./index";

const meta = {
  title: "Components/Button",
  component: Button,
  // tags: ["autodocs"],
  argTypes: {
    children: { control: "text" },
    variant: {
      control: "inline-radio",
      options: ["solid", "outline", "ghost"],
    },
    tone: {
      control: "inline-radio",
      options: ["primary", "critical"],
    },
    size: {
      control: "inline-radio",
      options: ["xs", "sm", "md", "lg"],
    },
    fullWidth: { control: "boolean" },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
    iconOnly: {
      control: "boolean",
      description: "Render a square icon button. Provide aria-label for accessibility.",
    },
    asChild: {
      control: false,
      description: "Use with custom child element (Radix Primitive asChild)",
    },
  },
  args: {
    children: "Button",
    variant: "solid",
    tone: "primary",
    size: "md",
    fullWidth: false,
    loading: false,
    disabled: false,
    iconOnly: false,
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
      <Button {...args} variant="solid">
        Solid
      </Button>
      <Button {...args} variant="outline">
        Outline
      </Button>
      <Button {...args} variant="ghost">
        Ghost
      </Button>
    </div>
  ),
};

export const CriticalTone: Story = {
  args: {
    tone: "critical",
    children: "Delete",
  },
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
      <Button {...args} size="xs">
        X-Small
      </Button>
      <Button {...args} size="sm">
        Small
      </Button>
      <Button {...args} size="md">
        Medium
      </Button>
      <Button {...args} size="lg">
        Large
      </Button>
    </div>
  ),
};

export const IconOnly: Story = {
  args: {
    iconOnly: true,
    size: "md",
    "aria-label": "Add item",
    children: <span aria-hidden>+</span>,
  },
  parameters: {
    docs: {
      description: {
        story: "Set `iconOnly` and provide an `aria-label` for accessible icon buttons.",
      },
      canvas: {
        style: {
          background: "var(--color-containment-surface-fill-default)",
        },
      },
    },
  },
};

export const States: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
      <Button {...args}>Enabled</Button>
      <Button {...args} loading>
        Loading
      </Button>
      <Button {...args} disabled>
        Disabled
      </Button>
    </div>
  ),
};

export const AsLink: Story = {
  render: (args) => (
    <Button {...args} asChild>
      <a href="https://www.radix-ui.com/primitives/docs/utilities/slot" target="_blank" rel="noreferrer">
        Learn more
      </a>
    </Button>
  ),
};
