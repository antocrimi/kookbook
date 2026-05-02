import {
  FontBoldIcon,
  FontItalicIcon,
  PlusIcon,
  UnderlineIcon,
} from "@radix-ui/react-icons";
import type { Meta, StoryObj } from "@storybook/react";
import { ButtonTabs, ButtonTabsContent, ButtonTabsItem, ButtonTabsList } from "./index";

const meta = {
  title: "Components/ButtonTabs",
  component: ButtonTabs,
  args: {
    defaultValue: "item-1",
    "aria-label": "Button tabs",
  },
  render: (args) => (
    <ButtonTabs {...args}>
      <ButtonTabsList>
        <ButtonTabsItem value="item-1" icon={<PlusIcon />}>
          Item
        </ButtonTabsItem>
        <ButtonTabsItem value="item-2" icon={<PlusIcon />}>
          Item
        </ButtonTabsItem>
        <ButtonTabsItem value="item-3" icon={<PlusIcon />}>
          Item
        </ButtonTabsItem>
        <ButtonTabsItem value="item-4" icon={<PlusIcon />}>
          Item
        </ButtonTabsItem>
        <ButtonTabsItem value="item-5" icon={<PlusIcon />}>
          Item
        </ButtonTabsItem>
      </ButtonTabsList>
      <ButtonTabsContent value="item-1">Item 1 content</ButtonTabsContent>
      <ButtonTabsContent value="item-2">Item 2 content</ButtonTabsContent>
      <ButtonTabsContent value="item-3">Item 3 content</ButtonTabsContent>
      <ButtonTabsContent value="item-4">Item 4 content</ButtonTabsContent>
      <ButtonTabsContent value="item-5">Item 5 content</ButtonTabsContent>
    </ButtonTabs>
  ),
} satisfies Meta<typeof ButtonTabs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TextOnly: Story = {
  render: (args) => (
    <ButtonTabs {...args} defaultValue="first">
      <ButtonTabsList>
        <ButtonTabsItem value="first">First</ButtonTabsItem>
        <ButtonTabsItem value="second">Second</ButtonTabsItem>
        <ButtonTabsItem value="third">Third</ButtonTabsItem>
      </ButtonTabsList>
      <ButtonTabsContent value="first">First content</ButtonTabsContent>
      <ButtonTabsContent value="second">Second content</ButtonTabsContent>
      <ButtonTabsContent value="third">Third content</ButtonTabsContent>
    </ButtonTabs>
  ),
};

export const IconOnly: Story = {
  render: (args) => (
    <ButtonTabs {...args} defaultValue="bold">
      <ButtonTabsList>
        <ButtonTabsItem value="bold" aria-label="Bold" icon={<FontBoldIcon />} />
        <ButtonTabsItem value="italic" aria-label="Italic" icon={<FontItalicIcon />} />
        <ButtonTabsItem value="underline" aria-label="Underline" icon={<UnderlineIcon />} />
      </ButtonTabsList>
      <ButtonTabsContent value="bold">Bold content</ButtonTabsContent>
      <ButtonTabsContent value="italic">Italic content</ButtonTabsContent>
      <ButtonTabsContent value="underline">Underline content</ButtonTabsContent>
    </ButtonTabs>
  ),
};
