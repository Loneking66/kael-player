import { ResizeMode, Video, type AVPlaybackStatus } from "expo-av";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ErrorMessage } from "../components/ErrorMessage";
import { LegalNotice } from "../components/LegalNotice";
import type { MediaItem } from "../types/media";
import type { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Player">;

interface PlayerSourceInfo {
  primaryUrl: string;
  fallbackUrl?: string;
  technicalHint: string;
}

function replaceExtension(url: string, extension: string) {
  const [withoutHash, hash = ""] = url.split("#");
  const [withoutQuery, query = ""] = withoutHash.split("?");
  const normalizedPath = withoutQuery.replace(/\.[^/.]+$/, "");
  const querySuffix = query ? `?${query}` : "";
  const hashSuffix = hash ? `#${hash}` : "";

  return `${normalizedPath}.${extension}${querySuffix}${hashSuffix}`;
}

function maskStreamUrlForLog(url: string) {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/");
    const protectedSegments = new Set(["live", "movie", "series"]);

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

function sanitizeLogText(value: string) {
  return value.replace(/https?:\/\/\S+/g, (match) => maskStreamUrlForLog(match));
}

function resolvePlayerSource(item: MediaItem): PlayerSourceInfo {
  const streamUrl = item.url.trim();
  const lowerUrl = streamUrl.toLowerCase();
  const isXtreamLive = /\/live\/[^/]+\/[^/]+\/[^/?#]+/i.test(streamUrl);
  const isXtreamMovie = /\/movie\/[^/]+\/[^/]+\/[^/?#]+/i.test(streamUrl);
  const isXtreamSeries = /\/series\/[^/]+\/[^/]+\/[^/?#]+/i.test(streamUrl);

  if (item.section === "live" && isXtreamLive) {
    const fallbackExtension = lowerUrl.includes(".m3u8") ? "ts" : "m3u8";
    const fallbackUrl = replaceExtension(streamUrl, fallbackExtension);

    return {
      primaryUrl: streamUrl,
      fallbackUrl: fallbackUrl !== streamUrl ? fallbackUrl : undefined,
      technicalHint: "Xtream live detectado. Tentando URL original primeiro e fallback alternativo se necessario."
    };
  }

  if (item.section === "movies" && isXtreamMovie) {
    return {
      primaryUrl: streamUrl,
      technicalHint: "Xtream movie detectado. URL esperada: /movie/USERNAME/PASSWORD/STREAM_ID.ext"
    };
  }

  if (item.section === "series" && isXtreamSeries) {
    return {
      primaryUrl: streamUrl,
      technicalHint: "Xtream series detectado. URL esperada: /series/USERNAME/PASSWORD/EPISODE_ID.ext"
    };
  }

  if (lowerUrl.endsWith(".ts")) {
    return {
      primaryUrl: streamUrl,
      fallbackUrl: replaceExtension(streamUrl, "m3u8"),
      technicalHint: "Stream MPEGTS detectado. Se o dispositivo recusar .ts, o player tentara .m3u8."
    };
  }

  return {
    primaryUrl: streamUrl,
    technicalHint: "URL de midia recebida da lista do usuario."
  };
}

export function PlayerScreen({ route }: Props) {
  const videoRef = useRef<Video>(null);
  const liveLoadedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeUrl, setActiveUrl] = useState("");
  const [hasTriedFallback, setHasTriedFallback] = useState(false);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(true);
  const { item } = route.params;

  const sourceInfo = useMemo(() => resolvePlayerSource(item), [item]);
  const isLiveStream = item.section === "live" || /\/live\/[^/]+\/[^/]+\/[^/?#]+/i.test(activeUrl);

  function clearLoadingTimer() {
    if (liveLoadedTimerRef.current) {
      clearTimeout(liveLoadedTimerRef.current);
      liveLoadedTimerRef.current = null;
    }
  }

  function startLoadingGraceTimer() {
    clearLoadingTimer();
    liveLoadedTimerRef.current = setTimeout(() => {
      setShowLoadingOverlay(false);
      liveLoadedTimerRef.current = null;
    }, 3000);
  }

  useEffect(() => {
    clearLoadingTimer();

    setActiveUrl(sourceInfo.primaryUrl);
    setHasTriedFallback(false);
    setError(null);
    setShowLoadingOverlay(true);

    if (item.section === "live") {
      startLoadingGraceTimer();
    }

    console.log("[Kael Player] Player item:", {
      id: item.id,
      name: item.name,
      section: item.section
    });
    console.log("[Kael Player] Player hint:", sourceInfo.technicalHint);
    console.log("[Kael Player] Player URL final:", maskStreamUrlForLog(sourceInfo.primaryUrl));

    if (sourceInfo.fallbackUrl) {
      console.log("[Kael Player] Player URL fallback:", maskStreamUrlForLog(sourceInfo.fallbackUrl));
    }

    return () => {
      clearLoadingTimer();
    };
  }, [item, sourceInfo]);

  function handlePlaybackStatusUpdate(status: AVPlaybackStatus) {
    if (!status.isLoaded) {
      if (status.error) {
        console.log("[Kael Player] Player status error:", sanitizeLogText(status.error));
      }

      return;
    }

    if (status.isPlaying || !status.isBuffering) {
      setShowLoadingOverlay(false);
      clearLoadingTimer();
      return;
    }
  }

  function handlePlayerError(nativeError: string) {
    clearLoadingTimer();

    console.log("[Kael Player] Player onError:", {
      error: sanitizeLogText(nativeError),
      activeUrl: maskStreamUrlForLog(activeUrl),
      section: item.section,
      hasFallback: Boolean(sourceInfo.fallbackUrl)
    });

    if (sourceInfo.fallbackUrl && !hasTriedFallback) {
      console.log("[Kael Player] Player tentando URL fallback:", maskStreamUrlForLog(sourceInfo.fallbackUrl));
      setHasTriedFallback(true);
      setActiveUrl(sourceInfo.fallbackUrl);
      setError(null);
      setShowLoadingOverlay(true);
      if (isLiveStream) {
        startLoadingGraceTimer();
      }
      return;
    }

    setError("O stream não pôde ser reproduzido. Verifique se a URL adicionada está acessível e em um formato compatível.");
  }

  async function handleReplay() {
    setError(null);
    setShowLoadingOverlay(true);
    if (isLiveStream) {
      startLoadingGraceTimer();
    }
    await videoRef.current?.replayAsync();
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      <View style={styles.playerFrame}>
        {showLoadingOverlay ? (
          <View pointerEvents="none" style={styles.loadingOverlay}>
            <ActivityIndicator color="#FFFFFF" />
            <Text style={styles.loadingText}>Carregando mídia...</Text>
          </View>
        ) : null}

        {activeUrl ? (
          <Video
            key={activeUrl}
            ref={videoRef}
            source={{ uri: activeUrl }}
            style={styles.video}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay
            progressUpdateIntervalMillis={3000}
            onError={handlePlayerError}
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          />
        ) : null}
      </View>

      <View style={styles.details}>
        <Text numberOfLines={2} style={styles.title}>{item.name}</Text>
        <Text numberOfLines={1} style={styles.meta}>{item.groupTitle || "Sem categoria"}</Text>

        <View style={styles.actions}>
          <Pressable accessibilityRole="button" onPress={handleReplay} style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}>
            <Text style={styles.actionButtonText}>Reiniciar</Text>
          </Pressable>
        </View>

        {error ? <ErrorMessage message={error} /> : null}
        <LegalNotice />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#111827",
    flex: 1
  },
  playerFrame: {
    aspectRatio: 16 / 9,
    backgroundColor: "#000000",
    width: "100%"
  },
  video: {
    height: "100%",
    width: "100%"
  },
  loadingOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(17, 24, 39, 0.82)",
    borderRadius: 8,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 36,
    paddingHorizontal: 10,
    position: "absolute",
    right: 12,
    top: 12,
    zIndex: 2
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800"
  },
  details: {
    backgroundColor: "#F8FAFC",
    flex: 1,
    gap: 12,
    padding: 18
  },
  title: {
    color: "#111827",
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 28
  },
  meta: {
    color: "#6B7280",
    fontSize: 14
  },
  actions: {
    alignItems: "flex-start"
  },
  actionButton: {
    alignItems: "center",
    backgroundColor: "#0F766E",
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 42,
    paddingHorizontal: 14
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800"
  },
  pressed: {
    opacity: 0.72
  }
});
