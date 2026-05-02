import type { Meta, StoryObj } from "@storybook/react";
import { DatePicker } from "./index";

const meta = {
  title: "Components/DatePicker",
  component: DatePicker,
  decorators: [
    (Story) => (
      <div style={{ padding: "32px", width: "100%", maxWidth: "760px" }}>
        <Story />
      </div>
    ),
  ],
  args: {
    label: "Event date",
    name: "event_date",
  },
} satisfies Meta<typeof DatePicker>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Outline: Story = {};

export const Solid: Story = {
  args: { variant: "solid" },
};

export const Ghost: Story = {
  args: { variant: "ghost" },
};

export const Error: Story = {
  args: {
    error: true,
    message: "Please pick a valid date",
    messageType: "error",
  },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "2026-04-14" },
};

export const FullWidth: Story = {
  args: { size: "full" },
};

export const WithMinMax: Story = {
  args: {
    min: "2026-04-14",
    max: "2026-12-31",
    message: "Select a date between Apr 14 and Dec 31, 2026",
    messageType: "info",
  },
};

export const WithDisabledDates: Story = {
  args: {
    disabledDates: [
      { dayOfWeek: [0, 6] },
      new Date(2026, 3, 20),
    ],
    message: "Weekends and Apr 20, 2026 are unavailable",
    messageType: "info",
  },
};
