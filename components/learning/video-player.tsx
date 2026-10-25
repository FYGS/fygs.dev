"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  Captions,
  Maximize,
  Minimize,
  Pause,
  PictureInPicture,
  Play,
  RotateCcw,
  RotateCw,
  Settings,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/learning/format-time";
import { useLessonSession } from "./lesson-session";

const subscribeNoop = () => () => {};
const RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];

const SHORTCUTS: [string, string][] = [
  ["Espace / K", "Lecture / pause"],
  ["J", "Reculer de 10 s"],
  ["L", "Avancer de 10 s"],
  ["← / →", "Reculer / avancer de 5 s"],
  ["↑ / ↓", "Volume"],
  ["M", "Couper le son"],
  ["C", "Sous-titres"],
  ["F", "Plein écran"],
  ["?", "Afficher les raccourcis"],
];

interface VideoPlayerProps {
  title: string;
  videoUrl: string;
  /** Seconds, from the lesson record: shown until the file reports its own length. */
  durationHint: number | null;
  /** Where the learner stopped last time. */
  resumeAt: number;
  /** Same-origin address of the WebVTT captions, or null. */
  captionsSrc?: string | null;
}

const CAPTIONS_PREFERENCE = "fygs:captions";

/** The learner's last captions choice in this browser (false when unknown or storage is refused). */
function storedCaptionsChoice(): boolean {
  try {
    return window.localStorage.getItem(CAPTIONS_PREFERENCE) === "on";
  } catch {
    return false;
  }
}

/** Shows or hides the captions track of a video (the `default` attribute is only read once). */
function showCaptions(video: HTMLVideoElement | null, on: boolean) {
  const track = video?.textTracks[0];
  if (track) track.mode = on ? "showing" : "hidden";
}

/** Keys the player takes over only while the player itself (or its video) has focus. */
function isNativeControl(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && !!target.closest("button, input, textarea, select, a, [role='slider'], [role='dialog']");
}

export function VideoPlayer({ title, videoUrl, durationHint, resumeAt, captionsSrc = null }: VideoPlayerProps) {
  const { progress, registerPlayer, complete, completed, recording } = useLessonSession();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTick = useRef<number | null>(null);

  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(durationHint ?? 0);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [rate, setRate] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  const [buffering, setBuffering] = useState(false);
  const [error, setError] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [resumed, setResumed] = useState<number | null>(null);
  // Captions follow the learner's last choice, kept in this browser
  const [captionsOn, setCaptionsOn] = useState(false);
  const pipSupported = useSyncExternalStore(
    subscribeNoop,
    () => document.pictureInPictureEnabled,
    () => false,
  );

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => setPlaying(false));
    else video.pause();
  }, []);

  const seekTo = useCallback((seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    const max = Number.isFinite(video.duration) ? video.duration : seconds;
    video.currentTime = Math.max(0, Math.min(max, seconds));
    setTime(video.currentTime);
  }, []);

  const skip = useCallback((delta: number) => seekTo((videoRef.current?.currentTime ?? 0) + delta), [seekTo]);

  useEffect(() => {
    showCaptions(videoRef.current, captionsOn);
  }, [captionsOn, captionsSrc]);

  const toggleCaptions = useCallback(() => {
    setCaptionsOn((on) => {
      try {
        window.localStorage.setItem(CAPTIONS_PREFERENCE, on ? "off" : "on");
      } catch {
        // the choice is only kept for this page
      }
      return !on;
    });
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (video) video.muted = !video.muted;
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await container.requestFullscreen();
    } catch {
      // not allowed here (iframe, old browser): the player stays as it is
    }
  }, []);

  const showControlsBriefly = useCallback(() => {
    setControlsVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) setControlsVisible(false);
    }, 3000);
  }, []);

  // The notes panel and the "resume" prompt drive the video through the session
  useEffect(() => {
    registerPlayer({ getTime: () => videoRef.current?.currentTime ?? 0, seek: seekTo });
    return () => registerPlayer(null);
  }, [registerPlayer, seekTo]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onLoaded = () => {
      setDuration(video.duration);
      setLoading(false);
      // captions follow the learner's last choice, once the track exists
      if (captionsSrc && storedCaptionsChoice()) setCaptionsOn(true);
      const d = video.duration;
      if (resumeAt > 5 && Number.isFinite(d) && resumeAt < d - 5) {
        video.currentTime = resumeAt;
        setResumed(resumeAt);
      }
    };
    const onTime = () => {
      const t = video.currentTime;
      setTime(t);
      // time really played: small forward steps only, a jump of the seek bar is not watching
      if (lastTick.current !== null) {
        const step = t - lastTick.current;
        if (step > 0 && step < 2) progress.addWatched(step);
      }
      lastTick.current = t;
      progress.setPosition(t);
    };
    const onPlay = () => {
      setPlaying(true);
      progress.start();
      showControlsBriefly();
    };
    const onPause = () => {
      setPlaying(false);
      setControlsVisible(true);
      progress.stop();
    };
    const onSeeking = () => {
      lastTick.current = null;
    };
    const onEnded = () => {
      setPlaying(false);
      setControlsVisible(true);
      progress.stop();
      if (!completed) void complete();
    };
    const onVolume = () => {
      setVolume(video.volume);
      setMuted(video.muted);
    };
    const onRate = () => setRate(video.playbackRate);
    const onWaiting = () => setBuffering(true);
    const onCanPlay = () => {
      setBuffering(false);
      setLoading(false);
    };
    const onError = () => {
      setError(true);
      setLoading(false);
    };

    const events: [string, () => void][] = [
      ["loadedmetadata", onLoaded],
      ["timeupdate", onTime],
      ["play", onPlay],
      ["pause", onPause],
      ["seeking", onSeeking],
      ["ended", onEnded],
      ["volumechange", onVolume],
      ["ratechange", onRate],
      ["waiting", onWaiting],
      ["canplay", onCanPlay],
      ["error", onError],
    ];
    for (const [name, handler] of events) video.addEventListener(name, handler);
    return () => {
      for (const [name, handler] of events) video.removeEventListener(name, handler);
    };
  }, [resumeAt, progress, completed, complete, showControlsBriefly, captionsSrc]);

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useEffect(() => () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    // A focused button, slider or dialog keeps its own keys (Space on a button, arrows on a slider)
    if (isNativeControl(e.target)) {
      if (e.key === "Escape") {
        setShowShortcuts(false);
        setShowSettings(false);
      }
      return;
    }
    const video = videoRef.current;
    if (!video) return;
    const handled = (action: () => void) => {
      e.preventDefault();
      action();
      showControlsBriefly();
    };
    switch (e.key) {
      case " ":
      case "k":
      case "K":
        return handled(togglePlay);
      case "j":
      case "J":
        return handled(() => skip(-10));
      case "l":
      case "L":
        return handled(() => skip(10));
      case "ArrowLeft":
        return handled(() => skip(-5));
      case "ArrowRight":
        return handled(() => skip(5));
      case "ArrowUp":
        return handled(() => (video.volume = Math.min(1, video.volume + 0.1)));
      case "ArrowDown":
        return handled(() => (video.volume = Math.max(0, video.volume - 0.1)));
      case "m":
      case "M":
        return handled(toggleMute);
      case "f":
      case "F":
        return handled(() => void toggleFullscreen());
      case "c":
      case "C":
        if (captionsSrc) return handled(toggleCaptions);
        return;
      case "?":
        return handled(() => setShowShortcuts((s) => !s));
      case "Escape":
        setShowShortcuts(false);
        setShowSettings(false);
    }
  };

  const togglePip = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else await video.requestPictureInPicture();
    } catch {
      // not available for this video
    }
  };

  const percent = duration > 0 ? (time / duration) * 100 : 0;

  if (error) {
    return (
      <div role="alert" className="flex aspect-video items-center justify-center rounded-lg bg-muted p-6 text-center">
        <div>
          <p className="font-medium">La vidéo ne peut pas être lue.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Rechargez la page ; si le problème continue, le fichier est peut-être indisponible. Le texte de la leçon reste accessible.
          </p>
        </div>
      </div>
    );
  }

  const controlsClass = cn(
    "transition-opacity duration-300 focus-within:opacity-100",
    controlsVisible ? "opacity-100" : "opacity-0",
  );

  return (
    <div
      ref={containerRef}
      role="group"
      aria-label={`Lecteur vidéo : ${title}`}
      aria-describedby="player-shortcuts-hint"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseMove={showControlsBriefly}
      onFocus={() => setControlsVisible(true)}
      className="group relative aspect-video overflow-hidden rounded-lg bg-black outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary"
    >
      <span id="player-shortcuts-hint" className="sr-only">
        Espace pour lire ou mettre en pause, flèches pour avancer ou reculer, point d’interrogation pour tous les raccourcis.
      </span>
      <video
        ref={videoRef}
        src={videoUrl}
        className="h-full w-full cursor-pointer object-contain"
        playsInline
        preload="metadata"
        onClick={() => {
          togglePlay();
          showControlsBriefly();
        }}
      >
        {captionsSrc && <track kind="captions" src={captionsSrc} srcLang="fr" label="Français" />}
      </video>

      {(loading || buffering) && (
        <div role="status" className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/60 text-white">
          <span className="h-8 w-8 animate-spin rounded-full border-b-2 border-white" aria-hidden />
          <span className="ml-3">{loading ? "Chargement…" : "Mise en mémoire…"}</span>
        </div>
      )}

      {resumed !== null && (
        <div className="absolute left-3 top-3 z-10 flex items-center gap-2 rounded-md bg-black/80 px-3 py-2 text-sm text-white">
          <span>Reprise à {formatTime(resumed)}</span>
          <Button
            size="sm"
            variant="secondary"
            className="h-7"
            onClick={() => {
              seekTo(0);
              setResumed(null);
            }}
          >
            Depuis le début
          </Button>
        </div>
      )}

      <div className={cn("pointer-events-none absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-black/20", controlsClass)}>
        <div className="pointer-events-auto absolute right-3 top-3 flex items-center gap-1">
          {captionsSrc && (
            <Button
              aria-label="Sous-titres"
              aria-pressed={captionsOn}
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8 text-white hover:bg-white/20", captionsOn && "bg-white/25")}
              onClick={toggleCaptions}
            >
              <Captions className="h-4 w-4" aria-hidden />
            </Button>
          )}
          {pipSupported && (
            <Button aria-label="Image dans l’image" variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={togglePip}>
              <PictureInPicture className="h-4 w-4" aria-hidden />
            </Button>
          )}
          <Button
            aria-label="Vitesse de lecture"
            aria-expanded={showSettings}
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/20"
            onClick={() => setShowSettings((s) => !s)}
          >
            <Settings className="h-4 w-4" aria-hidden />
          </Button>
          <Button
            aria-label={fullscreen ? "Quitter le plein écran" : "Plein écran"}
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/20"
            onClick={() => void toggleFullscreen()}
          >
            {fullscreen ? <Minimize className="h-4 w-4" aria-hidden /> : <Maximize className="h-4 w-4" aria-hidden />}
          </Button>
        </div>

        {showSettings && (
          <div role="dialog" aria-label="Vitesse de lecture" className="pointer-events-auto absolute right-3 top-14 min-w-44 rounded-lg bg-black/90 p-3">
            <p className="mb-2 text-sm font-medium text-white">Vitesse de lecture</p>
            <div className="grid grid-cols-3 gap-1">
              {RATES.map((r) => (
                <Button
                  key={r}
                  size="sm"
                  variant={rate === r ? "default" : "ghost"}
                  aria-pressed={rate === r}
                  className={cn("h-7 text-xs", rate !== r && "text-white")}
                  onClick={() => {
                    if (videoRef.current) videoRef.current.playbackRate = r;
                    setShowSettings(false);
                  }}
                >
                  {r}×
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="pointer-events-auto absolute inset-x-0 bottom-0 space-y-2 p-3 sm:p-4">
          <input
            type="range"
            aria-label="Position dans la vidéo"
            aria-valuetext={`${formatTime(time)} sur ${formatTime(duration)}`}
            min={0}
            max={100}
            // one second per key press, whatever the length of the video
            step={duration > 0 ? 100 / duration : 1}
            value={percent}
            disabled={duration <= 0}
            onChange={(e) => seekTo((Number(e.target.value) / 100) * duration)}
            className="h-1.5 w-full cursor-pointer accent-primary"
          />
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 sm:gap-2">
              <Button aria-label={playing ? "Pause" : "Lecture"} variant="ghost" size="icon" className="h-9 w-9 text-white hover:bg-white/20" onClick={togglePlay}>
                {playing ? <Pause className="h-5 w-5" aria-hidden /> : <Play className="h-5 w-5" aria-hidden />}
              </Button>
              <Button aria-label="Reculer de 10 secondes" variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={() => skip(-10)}>
                <RotateCcw className="h-4 w-4" aria-hidden />
              </Button>
              <Button aria-label="Avancer de 10 secondes" variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={() => skip(10)}>
                <RotateCw className="h-4 w-4" aria-hidden />
              </Button>
              <Button aria-label={muted || volume === 0 ? "Activer le son" : "Couper le son"} variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={toggleMute}>
                {muted || volume === 0 ? <VolumeX className="h-4 w-4" aria-hidden /> : <Volume2 className="h-4 w-4" aria-hidden />}
              </Button>
              <div className="hidden w-20 sm:block">
                <input
                  type="range"
                  aria-label="Volume"
                  min={0}
                  max={100}
                  step={5}
                  value={muted ? 0 : Math.round(volume * 100)}
                  onChange={(e) => {
                    if (!videoRef.current) return;
                    const value = Number(e.target.value);
                    videoRef.current.volume = value / 100;
                    videoRef.current.muted = value === 0;
                  }}
                  className="h-1.5 w-full cursor-pointer accent-primary"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium text-white/90">
              {!recording && <span className="rounded bg-white/15 px-2 py-0.5">Aperçu</span>}
              <span aria-label={`${formatTime(time)} sur ${formatTime(duration)}`}>
                {formatTime(time)} / {formatTime(duration)}
              </span>
              <Button aria-label="Raccourcis clavier" variant="ghost" size="icon" className="hidden h-7 w-7 text-white hover:bg-white/20 sm:inline-flex" onClick={() => setShowShortcuts(true)}>
                <span aria-hidden className="text-sm font-semibold">?</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {showShortcuts && (
        <div role="dialog" aria-label="Raccourcis clavier" className="absolute inset-0 z-20 flex items-center justify-center bg-black/90 p-4 text-white">
          <div className="w-full max-w-sm">
            <h3 className="mb-4 text-lg font-semibold">Raccourcis clavier</h3>
            <dl className="space-y-2 text-sm">
              {SHORTCUTS.map(([keys, label]) => (
                <div key={keys} className="flex justify-between gap-4">
                  <dt>
                    <kbd className="rounded bg-white/10 px-2 py-0.5 font-mono text-xs">{keys}</kbd>
                  </dt>
                  <dd className="text-white/80">{label}</dd>
                </div>
              ))}
            </dl>
            <Button className="mt-5" variant="secondary" onClick={() => setShowShortcuts(false)} autoFocus>
              Fermer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
