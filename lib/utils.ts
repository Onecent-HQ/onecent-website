import { default as Filter } from "bad-words";

const profanityFilter = new Filter();

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function ensureUniqueSlug(
  baseSlug: string,
  existingIds: string[] = []
): Promise<string> {
  // This will be used in API routes with database access
  let slug = baseSlug;
  let counter = 1;

  while (existingIds.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

export function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function sanitizeText(text: string, maxLength: number): string {
  return text.trim().slice(0, maxLength);
}

export function checkProfanity(text: string): boolean {
  return profanityFilter.isProfane(text);
}

export function truncateAddress(address: string, start = 4, end = 4): string {
  if (address.length <= start + end) {
    return address;
  }
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

