// GIPHY Search API (https://developers.giphy.com/docs/api/endpoint#search).
// Only the search term leaves the device: no profile, health data or identifiers.
// GIPHY's terms require the "Powered by GIPHY" attribution wherever results show.
export interface RetroGif {
  id: string;
  url: string;
  still: string;
  title: string;
  page: string;
  width: number;
  height: number;
}

const key = process.env.EXPO_PUBLIC_GIPHY_API_KEY ?? "";
export const giphyConfigured = key.trim().length > 0;

const cache = new Map<string, RetroGif[]>();

interface GiphyImage {
  url?: string;
  width?: string;
  height?: string;
}
interface GiphyItem {
  id: string;
  title?: string;
  url?: string;
  images?: {
    fixed_height?: GiphyImage;
    fixed_height_still?: GiphyImage;
  };
}

async function search(query: string): Promise<RetroGif[]> {
  const hit = cache.get(query);
  if (hit) return hit;
  const params = new URLSearchParams({
    api_key: key,
    q: query,
    limit: "25",
    rating: "pg-13",
    lang: "en",
  });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);
  try {
    const res = await fetch(`https://api.giphy.com/v1/gifs/search?${params}`, {
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`GIPHY ${res.status}`);
    const body = (await res.json()) as { data?: GiphyItem[] };
    const list = (body.data ?? [])
      .map((g): RetroGif | null => {
        const anim = g.images?.fixed_height;
        const still = g.images?.fixed_height_still;
        if (!anim?.url) return null;
        return {
          id: g.id,
          url: anim.url,
          still: still?.url ?? anim.url,
          title: g.title ?? "",
          page: g.url ?? "https://giphy.com",
          width: Number(anim.width) || 200,
          height: Number(anim.height) || 200,
        };
      })
      .filter((g): g is RetroGif => g !== null);
    cache.set(query, list);
    return list;
  } finally {
    clearTimeout(timeout);
  }
}

/** Random GIF for a query, avoiding the one currently on screen. */
export async function randomGif(
  query: string,
  avoid?: string,
): Promise<RetroGif | null> {
  if (!giphyConfigured) return null;
  const list = (await search(query)).filter((g) => g.id !== avoid);
  if (!list.length) return null;
  return list[Math.floor(Math.random() * list.length)]!;
}
