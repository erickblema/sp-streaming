const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

type ResolvedManifest = {
  manifest: string;
  sourceUrl: string;
};

export async function fetchStreamResource(
  url: string,
  referer?: string,
  extraHeaders?: Record<string, string>,
  requestHeaders?: Headers,
) {
  const headers: Record<string, string> = {
    "User-Agent": extraHeaders?.["user-agent"] ?? BROWSER_UA,
    Referer: extraHeaders?.referer ?? referer ?? new URL(url).origin,
    Accept: "*/*",
    ...extraHeaders,
  };

  const range = requestHeaders?.get("range");
  if (range) {
    headers.Range = range;
  }

  return fetch(url, {
    headers,
    cache: "no-store",
  });
}

export async function resolveManifestFromUrl(
  startUrl: string,
  extraHeaders?: Record<string, string>,
): Promise<ResolvedManifest | null> {
  let current = startUrl;
  let referer = startUrl;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const response = await fetchStreamResource(current, referer, extraHeaders);

    if (!response.ok) {
      return null;
    }

    const text = (await response.text()).trim();

    if (text.startsWith("#EXTM3U")) {
      return { manifest: text, sourceUrl: current };
    }

    if (text.startsWith("http://") || text.startsWith("https://")) {
      referer = current;
      current = text;
      continue;
    }

    return null;
  }

  return null;
}

export async function resolveManifestFromWrapper(
  wrapperUrl: string,
): Promise<ResolvedManifest | null> {
  return resolveManifestFromUrl(wrapperUrl);
}

export function rewriteManifest(
  manifest: string,
  manifestUrl: string,
): string {
  const baseUrl = manifestUrl.includes("/")
    ? manifestUrl.slice(0, manifestUrl.lastIndexOf("/") + 1)
    : `${manifestUrl}/`;

  return manifest
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        return line;
      }

      const absolute = toAbsoluteUrl(trimmed, baseUrl);
      return `/api/hls/segment?url=${encodeURIComponent(absolute)}`;
    })
    .join("\n");
}

export function toAbsoluteUrl(path: string, baseUrl: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return new URL(path, baseUrl).toString();
}

export function isManifestContent(
  contentType: string | null,
  body: string,
): boolean {
  if (body.startsWith("#EXTM3U")) return true;

  return (
    contentType?.includes("mpegurl") === true ||
    contentType?.includes("vnd.apple.mpegurl") === true
  );
}

export { BROWSER_UA };
