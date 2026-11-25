/** Public assets are specified relative to public/, without a repository prefix. */
export function withBase(
  path: string,
  base = import.meta.env.BASE_URL,
): string {
  if (/^(?:https?:\/\/|mailto:|tel:|#)/i.test(path)) return path;
  const prefix = `/${base.split("/").filter(Boolean).join("/")}/`.replace(
    /^\/\/$/,
    "/",
  );
  if (prefix !== "/" && path.startsWith(prefix)) return path;
  return prefix + path.replace(/^\/+/, "");
}
