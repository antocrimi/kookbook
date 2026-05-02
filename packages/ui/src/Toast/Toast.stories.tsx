import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button } from "../Button/index";
import {
  Toast,
  ToastProvider,
  ToastViewport,
  type ToastVariant,
} from "./index";

const TOAST_HEADING = "This is the notification title which states the issue or topic.";
const TOAST_BODY = "This is supporting text that gives the user more content that supports the notification.";

const ToastStory = ({
  variant,
  heading,
  body,
  duration,
}: {
  variant: ToastVariant;
  heading: string;
  body: string;
  duration?: number;
}) => {
  const [open, setOpen] = useState(true);

  return (
    <ToastProvider>
      <Toast
        variant={variant}
        open={open}
        duration={duration}
        onOpenChange={setOpen}
        heading={heading}
        body={body}
      />
      <ToastViewport />
    </ToastProvider>
  );
};

const TimeoutDemo = ({
  duration,
  variant,
}: {
  duration?: number;
  variant: ToastVariant;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <ToastProvider>
      <Button
        type="button"
        onClick={() => {
          setOpen(false);
          requestAnimationFrame(() => setOpen(true));
        }}
      >
        Show toast
      </Button>
      <Toast
        variant={variant}
        open={open}
        duration={duration}
        onOpenChange={setOpen}
        heading={TOAST_HEADING}
        body={TOAST_BODY}
      />
      <ToastViewport />
    </ToastProvider>
  );
};

const PersistentToastDemo = ({ variant }: { variant: ToastVariant }) => {
  const [open, setOpen] = useState(false);

  return (
    <ToastProvider>
      <Button
        type="button"
        onClick={() => {
          setOpen(false);
          requestAnimationFrame(() => setOpen(true));
        }}
      >
        Show persistent toast
      </Button>
      <Toast
        variant={variant}
        open={open}
        persistent
        onOpenChange={setOpen}
        heading={TOAST_HEADING}
        body="This toast has timeout disabled and stays until you dismiss it."
      />
      <ToastViewport />
    </ToastProvider>
  );
};

const MultipleToastsDemo = ({ variant }: { variant: ToastVariant }) => {
  const [toasts, setToasts] = useState<number[]>([]);

  return (
    <ToastProvider>
      <Button
        type="button"
        onClick={() => {
          setToasts((current) => [...current, Date.now()]);
        }}
      >
        Add notification
      </Button>

      {toasts.map((toastId, index) => (
        <Toast
          key={toastId}
          variant={variant}
          defaultOpen
          heading={`${TOAST_HEADING} #${index + 1}`}
          body={TOAST_BODY}
          onOpenChange={(open) => {
            if (!open) {
              setToasts((current) => current.filter((id) => id !== toastId));
            }
          }}
        />
      ))}

      <ToastViewport />
    </ToastProvider>
  );
};

const mixedVariants: ToastVariant[] = ["error", "warning", "info", "success"];

const MultipleTypesDemo = () => {
  const [toasts, setToasts] = useState<Array<{ id: number; variant: ToastVariant }>>([]);

  return (
    <ToastProvider>
      <Button
        type="button"
        onClick={() => {
          setToasts((current) => {
            const nextVariant = mixedVariants[current.length % mixedVariants.length] ?? "info";
            return [...current, { id: Date.now() + current.length, variant: nextVariant }];
          });
        }}
      >
        Add mixed notification
      </Button>

      {toasts.map((toast, index) => (
        <Toast
          key={toast.id}
          variant={toast.variant}
          defaultOpen
          heading={`${toast.variant.toUpperCase()} notification #${index + 1}`}
          body={TOAST_BODY}
          onOpenChange={(open) => {
            if (!open) {
              setToasts((current) => current.filter((item) => item.id !== toast.id));
            }
          }}
        />
      ))}

      <ToastViewport />
    </ToastProvider>
  );
};

const meta = {
  title: "Components/Toast",
  component: ToastStory,
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["error", "warning", "info", "success"],
    },
    duration: {
      control: "number",
      description: "Toast timeout in milliseconds. Use 0 to disable auto-dismiss.",
    },
  },
  args: {
    variant: "info",
    heading: TOAST_HEADING,
    body: TOAST_BODY,
    duration: 5000,
  },
} satisfies Meta<typeof ToastStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Error: Story = {
  args: {
    variant: "error",
  },
};

export const Warning: Story = {
  args: {
    variant: "warning",
  },
};

export const Success: Story = {
  args: {
    variant: "success",
  },
};

export const TimeoutControl: Story = {
  render: (args) => <TimeoutDemo duration={args.duration} variant={args.variant} />,
};

export const TimeoutDisabledPersistent: Story = {
  render: (args) => <PersistentToastDemo variant={args.variant} />,
};

export const MultipleNotifications: Story = {
  render: (args) => <MultipleToastsDemo variant={args.variant} />,
};

export const MultipleTypes: Story = {
  render: () => <MultipleTypesDemo />,
};
