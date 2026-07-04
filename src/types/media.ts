export type MediaSection = "live" | "movies" | "series" | "other";

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  groupTitle?: string;
  tvgId?: string;
  tvgName?: string;
  tvgLogo?: string;
  categoryId?: string;
  categoryName?: string;
  section: MediaSection;
}

export type SectionedMedia = Record<MediaSection, MediaItem[]>;

export const MEDIA_SECTION_LABELS: Record<MediaSection, string> = {
  live: "Canais",
  movies: "Filmes",
  series: "Series",
  other: "Outros"
};
