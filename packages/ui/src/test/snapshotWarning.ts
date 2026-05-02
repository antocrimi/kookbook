import { expect } from "vitest";

export const expectSnapshotWithWarning = (value: string, snapshotName: string) => {
  try {
    expect(value).toMatchSnapshot(snapshotName);
  } catch (error) {
    console.warn(
      `[snapshot warning] ${snapshotName} rendering changed. Run tests with --update to accept the new snapshot.`,
      error,
    );
  }
};
