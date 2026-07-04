import type { MediaItem } from "../types/media";

const SERIES_INFO_TIMEOUT_MS = 30000;
const JSON_REQUEST_HEADERS = {
  Accept: "application/json, text/plain, */*",
  "User-Agent": "Mozilla/5.0"
};

interface SeriesCredentials {
  baseUrl: string;
  username: string;
  password: string;
  seriesId: string;
}

interface XtreamEpisode {
  id?: string | number;
  episode_num?: string | number;
  title?: string;
  container_extension?: string;
  info?: {
    movie_image?: string;
    plot?: string;
  };
}

interface XtreamSeriesInfoResponse {
  episodes?: Record<string, XtreamEpisode[]> | XtreamEpisode[];
}

export interface SeriesSeason {
  seasonNumber: string;
  episodes: MediaItem[];
}

class SeriesInfoTimeoutError extends Error {
  constructor() {
    super("A busca de episodios demorou mais de 30 segundos. Tente novamente.");
    this.name = "SeriesInfoTimeoutError";
  }
}

function withTimeout<T>(operation: (controller: AbortController) => Promise<T>): Promise<T> {
  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  return Promise.race([
    operation(controller),
    new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        controller.abort();
        reject(new SeriesInfoTimeoutError());
      }, SERIES_INFO_TIMEOUT_MS);
    })
  ]).finally(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  });
}

function extractSeriesCredentials(url: string): SeriesCredentials {
  const parsed = new URL(url);
  const parts = parsed.pathname.split("/").filter(Boolean);
  const seriesIndex = parts.findIndex((part) => part.toLowerCase() === "series");

  if (seriesIndex < 0 || parts.length <= seriesIndex + 3) {
    throw new Error("Nao foi possivel identificar os dados da serie nesta URL.");
  }

  const rawSeriesId = parts[seriesIndex + 3];
  const seriesId = rawSeriesId.replace(/\.[^/.]+$/, "");

  return {
    baseUrl: `${parsed.protocol}//${parsed.host}`,
    username: decodeURIComponent(parts[seriesIndex + 1]),
    password: decodeURIComponent(parts[seriesIndex + 2]),
    seriesId
  };
}

function buildSeriesInfoUrl(credentials: SeriesCredentials) {
  const params = new URLSearchParams({
    username: credentials.username,
    password: credentials.password,
    action: "get_series_info",
    series_id: credentials.seriesId
  });

  return `${credentials.baseUrl}/player_api.php?${params.toString()}`;
}

function maskUrlForLog(url: string) {
  try {
    const parsed = new URL(url);

    if (parsed.searchParams.has("username")) {
      parsed.searchParams.set("username", "***");
    }

    if (parsed.searchParams.has("password")) {
      parsed.searchParams.set("password", "***");
    }

    const parts = parsed.pathname.split("/");
    const seriesIndex = parts.findIndex((part) => part.toLowerCase() === "series");

    if (seriesIndex >= 0 && parts[seriesIndex + 1] && parts[seriesIndex + 2]) {
      parts[seriesIndex + 1] = "***";
      parts[seriesIndex + 2] = "***";
      parsed.pathname = parts.join("/");
    }

    return parsed.toString();
  } catch {
    return "[url invalida]";
  }
}

function normalizeEpisodes(episodes: XtreamSeriesInfoResponse["episodes"]) {
  if (!episodes) {
    return [];
  }

  if (Array.isArray(episodes)) {
    return [{ seasonNumber: "1", rawEpisodes: episodes }];
  }

  return Object.entries(episodes).map(([seasonNumber, rawEpisodes]) => ({
    seasonNumber,
    rawEpisodes: Array.isArray(rawEpisodes) ? rawEpisodes : []
  }));
}

function makeEpisodeItem(credentials: SeriesCredentials, series: MediaItem, episode: XtreamEpisode, seasonNumber: string, index: number): MediaItem | null {
  if (episode.id === undefined) {
    return null;
  }

  const episodeId = String(episode.id);
  const extension = episode.container_extension || "mp4";
  const episodeNumber = episode.episode_num ? String(episode.episode_num) : String(index + 1);
  const name = episode.title || `${series.name} - Episodio ${episodeNumber}`;

  return {
    id: `episode-${credentials.seriesId}-${seasonNumber}-${episodeId}`,
    name,
    url: `${credentials.baseUrl}/series/${encodeURIComponent(credentials.username)}/${encodeURIComponent(credentials.password)}/${episodeId}.${extension}`,
    groupTitle: `Temporada ${seasonNumber}`,
    tvgId: episodeId,
    tvgName: name,
    tvgLogo: episode.info?.movie_image ?? series.tvgLogo,
    section: "series"
  };
}

export async function loadSeriesSeasons(series: MediaItem): Promise<SeriesSeason[]> {
  const credentials = extractSeriesCredentials(series.url);
  const url = buildSeriesInfoUrl(credentials);

  console.log("[Kael Player] Series info URL:", maskUrlForLog(url));
  console.log("[Kael Player] Series info: antes da requisicao");

  const response = await withTimeout((controller) =>
    fetch(url, {
      headers: JSON_REQUEST_HEADERS,
      signal: controller.signal
    })
  );

  console.log("[Kael Player] Series info: depois da requisicao");
  console.log("[Kael Player] Series info status HTTP:", response.status);
  console.log("[Kael Player] Series info content-type:", response.headers.get("content-type") ?? "nao informado");

  if (!response.ok) {
    throw new Error(`Nao foi possivel carregar episodios. Status ${response.status}.`);
  }

  const json = (await response.json()) as XtreamSeriesInfoResponse;
  const seasons = normalizeEpisodes(json.episodes)
    .map(({ seasonNumber, rawEpisodes }) => ({
      seasonNumber,
      episodes: rawEpisodes
        .map((episode, index) => makeEpisodeItem(credentials, series, episode, seasonNumber, index))
        .filter((episode): episode is MediaItem => Boolean(episode))
    }))
    .filter((season) => season.episodes.length > 0);

  const episodeCount = seasons.reduce((sum, season) => sum + season.episodes.length, 0);
  console.log("[Kael Player] Series info episodios carregados:", episodeCount);

  if (episodeCount === 0) {
    throw new Error("Nenhum episodio foi encontrado para esta serie.");
  }

  return seasons;
}
