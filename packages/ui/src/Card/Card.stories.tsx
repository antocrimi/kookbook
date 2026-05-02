import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "./index";

const meta = {
  title: "Components/Card",
  component: Card,
  tags: ["autodocs"],
  argTypes: {
    title: { control: "text" },
    href: { control: "text" },
    children: { control: "text" },
  },
  args: {
    title: "Documentation",
    href: "https://storybook.js.org/docs",
    children: "Read the docs for this component.",
  },
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CanvasDocs: Story = {
  args: {
    title: "Canvas",
    href: "https://example.com/canvas",
    children: "Open the canvas app guide.",
  },
};
