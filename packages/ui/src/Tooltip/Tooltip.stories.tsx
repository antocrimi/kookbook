import type { Meta, StoryObj } from "@storybook/react";
import { type CSSProperties, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./index";

const previewFrameStyle = {
  minHeight: "220px",
  minWidth: "320px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  paddingLeft: "120px",
  paddingTop: "72px",
} satisfies CSSProperties;

const meta = {
  title: "Components/Tooltip",
  component: TooltipContent,
  args: {
    side: "top",
    children: "Tooltip content",
  },
  argTypes: {
    side: {
      control: "radio",
      options: ["top", "right", "bottom", "left"],
    },
  },
} satisfies Meta<typeof TooltipContent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div style={previewFrameStyle}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button">Hover me</button>
          </TooltipTrigger>
          <TooltipContent {...args} />
        </Tooltip>
      </TooltipProvider>
    </div>
  ),
};

export const Open: Story = {
  render: (args) => (
    <div style={previewFrameStyle}>
      <TooltipProvider>
        <Tooltip defaultOpen>
          <TooltipTrigger asChild>
            <button type="button">Tooltip trigger</button>
          </TooltipTrigger>
          <TooltipContent {...args} />
        </Tooltip>
      </TooltipProvider>
    </div>
  ),
};

function ControlledTooltipDemo(args: React.ComponentProps<typeof TooltipContent>) {
  const [open, setOpen] = useState(false);

  return (
    <div style={previewFrameStyle}>
      <TooltipProvider>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button type="button" onClick={() => setOpen((current) => !current)}>
            {open ? "Close" : "Open"} tooltip
          </button>
          <Tooltip open={open} onOpenChange={setOpen}>
            <TooltipTrigger asChild>
              <button type="button">Controlled trigger</button>
            </TooltipTrigger>
            <TooltipContent {...args} />
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
}

export const Controlled: Story = {
  render: (args) => <ControlledTooltipDemo {...args} />,
};
