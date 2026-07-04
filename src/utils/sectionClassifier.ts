import type { MediaItem, MediaSection } from "../types/media";

const MOVIE_TERMS = ["movie", "movies", "film", "filme", "filmes", "cinema"];
const SERIES_TERMS = ["series", "serie", "series tv", "temporada", "season", "episode", "episodio", "episodios"];
const LIVE_TERMS = ["live", "ao vivo", "tv", "canal", "canais", "channel", "channels"];

function containsAny(value: string, terms: string[]) {
  return terms.some((term) => value.includes(term));
}

export function classifyMediaItem(input: Pick<MediaItem, "name" | "groupTitle" | "url">): MediaSection {
  const source = `${input.groupTitle ?? ""} ${input.name} ${input.url}`.toLowerCase();

  if (containsAny(source, SERIES_TERMS) || /s\d{1,2}e\d{1,3}/i.test(source)) {
    return "series";
  }

  if (containsAny(source, MOVIE_TERMS)) {
    return "movies";
  }

  if (containsAny(source, LIVE_TERMS)) {
    return "live";
  }

  return "other";
}
