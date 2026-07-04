import * as FileSystem from "expo-file-system";

import type { MediaItem, SectionedMedia } from "../types/media";
import { parseM3uPlaylist } from "../utils/m3uParser";

const PLAYLIST_LOAD_TIMEOUT_MS = 90000;
const PLAYLIST_PROGRESS_MESSAGE = "Carregando lista grande, isso pode levar até 90 segundos...";
const PLAYLIST_REQUEST_HEADERS = {
  Accept: "application/x-mpegURL, application/vnd.apple.mpegurl, text/plain, */*",
  "User-Agent": "Mozilla/5.0"
};
const JSON_REQUEST_HEADERS = {
  Accept: "application/json, text/plain, */*",
  "User-Agent": "Mozilla/5.0"
};

interface XtreamCredentials {
  baseUrl: string;
  username: string;
  password: string;
}

interface XtreamCategory {
  category_id?: string | number;
  category_name?: string;
}

interface XtreamStream {
  stream_id?: string | number;
  series_id?: string | number;
  name?: string;
  title?: string;
  category_id?: string | number;
  stream_icon?: string;
  cover?: string;
  container_extension?: string;
}

class PlaylistTimeoutError extends Error {
  constructor(label: string) {
    super(`${label} demorou mais de 90 segundos para responder. Verifique a URL adicionada e tente novamente.`);
    this.name = "PlaylistTimeoutError";
  }
}

class XtreamApiUnavailableError extends Error {
  constructor(message = "Xtream API indisponivel para esta URL.") {
    super(message);
    this.name = "XtreamApiUnavailableError";
  }
}

function createEmptySections(): SectionedMedia {
  return {
    live: [],
    movies: [],
    series: [],
    other: []
  };
}

function assertValidUrl(url: string) {
  try {
    const parsed = new URL(url);

    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error();
    }
  } catch {
    throw new Error("Informe uma URL valida iniciada por http:// ou https://.");
  }
}

function countParsedItems(itemsBySection: SectionedMedia) {
  return Object.values(itemsBySection).reduce((sum, items) => sum + items.length, 0);
}

function validatePlaylistText(text: string) {
  const normalized = text.replace(/^\uFEFF/, "").trimStart();

  if (!normalized.startsWith("#EXTM3U") || !normalized.includes("#EXTINF")) {
    throw new Error("Formato invalido. A resposta nao parece ser uma lista M3U/M3U8 valida.");
  }
}

function toSafeErrorLog(error: unknown) {
  const sanitizeMessage = (message: string) => message.replace(/https?:\/\/\S+/g, (match) => maskUrlForLog(match));

  if (error instanceof Error) {
    return {
      name: error.name,
      message: sanitizeMessage(error.message)
    };
  }

  return { message: sanitizeMessage(String(error)) };
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
    const protectedSegments = new Set(["p", "live", "movie", "series"]);

    for (let index = 0; index < parts.length; index += 1) {
      if (protectedSegments.has(parts[index]) && parts[index + 1] && parts[index + 2]) {
        parts[index + 1] = "***";
        parts[index + 2] = "***";
      }
    }

    parsed.pathname = parts.join("/");
    return parsed.toString();
  } catch {
    return "[url invalida]";
  }
}

async function withTimeout<T>(operation: (controller: AbortController) => Promise<T>, label: string): Promise<T> {
  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      operation(controller),
      new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          console.log(`[Kael Player] ${label} excedeu 90 segundos. Abortando.`);
          controller.abort();
          reject(new PlaylistTimeoutError(label));
        }, PLAYLIST_LOAD_TIMEOUT_MS);
      })
    ]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

function extractXtreamCredentials(url: string): XtreamCredentials | null {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/").filter(Boolean);
    const fileName = parts[parts.length - 1]?.toLowerCase();
    const usernameFromQuery = parsed.searchParams.get("username");
    const passwordFromQuery = parsed.searchParams.get("password");

    if (fileName === "get.php" && usernameFromQuery && passwordFromQuery) {
      console.log("[Kael Player] Xtream API: padrao get.php detectado.");

      return {
        baseUrl: `${parsed.protocol}//${parsed.host}`,
        username: usernameFromQuery,
        password: passwordFromQuery
      };
    }

    if (parts.length < 4 || parts[0] !== "p" || parts[3].toLowerCase() !== "m3u") {
      return null;
    }

    console.log("[Kael Player] Xtream API: padrao alternativo detectado.");

    return {
      baseUrl: `${parsed.protocol}//${parsed.host}`,
      username: decodeURIComponent(parts[1]),
      password: decodeURIComponent(parts[2])
    };
  } catch {
    return null;
  }
}

function buildXtreamApiUrl(credentials: XtreamCredentials, action?: string) {
  const params = new URLSearchParams({
    username: credentials.username,
    password: credentials.password
  });

  if (action) {
    params.set("action", action);
  }

  return `${credentials.baseUrl}/player_api.php?${params.toString()}`;
}

async function fetchJson<T>(url: string, label: string): Promise<T> {
  console.log(`[Kael Player] ${label}: antes da requisicao`);

  const response = await withTimeout(
    (controller) =>
      fetch(url, {
        headers: JSON_REQUEST_HEADERS,
        signal: controller.signal
      }),
    label
  );

  console.log(`[Kael Player] ${label}: depois da requisicao`);
  console.log(`[Kael Player] ${label} status HTTP:`, response.status);
  console.log(`[Kael Player] ${label} content-type:`, response.headers.get("content-type") ?? "nao informado");

  if (!response.ok) {
    throw new Error(`${label} retornou status ${response.status}.`);
  }

  return response.json() as Promise<T>;
}

function mapCategories(categories: XtreamCategory[]) {
  return categories.reduce<Record<string, string>>((acc, category) => {
    if (category.category_id !== undefined && category.category_name) {
      acc[String(category.category_id)] = category.category_name;
    }

    return acc;
  }, {});
}

function makeXtreamItem(
  stream: XtreamStream,
  index: number,
  section: MediaItem["section"],
  groupTitle: string | undefined,
  categoryId: string | undefined,
  url: string
): MediaItem {
  const idSource = stream.stream_id ?? stream.series_id ?? index;
  const name = stream.name ?? stream.title ?? "Midia sem nome";

  return {
    id: `xtream-${section}-${idSource}-${index}`,
    name,
    url,
    groupTitle,
    tvgId: String(idSource),
    tvgName: name,
    tvgLogo: stream.stream_icon ?? stream.cover,
    categoryId,
    categoryName: groupTitle,
    section
  };
}

function getStreamId(stream: XtreamStream) {
  const id = stream.stream_id ?? stream.series_id;
  return id === undefined ? null : String(id);
}

async function loadWithXtreamApi(credentials: XtreamCredentials): Promise<SectionedMedia> {
  console.log("[Kael Player] Xtream API: padrao detectado. Tentando player_api.php.");

  let account: Record<string, unknown>;

  try {
    account = await fetchJson<Record<string, unknown>>(buildXtreamApiUrl(credentials), "Xtream account");
  } catch (error) {
    throw new XtreamApiUnavailableError(error instanceof Error ? error.message : undefined);
  }

  if (!account || typeof account !== "object" || !("user_info" in account)) {
    throw new XtreamApiUnavailableError("player_api.php respondeu, mas nao retornou user_info.");
  }

  if (account.user_info && typeof account.user_info === "object") {
    const userInfo = account.user_info as Record<string, unknown>;

    if (userInfo.auth === 0 || userInfo.status === "Disabled" || userInfo.status === "Banned") {
      throw new Error("Xtream API recusou a URL adicionada.");
    }
  }

  let liveCategories: XtreamCategory[];
  let liveStreams: XtreamStream[];
  let vodCategories: XtreamCategory[];
  let vodStreams: XtreamStream[];
  let seriesCategories: XtreamCategory[];
  let seriesStreams: XtreamStream[];

  try {
    [liveCategories, liveStreams, vodCategories, vodStreams, seriesCategories, seriesStreams] = await Promise.all([
      fetchJson<XtreamCategory[]>(buildXtreamApiUrl(credentials, "get_live_categories"), "Xtream live categories"),
      fetchJson<XtreamStream[]>(buildXtreamApiUrl(credentials, "get_live_streams"), "Xtream live streams"),
      fetchJson<XtreamCategory[]>(buildXtreamApiUrl(credentials, "get_vod_categories"), "Xtream vod categories"),
      fetchJson<XtreamStream[]>(buildXtreamApiUrl(credentials, "get_vod_streams"), "Xtream vod streams"),
      fetchJson<XtreamCategory[]>(buildXtreamApiUrl(credentials, "get_series_categories"), "Xtream series categories"),
      fetchJson<XtreamStream[]>(buildXtreamApiUrl(credentials, "get_series"), "Xtream series")
    ]);
  } catch (error) {
    console.log("[Kael Player] Xtream API existe, mas falhou ao carregar endpoints de midia:", toSafeErrorLog(error));
    throw new Error("A API da lista respondeu, mas nao foi possivel carregar as categorias e midias.");
  }

  const liveCategoryMap = mapCategories(Array.isArray(liveCategories) ? liveCategories : []);
  const vodCategoryMap = mapCategories(Array.isArray(vodCategories) ? vodCategories : []);
  const seriesCategoryMap = mapCategories(Array.isArray(seriesCategories) ? seriesCategories : []);
  const sections = createEmptySections();

  (Array.isArray(liveStreams) ? liveStreams : []).forEach((stream, index) => {
    const streamId = getStreamId(stream);

    if (!streamId) {
      return;
    }

    sections.live.push(
      makeXtreamItem(
        stream,
        index,
        "live",
        stream.category_id === undefined ? "Sem categoria" : liveCategoryMap[String(stream.category_id)] ?? "Sem categoria",
        stream.category_id === undefined ? undefined : String(stream.category_id),
        `${credentials.baseUrl}/live/${encodeURIComponent(credentials.username)}/${encodeURIComponent(credentials.password)}/${streamId}.m3u8`
      )
    );
  });

  (Array.isArray(vodStreams) ? vodStreams : []).forEach((stream, index) => {
    const streamId = getStreamId(stream);

    if (!streamId) {
      return;
    }

    const extension = stream.container_extension || "mp4";
    sections.movies.push(
      makeXtreamItem(
        stream,
        index,
        "movies",
        stream.category_id === undefined ? "Sem categoria" : vodCategoryMap[String(stream.category_id)] ?? "Sem categoria",
        stream.category_id === undefined ? undefined : String(stream.category_id),
        `${credentials.baseUrl}/movie/${encodeURIComponent(credentials.username)}/${encodeURIComponent(credentials.password)}/${streamId}.${extension}`
      )
    );
  });

  (Array.isArray(seriesStreams) ? seriesStreams : []).forEach((stream, index) => {
    const streamId = getStreamId(stream);

    if (!streamId) {
      return;
    }

    sections.series.push(
      makeXtreamItem(
        stream,
        index,
        "series",
        stream.category_id === undefined ? "Sem categoria" : seriesCategoryMap[String(stream.category_id)] ?? "Sem categoria",
        stream.category_id === undefined ? undefined : String(stream.category_id),
        `${credentials.baseUrl}/series/${encodeURIComponent(credentials.username)}/${encodeURIComponent(credentials.password)}/${streamId}.mp4`
      )
    );
  });

  const totalItems = countParsedItems(sections);
  console.log("[Kael Player] Xtream API quantidade de itens carregados:", totalItems);

  if (totalItems === 0) {
    throw new Error("Xtream API respondeu, mas nao retornou itens de midia.");
  }

  return sections;
}

async function loadTextWithFetch(url: string) {
  console.log("[Kael Player] fetch M3U: antes da requisicao");

  const response = await withTimeout(
    (controller) =>
      fetch(url, {
        headers: PLAYLIST_REQUEST_HEADERS,
        signal: controller.signal
      }),
    "fetch M3U"
  );

  console.log("[Kael Player] fetch M3U: depois da requisicao");

  const contentType = response.headers.get("content-type") ?? "nao informado";
  console.log("[Kael Player] status HTTP:", response.status);
  console.log("[Kael Player] content-type:", contentType);

  if (!response.ok) {
    throw new Error(`A lista nao carregou. O servidor retornou status ${response.status}.`);
  }

  console.log("[Kael Player] fetch M3U: antes de ler texto");
  const text = await withTimeout(() => response.text(), "leitura do texto via fetch");
  console.log("[Kael Player] fetch M3U: depois de ler texto");

  return text;
}

async function loadTextWithFileSystem(url: string) {
  const baseCacheDirectory = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;

  if (!baseCacheDirectory) {
    throw new Error("Cache local indisponivel para baixar a lista.");
  }

  const cacheUri = `${baseCacheDirectory}kael-playlist-${Date.now()}.m3u`;
  console.log("[Kael Player] FileSystem fallback: antes do download");

  const downloadResult = await withTimeout(
    () =>
      FileSystem.downloadAsync(url, cacheUri, {
        headers: PLAYLIST_REQUEST_HEADERS
      }),
    "download via FileSystem"
  );

  console.log("[Kael Player] FileSystem fallback: depois do download");
  console.log("[Kael Player] FileSystem fallback status HTTP:", downloadResult.status);

  if (downloadResult.status < 200 || downloadResult.status >= 300) {
    throw new Error(`A lista nao carregou pelo fallback. O servidor retornou status ${downloadResult.status}.`);
  }

  console.log("[Kael Player] FileSystem fallback: antes de ler arquivo");
  const text = await withTimeout(() => FileSystem.readAsStringAsync(downloadResult.uri), "leitura do arquivo baixado");
  console.log("[Kael Player] FileSystem fallback: depois de ler arquivo");

  return text;
}

function parseAndLogPlaylist(text: string): SectionedMedia {
  console.log("[Kael Player] tamanho da resposta M3U:", text.length);

  validatePlaylistText(text);

  const parsed = parseM3uPlaylist(text);
  console.log("[Kael Player] quantidade de itens parseados:", countParsedItems(parsed));

  return parsed;
}

async function loadWithM3uFallbacks(url: string): Promise<SectionedMedia> {
  try {
    const text = await loadTextWithFetch(url);
    return parseAndLogPlaylist(text);
  } catch (fetchError) {
    console.log("[Kael Player] fetch M3U falhou ou travou. Tentando fallback com expo-file-system.", toSafeErrorLog(fetchError));

    try {
      const text = await loadTextWithFileSystem(url);
      return parseAndLogPlaylist(text);
    } catch (fallbackError) {
      console.log("[Kael Player] fallback com expo-file-system falhou:", toSafeErrorLog(fallbackError));

      if (fallbackError instanceof Error) {
        throw fallbackError;
      }

      if (fetchError instanceof Error) {
        throw fetchError;
      }

      throw new Error("Nao foi possivel carregar a lista. Verifique sua conexao e a URL adicionada.");
    }
  }
}

export async function loadPlaylistFromUrl(url: string): Promise<SectionedMedia> {
  const normalizedUrl = url.trim();
  assertValidUrl(normalizedUrl);

  console.log("[Kael Player] URL recebida:", maskUrlForLog(normalizedUrl));
  console.log(`[Kael Player] ${PLAYLIST_PROGRESS_MESSAGE}`);

  const xtreamCredentials = extractXtreamCredentials(normalizedUrl);

  if (xtreamCredentials) {
    try {
      return await loadWithXtreamApi(xtreamCredentials);
    } catch (xtreamError) {
      if (xtreamError instanceof XtreamApiUnavailableError) {
        console.log("[Kael Player] Xtream API nao existe ou esta indisponivel. Voltando para M3U normal.", toSafeErrorLog(xtreamError));
      } else {
        console.log("[Kael Player] Xtream API detectada, evitando download M3U gigante apos falha da API.", toSafeErrorLog(xtreamError));
        throw xtreamError;
      }
    }
  }

  return loadWithM3uFallbacks(normalizedUrl);
}
