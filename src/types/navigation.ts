import type { MediaItem, MediaSection, SectionedMedia } from "./media";

export type RootStackParamList = {
  Home: undefined;
  ChannelList: {
    itemsBySection: SectionedMedia;
    initialSection?: MediaSection;
  };
  Player: {
    item: MediaItem;
  };
  SeriesDetails: {
    series: MediaItem;
  };
  Settings: undefined;
};
