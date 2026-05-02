import { BellIcon } from "@radix-ui/react-icons";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Tabs, TabsContent, TabsItem, TabsList } from "./index";

const iconAndTextItems = [
  { value: "tab-1-icon-text", label: "tab-1" },
  { value: "tab-2-icon-text", label: "tab-2" },
  { value: "tab-3-icon-text", label: "tab-3" },
  { value: "tab-4-icon-text", label: "tab-4" },
  { value: "tab-5-icon-text", label: "tab-5" },
] as const;

const IconAndTextOnChangeExample = () => {
  const [selectedTab, setSelectedTab] = useState<(typeof iconAndTextItems)[number]["value"]>(
    "tab-1-icon-text",
  );

  return (
    <Tabs
      defaultValue="tab-1-icon-text"
      value={selectedTab}
      onValueChange={(nextValue: string) =>
        setSelectedTab(nextValue as (typeof iconAndTextItems)[number]["value"])
      }
    >
      <TabsList aria-label="Icon and text tabs">
        {iconAndTextItems.map((item) => (
          <TabsItem key={item.value} value={item.value} icon={<BellIcon />}>
            {item.label}
          </TabsItem>
        ))}
      </TabsList>
      <div style={{ marginTop: "12px" }}>Icon + text tabs content for {selectedTab}</div>
    </Tabs>
  );
};

const meta = {
  title: "Components/Tabs",
  component: Tabs,
  args: {
    defaultValue: "tab-1",
  },
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
      <Tabs {...args} defaultValue="tab-1">
        <TabsList aria-label="Text tabs">
          <TabsItem value="tab-1">tab-1</TabsItem>
          <TabsItem value="tab-2">tab-2</TabsItem>
          <TabsItem value="tab-3">tab-3</TabsItem>
          <TabsItem value="tab-4">tab-4</TabsItem>
          <TabsItem value="tab-5">tab-5</TabsItem>
        </TabsList>
        <TabsContent value="tab-1">Text tabs content for tab-1</TabsContent>
        <TabsContent value="tab-2">Text tabs content for tab-2</TabsContent>
        <TabsContent value="tab-3">Text tabs content for tab-3</TabsContent>
        <TabsContent value="tab-4">Text tabs content for tab-4</TabsContent>
        <TabsContent value="tab-5">Text tabs content for tab-5</TabsContent>
      </Tabs>

      <IconAndTextOnChangeExample />

      <Tabs {...args} defaultValue="tab-1-icon-only">
        <TabsList aria-label="Icon tabs">
          <TabsItem value="tab-1-icon-only" aria-label="tab-1" icon={<BellIcon />} />
          <TabsItem value="tab-2-icon-only" aria-label="tab-2" icon={<BellIcon />} />
          <TabsItem value="tab-3-icon-only" aria-label="tab-3" icon={<BellIcon />} />
          <TabsItem value="tab-4-icon-only" aria-label="tab-4" icon={<BellIcon />} />
          <TabsItem value="tab-5-icon-only" aria-label="tab-5" icon={<BellIcon />} />
        </TabsList>
        <TabsContent value="tab-1-icon-only">Icon-only tabs content for tab-1</TabsContent>
        <TabsContent value="tab-2-icon-only">Icon-only tabs content for tab-2</TabsContent>
        <TabsContent value="tab-3-icon-only">Icon-only tabs content for tab-3</TabsContent>
        <TabsContent value="tab-4-icon-only">Icon-only tabs content for tab-4</TabsContent>
        <TabsContent value="tab-5-icon-only">Icon-only tabs content for tab-5</TabsContent>
      </Tabs>
    </div>
  ),
} satisfies Meta<typeof Tabs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
