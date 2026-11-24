/**
 * What a lesson's video address points at. A direct file (MP4, WebM, an upload) plays in the platform's own player,
 * with resume, captions and progress; a YouTube or Vimeo page is shown through the provider's privacy-enhanced
 * embed (no cookie before playback for YouTube, `dnt=1` for Vimeo). Anything else is treated as a file.
 */
export type VideoSource =
  | { kind: "file"; src: string }
  | { kind: "youtube"; id: string; embedUrl: string }
  | { kind: "vimeo"; id: string; embedUrl: string };

const YOUTUBE_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com"]);
const VIMEO_HOSTS = new Set(["vimeo.com", "www.vimeo.com", "player.vimeo.com"]);
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const VIMEO_ID = /^\d{6,12}$/;

function youtubeStart(url: URL): number | null {
  const raw = url.searchParams.get("t") ?? url.searchParams.get("start");
  if (!raw) return null;
  const match = raw.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?$/);
  if (!match) return null;
  const seconds = Number(match[1] ?? 0) * 3600 + Number(match[2] ?? 0) * 60 + Number(match[3] ?? 0);
  return seconds > 0 ? seconds : null;
}

export function parseVideoSource(address: string): VideoSource {
  let url: URL;
  try {
    url = new URL(address);
  } catch {
    return { kind: "file", src: address };
  }
  const host = url.hostname.toLowerCase();

  if (host === "youtu.be" || YOUTUBE_HOSTS.has(host)) {
    let id: string | undefined;
    if (host === "youtu.be") id = url.pathname.slice(1).split("/")[0];
    else if (url.pathname === "/watch") id = url.searchParams.get("v") ?? undefined;
    else {
      const match = url.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?#]+)/);
      id = match?.[1];
    }
    if (id && YOUTUBE_ID.test(id)) {
      const embed = new URL(`https://www.youtube-nocookie.com/embed/${id}`);
      embed.searchParams.set("rel", "0");
      embed.searchParams.set("modestbranding", "1");
      const start = youtubeStart(url);
      if (start) embed.searchParams.set("start", String(start));
      return { kind: "youtube", id, embedUrl: embed.toString() };
    }
  }

  if (VIMEO_HOSTS.has(host)) {
    const parts = url.pathname.split("/").filter(Boolean);
    // vimeo.com/<id>, vimeo.com/<id>/<hash>, player.vimeo.com/video/<id>, vimeo.com/channels/x/<id>
    const id = host === "player.vimeo.com" ? parts[1] : parts.find((part) => VIMEO_ID.test(part));
    if (id && VIMEO_ID.test(id)) {
      const embed = new URL(`https://player.vimeo.com/video/${id}`);
      embed.searchParams.set("dnt", "1");
      // unlisted videos carry a privacy hash: in the path (vimeo.com/<id>/<hash>) or as ?h=
      const hash = url.searchParams.get("h") ?? (host !== "player.vimeo.com" ? parts[parts.indexOf(id) + 1] : undefined);
      if (hash && /^[a-f0-9]{6,}$/i.test(hash)) embed.searchParams.set("h", hash);
      return { kind: "vimeo", id, embedUrl: embed.toString() };
    }
  }

  return { kind: "file", src: address };
}
