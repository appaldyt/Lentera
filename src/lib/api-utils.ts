export function formatDate(date: Date | null | undefined): string | null {
  if (!date) return null;
  return date.toISOString().split("T")[0];
}

export function parseDate(str: string | null | undefined): Date | null {
  if (!str) return null;
  return new Date(str + "T00:00:00.000Z");
}
