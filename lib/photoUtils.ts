import { File, Directory, Paths } from "expo-file-system/next";

export const PHOTO_DIR = new Directory(Paths.document, "photos");

/**
 * Resolves a stored photo value to a displayable file:// URI.
 * Stored values are either:
 *  - A plain filename  e.g. "1234_abc.jpg"  (new format, safe across upgrades)
 *  - A full file:// URI (legacy, may break if container UUID changes)
 */
export function resolvePhotoUri(stored: string): string {
  if (stored.startsWith("file://") || stored.startsWith("/")) {
    return stored; // legacy absolute path — use as-is
  }
  return new File(PHOTO_DIR, stored).uri;
}
