import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Pagination } from "./index";

const InteractivePagination = () => {
  const [page, setPage] = useState(5);

  return <Pagination totalPages={10} page={page} onPageChange={setPage} />;
};

const meta = {
  title: "Components/Pagination",
  component: Pagination,
  args: {
    totalPages: 10,
    defaultPage: 5,
  },
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <Pagination {...args} />
      <InteractivePagination />
    </div>
  ),
} satisfies Meta<typeof Pagination>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
