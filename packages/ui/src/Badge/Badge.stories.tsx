import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./index";

const meta = {
  title: "Components/Badge",
  component: Badge,
  argTypes: {
    children: { control: "text" },
    variant: {
      control: "inline-radio",
      options: ["standalone", "appended"],
    },
  },
  args: {
    children: "3",
    variant: "standalone",
  },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
      <Badge {...args} variant="standalone">Standalone</Badge>
      <div
        style={{
          position: "relative",
          width: "32px",
          height: "32px",
          borderRadius: "6px",
          border: "1px solid #999",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px",
        }}
      >
        Icon
        <Badge {...args} variant="appended">9</Badge>
      </div>
    </div>
  ),
};

export const Empty: Story = {
  args: {
    children: "",
  },
  render: (args) => (
    <div style={{ position: "relative", width: "20px", height: "20px" }}>
      <Badge {...args} variant="appended" />
    </div>
  ),
};
