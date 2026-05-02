import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Banner, type BannerVariant } from "./index";

const BANNER_HEADING = "This is the notification title which states the issue or topic.";
const BANNER_BODY =
  "This is supporting text that instructs the user how to resolve the error that has occured or addresses the topic.";

const BannerStory = ({
  variant,
  heading,
  body,
}: {
  variant: BannerVariant;
  heading: string;
  body: string;
}) => {
  const [open, setOpen] = useState(true);

  return (
    <Banner
      variant={variant}
      open={open}
      onOpenChange={setOpen}
      heading={heading}
      body={body}
    />
  );
};

const meta = {
  title: "Components/Banner",
  component: BannerStory,
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["error", "warning", "info", "success"],
    },
  },
  args: {
    variant: "info",
    heading: BANNER_HEADING,
    body: BANNER_BODY,
  },
} satisfies Meta<typeof BannerStory>;

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

export const NonDismissible: Story = {
  render: (args) => <Banner {...args} dismissible={false} />,
};
