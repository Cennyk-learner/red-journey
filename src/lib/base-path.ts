/**
 * GitHub project Pages serves at /<repo>/, so public-folder URLs and
 * raw <a href> paths need this prefix. Empty in local `next dev`.
 * Next.js Link / bundled assets use next.config basePath separately.
 */
export const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(
  /\/$/,
  "",
);

export function withBasePath(path: string): string {
  if (!path) return path;
  if (/^(https?:|data:|blob:|mailto:|#|\/\/)/i.test(path)) return path;
  if (!path.startsWith("/")) return path;
  if (BASE_PATH && (path === BASE_PATH || path.startsWith(`${BASE_PATH}/`))) {
    return path;
  }
  return `${BASE_PATH}${path}`;
}
