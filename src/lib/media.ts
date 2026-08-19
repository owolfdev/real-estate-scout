export function pickCover<T extends { kind: string }>(items: T[]): T | undefined {
  return (
    items.find((item) => item.kind === "gallery") ??
    items.find((item) => item.kind === "sign")
  );
}
