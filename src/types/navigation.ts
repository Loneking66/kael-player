import type { MediaItem, MediaSection, SectionedMedia } from "./media";

export type RootStackParamList = {
  Setup: undefined;
  Home: {
    itemsBySection: SectionedMedia;
  };
  Section: {
    itemsBySection: SectionedMedia;
    section: MediaSection;
  };
  TitleDetails: {
    item: MediaItem;
    relatedItems: MediaItem[];
    itemsBySection: SectionedMedia;
  };
  ChannelList: {
    itemsBySection: SectionedMedia;
    initialSection?: MediaSection;
  };
  Player: {
    item: MediaItem;
  };
  SeriesDetails: {
    series: MediaItem;
    relatedItems?: MediaItem[];
    itemsBySection?: SectionedMedia;
  };
  Settings: undefined;
};
