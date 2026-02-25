export function getCategory(file: string): string {
  const name = file.toLowerCase();

  // Custom keyword rules
  if (name.includes("resume")) return "Career";
  if (name.includes("invoice")) return "Finance";

  // Extension rules based on standard buckets
  if (name.match(/\.(jpg|png|jpeg|gif|webp|svg)$/)) return "Images";
  if (name.match(/\.(mp4|mkv|mov|avi)$/)) return "Videos";
  if (name.match(/\.(pdf|docx|doc|txt|odt|rtf)$/)) return "Documents";

  // Fall back to extension folder directly
  const parts = name.split('.');
  if (parts.length > 1) {
    const ext = parts.pop()!;
    return ext.toUpperCase(); // e.g., 'ZIP', 'CSV'
  }

  return "Others";
}
