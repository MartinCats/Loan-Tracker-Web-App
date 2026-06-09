export function buildCollectorPath(token: string) {
  return `/collect/${encodeURIComponent(token)}`;
}

export function buildCollectorUrl(origin: string, token: string) {
  return `${origin.replace(/\/$/, "")}${buildCollectorPath(token)}`;
}
