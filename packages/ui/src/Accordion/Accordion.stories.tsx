import type { Meta, StoryObj } from "@storybook/react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./index";

const meta = {
  title: "Components/Accordion",
  component: Accordion,
  args: {
    type: "single",
    collapsible: true,
    defaultValue: "item-1",
    width: "fixed",
    fixedWidth: "360px",
  },
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem value="item-1">
        <AccordionTrigger>What is an Accordion?</AccordionTrigger>
        <AccordionContent>
          Accordion is a vertically stacked set of interactive headings that each reveal an associated section of
          content.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-2">
        <AccordionTrigger>How does this component work?</AccordionTrigger>
        <AccordionContent>
          This component is built on top of the Radix Accordion primitive and styled with design tokens.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-3">
        <AccordionTrigger>Can multiple items be opened?</AccordionTrigger>
        <AccordionContent>Yes, use type=&quot;multiple&quot; to keep more than one item expanded.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
} satisfies Meta<typeof Accordion>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Multiple: Story = {
  args: {
    type: "multiple",
    defaultValue: ["item-1", "item-2"],
  },
};

export const FullWidth: Story = {
  args: {
    width: "fullWidth",
  },
};
