export function isPreviewMode() {
  return (
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_PREVIEW_MODE === "true"
  );
}
