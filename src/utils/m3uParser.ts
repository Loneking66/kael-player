import type { MediaItem, SectionedMedia } from "../types/media";
import { classifyMediaItem } from "./sectionClassifier";

const ATTRIBUTE_PATTERN = /([\w-]+)="([^"]*)"/g;

function createEmptySections(): SectionedMedia {
  return {
    live: [],
    movies: [],
    series: [],
    other: []
  };
}

function parseAttributes(line: string) {
  const attributes: Record<string, string> = {};
  let match: RegExpExecArray | null;

  while ((match = ATTRIBUTE_PATTERN.exec(line)) !== null) {
    attributes[match[1]] = match[2].trim();
  }

  return attributes;
}

function parseName(line: string, attrs: Record<string, string>) {
  const commaIndex = line.indexOf(",");
  const fallback = commaIndex >= 0 ? line.slice(commaIndex + 1).trim() : "";

  return fallback || attrs["tvg-name"] || attrs["tvg-id"] || "Midia sem nome";
}

function makeId(url: string, index: number) {
  return `${index}-${url}`.replace(/[^a-zA-Z0-9]/g, "-").slice(0, 80);
}

export function parseM3uPlaylist(content: string): SectionedMedia {
  const normalized = content.replace(/^\uFEFF/, "").trim();

  if (!normalized.startsWith("#EXTM3U")) {
    throw new Error("Formato de lista nao reconhecido. Verifique se a URL aponta para uma lista M3U/M3U8 valida.");
  }

  if (!normalized.includes("#EXTINF")) {
    throw new Error("Formato invalido. A lista nao possui itens #EXTINF reconheciveis.");
  }

  const sections = createEmptySections();
  const lines = normalized.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  let currentInfo: { name: string; attrs: Record<string, string> } | null = null;
  let itemIndex = 0;

  for (const line of lines) {
    if (line.startsWith("#EXTINF")) {
      const attrs = parseAttributes(line);
      currentInfo = {
        attrs,
        name: parseName(line, attrs)
      };
      continue;
    }

    if (line.startsWith("#")) {
      continue;
    }

    if (!currentInfo) {
      continue;
    }

    const url = line;
    const item: MediaItem = {
      id: makeId(url, itemIndex),
      name: currentInfo.name,
      url,
      groupTitle: currentInfo.attrs["group-title"],
      tvgId: currentInfo.attrs["tvg-id"],
      tvgName: currentInfo.attrs["tvg-name"],
      tvgLogo: currentInfo.attrs["tvg-logo"],
      section: "other"
    };

    item.section = classifyMediaItem(item);
    sections[item.section].push(item);
    currentInfo = null;
    itemIndex += 1;
  }

  const totalItems = Object.values(sections).reduce((sum, items) => sum + items.length, 0);

  if (totalItems === 0) {
    throw new Error("Nenhuma midia foi encontrada na lista adicionada.");
  }

  return sections;
}
