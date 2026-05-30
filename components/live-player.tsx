"use client";

import Hls from "hls.js";
import { useCallback, useEffect, useRef, useState } from "react";

type LivePlayerProps = {
  src: string;
  poster?: string;
  title: string;
};

type PlayerState = "loading" | "ready" | "playing" | "error";

function tryAutoplay(video: HTMLVideoElement) {
  video.play().catch(() => {
    // Browsers block autoplay with sound — controls remain usable.
  });
}

export function LivePlayer({ src, poster, title }: LivePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [state, setState] = useState<PlayerState>("loading");
  const [attempt, setAttempt] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const playbackSrc =
    attempt === 0 ? src : `${src}${src.includes("?") ? "&" : "?"}t=${attempt}`;

  const destroyPlayer = useCallback(() => {
    hlsRef.current?.destroy();
    hlsRef.current = null;
  }, []);

  const retry = useCallback(() => {
    setAttempt((value) => value + 1);
    setState("loading");
    setErrorMessage(null);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !playbackSrc) return;

    destroyPlayer();
    setState("loading");
    setErrorMessage(null);

    const onPlaying = () => setState("playing");
    const onWaiting = () => {
      if (!video.paused) {
        setState("loading");
      }
    };
    const onPause = () => {
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        setState("ready");
      }
    };

    video.addEventListener("playing", onPlaying);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("pause", onPause);

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = playbackSrc;

      const onLoaded = () => {
        setState("ready");
        tryAutoplay(video);
      };

      video.addEventListener("loadedmetadata", onLoaded, { once: true });

      return () => {
        video.removeEventListener("playing", onPlaying);
        video.removeEventListener("waiting", onWaiting);
        video.removeEventListener("pause", onPause);
        video.removeEventListener("loadedmetadata", onLoaded);
        video.removeAttribute("src");
        video.load();
      };
    }

    if (!Hls.isSupported()) {
      setState("error");
      setErrorMessage("HLS playback is not supported in this browser.");
      return;
    }

    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 30,
    });

    hlsRef.current = hls;

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      setState("ready");
      tryAutoplay(video);
    });

    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (!data.fatal) return;

      switch (data.type) {
        case Hls.ErrorTypes.NETWORK_ERROR:
          hls.startLoad();
          break;
        case Hls.ErrorTypes.MEDIA_ERROR:
          hls.recoverMediaError();
          break;
        default:
          setState("error");
          setErrorMessage("The stream is unavailable or has ended.");
          destroyPlayer();
      }
    });

    hls.loadSource(playbackSrc);
    hls.attachMedia(video);

    return () => {
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("pause", onPause);
      destroyPlayer();
    };
  }, [attempt, destroyPlayer, playbackSrc]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl shadow-emerald-950/30">
      <video
        ref={videoRef}
        className="aspect-video w-full bg-black"
        controls
        playsInline
        poster={poster}
        title={title}
      />

      {state === "loading" && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40">
          <div className="flex items-center gap-3 rounded-full bg-black/70 px-4 py-2 text-sm text-white">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            Buffering live stream…
          </div>
        </div>
      )}

      {state === "ready" && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/25">
          <div className="rounded-full bg-black/70 px-4 py-2 text-sm text-white">
            Press play to start
          </div>
        </div>
      )}

      {state === "error" && errorMessage && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80 px-6 text-center">
          <p className="max-w-sm text-sm text-zinc-300">{errorMessage}</p>
          <button
            type="button"
            onClick={retry}
            className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-medium text-black transition hover:bg-emerald-400"
          >
            Retry stream
          </button>
        </div>
      )}
    </div>
  );
}
