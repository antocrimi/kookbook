import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  Dialog,
  DialogAction,
  DialogActions,
  DialogContent,
  DialogTrigger,
} from "./index";

const DialogStory = ({ defaultOpen = false }: { defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button">Open dialog</button>
      </DialogTrigger>
      <DialogContent
        eyebrow="Eyebrow"
        heading="Title"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit aliquam, purus sit amet luctus venenatis, lectus magna fringilla urna, porttitor rhoncus dolor purus non enim praesent elementum facilisis leo."
      >
        <div style={{ padding: 16, background: "rgba(127, 127, 127, 0.25)", color: "inherit" }}>
          Slot placeholder for custom content.
        </div>
        <DialogActions>
          <DialogAction>Cancel</DialogAction>
          <DialogAction variant="primary">Confirm</DialogAction>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

const DialogExternalControlStory = ({ defaultOpen = false }: { defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Launch dialog from outside
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          eyebrow="Eyebrow"
          heading="Title"
          description="This dialog is controlled by external state and can be launched without a DialogTrigger."
        >
          <DialogActions>
            <DialogAction>Cancel</DialogAction>
            <DialogAction variant="primary">Continue</DialogAction>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </>
  );
};

const meta = {
  title: "Components/Dialog",
  component: DialogStory,
  args: {
    defaultOpen: false,
  },
} satisfies Meta<typeof DialogStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Open: Story = {
  args: {
    defaultOpen: true,
  },
};

export const ExternalControl: Story = {
  render: (args) => <DialogExternalControlStory {...args} />,
};
