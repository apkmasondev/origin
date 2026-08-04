"use client";

import { useEffect, useRef, useState } from "react";

const SOURCES = {
  large: [
    "assets/video/scene-01-point-explosion-1080p-gop1.mp4",
    "assets/video/scene-02-hummingbird-1080p-gop1.mp4",
    "assets/video/scene-03-hummingbird-cosmos-1080p-gop1.mp4",
  ],
  small: [
    "assets/video/scene-01-point-explosion-720p-gop1.mp4",
    "assets/video/scene-02-hummingbird-720p-gop1.mp4",
    "assets/video/scene-03-hummingbird-cosmos-720p-gop1.mp4",
  ],
} as const;

const FRAME_DURATION = 1 / 24;
const SEEK_THRESHOLD = FRAME_DURATION * 0.62;
const MAXIMUM_FRAME_STEP = FRAME_DURATION * 2.25;
const SCROLL_SMOOTHING_MS = 110;
const PROGRESS_EPSILON = 0.00004;

const PHASES: Phase[] = ["POINT", "MATTER", "TRANSIT", "LIFE", "RELEASE", "COSMOS"];

type Phase = "POINT" | "MATTER" | "TRANSIT" | "LIFE" | "RELEASE" | "COSMOS";
type NumberTriplet = [number, number, number];
type BooleanTriplet = [boolean, boolean, boolean];
type VideoTriplet = [HTMLVideoElement, HTMLVideoElement, HTMLVideoElement];

type TimelineState = {
  active: BooleanTriplet;
  opacities: NumberTriplet;
  times: NumberTriplet;
};

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const range = (value: number, start: number, end: number) =>
  clamp((value - start) / (end - start));

const smoothstep = (value: number) => value * value * (3 - 2 * value);

function phaseFor(progress: number): Phase {
  if (progress < 0.06) return "POINT";
  if (progress < 0.34) return "MATTER";
  if (progress < 0.39) return "TRANSIT";
  if (progress < 0.68) return "LIFE";
  if (progress < 0.73) return "RELEASE";
  return "COSMOS";
}

function timelineFor(progress: number, durations: NumberTriplet): TimelineState {
  const ends = durations.map((duration) => Math.max(0, duration - 0.04)) as NumberTriplet;
  const times: NumberTriplet = [0.02, 0.02, 0.02];

  if (progress < 0.06) {
    times[0] = 0.02;
  } else if (progress < 0.34) {
    times[0] = 0.2 + range(progress, 0.06, 0.34) * (9.65 - 0.2);
  } else if (progress <= 0.39) {
    const transition = range(progress, 0.34, 0.39);
    times[0] = 9.65 + transition * (ends[0] - 9.65);
    times[1] = 0.02 + transition * (0.35 - 0.02);
  } else if (progress < 0.68) {
    times[1] = 0.35 + range(progress, 0.39, 0.68) * (9.65 - 0.35);
  } else if (progress <= 0.73) {
    const transition = range(progress, 0.68, 0.73);
    times[1] = 9.65 + transition * (ends[1] - 9.65);
    times[2] = 0.02 + transition * (0.4 - 0.02);
  } else if (progress < 0.97) {
    times[2] = 0.4 + range(progress, 0.73, 0.97) * (9.6 - 0.4);
  } else {
    times[2] = 9.6 + range(progress, 0.97, 1) * (ends[2] - 9.6);
  }

  const firstMix = smoothstep(range(progress, 0.34, 0.39));
  const secondMix = smoothstep(range(progress, 0.68, 0.73));

  return {
    active: [progress <= 0.39, progress >= 0.34 && progress <= 0.73, progress >= 0.68],
    opacities: [1 - firstMix, firstMix * (1 - secondMix), secondMix],
    times,
  };
}

function setStoryVariables(scene: HTMLDivElement, progress: number) {
  scene.style.setProperty("--progress", progress.toFixed(4));
  scene.style.setProperty("--intro", String(1 - smoothstep(range(progress, 0.02, 0.08))));
  scene.style.setProperty(
    "--energy",
    String(smoothstep(range(progress, 0.18, 0.21)) * (1 - smoothstep(range(progress, 0.27, 0.3)))),
  );
  scene.style.setProperty(
    "--form",
    String(smoothstep(range(progress, 0.47, 0.5)) * (1 - smoothstep(range(progress, 0.56, 0.6)))),
  );
  scene.style.setProperty(
    "--memory",
    String(smoothstep(range(progress, 0.61, 0.64)) * (1 - smoothstep(range(progress, 0.7, 0.74)))),
  );
  scene.style.setProperty(
    "--cosmos",
    String(smoothstep(range(progress, 0.79, 0.82)) * (1 - smoothstep(range(progress, 0.89, 0.93)))),
  );
  scene.style.setProperty("--final", String(smoothstep(range(progress, 0.94, 0.985))));
  scene.style.setProperty("--reduced-fade", String(smoothstep(range(progress, 0.48, 0.66))));
}

function advanceVideo(video: HTMLVideoElement, targetTime: number, speedMultiplier = 1) {
  const maxTime = Math.max(0, (video.duration || 0) - FRAME_DURATION);
  const target = clamp(targetTime, 0, maxTime);
  const difference = target - video.currentTime;

  if (Math.abs(difference) <= SEEK_THRESHOLD) return false;
  if (video.seeking) return true;

  const maxStep = MAXIMUM_FRAME_STEP * Math.max(1, speedMultiplier);
  const steppedTime = video.currentTime + clamp(
    difference,
    -maxStep,
    maxStep,
  );
  const frameTime = Math.round(steppedTime / FRAME_DURATION) * FRAME_DURATION;
  video.currentTime = clamp(frameTime, 0, maxTime);
  return true;
}

export default function OriginExperience() {
  const scrollRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const firstVideoRef = useRef<HTMLVideoElement>(null);
  const secondVideoRef = useRef<HTMLVideoElement>(null);
  const thirdVideoRef = useRef<HTMLVideoElement>(null);
  const loadingTimerRef = useRef<number | null>(null);
  const loadedRef = useRef<BooleanTriplet>([false, false, false]);
  const [sourceSet, setSourceSet] = useState<
    readonly [string, string, string] | null
  >(null);
  const [ready, setReady] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [failed, setFailed] = useState(false);
  const [phase, setPhase] = useState<Phase>("POINT");
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
      }
    ).connection;
    const useSmall =
      window.matchMedia("(max-width: 820px)").matches ||
      connection?.saveData ||
      /(^|-)2g$/.test(connection?.effectiveType ?? "");

    const setupFrame = window.requestAnimationFrame(() => {
      setReducedMotion(reduceQuery.matches);
      setSourceSet(useSmall ? SOURCES.small : SOURCES.large);
      if (reduceQuery.matches) {
        setReady(true);
        setLoadProgress(100);
      }
    });

    return () => window.cancelAnimationFrame(setupFrame);
  }, []);

  useEffect(() => {
    if (!sourceSet || reducedMotion) return;

    const videos = [
      firstVideoRef.current,
      secondVideoRef.current,
      thirdVideoRef.current,
    ];
    if (videos.some((video) => !video)) return;

    const videoTriplet = videos as VideoTriplet;
    loadedRef.current = [false, false, false];
    setFailed(false);
    setReady(false);
    setLoadProgress(0);

    const updateBuffered = () => {
      const buffered = videoTriplet.reduce((total, video, index) => {
        if (loadedRef.current[index]) return total + 1;
        const duration = Number.isFinite(video.duration) ? video.duration : 0;
        const end = video.buffered.length
          ? video.buffered.end(video.buffered.length - 1)
          : 0;
        return total + (duration > 0 ? Math.min(0.92, end / duration) : 0);
      }, 0);
      setLoadProgress(Math.round((buffered / videoTriplet.length) * 100));
    };

    const markReady = (index: number) => {
      if (loadedRef.current[index]) return;
      loadedRef.current[index] = true;
      updateBuffered();

      if (loadedRef.current.every(Boolean)) {
        if (loadingTimerRef.current !== null) {
          window.clearTimeout(loadingTimerRef.current);
          loadingTimerRef.current = null;
        }
        setLoadProgress(100);
        setReady(true);
      }
    };

    const onError = () => setFailed(true);
    const disposers: Array<() => void> = [];

    videoTriplet.forEach((video, index) => {
      const readyHandler = () => markReady(index);
      video.addEventListener("loadeddata", readyHandler, { once: true });
      video.addEventListener("progress", updateBuffered);
      video.addEventListener("error", onError);
      video.load();
      disposers.push(() => {
        video.removeEventListener("loadeddata", readyHandler);
        video.removeEventListener("progress", updateBuffered);
        video.removeEventListener("error", onError);
      });
    });

    loadingTimerRef.current = window.setTimeout(() => {
      if (!loadedRef.current.every(Boolean)) setFailed(true);
    }, 26000);

    return () => {
      disposers.forEach((dispose) => dispose());
      if (loadingTimerRef.current !== null) {
        window.clearTimeout(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }
    };
  }, [sourceSet, reducedMotion]);

  useEffect(() => {
    if (!ready) return;

    const scrollContainer = scrollRef.current;
    const scene = sceneRef.current;
    const first = firstVideoRef.current;
    const second = secondVideoRef.current;
    const third = thirdVideoRef.current;
    if (!scrollContainer || !scene || !first || !second || !third) return;

    const videos: VideoTriplet = [first, second, third];
    let targetProgress = 0;
    let renderedProgress = 0;
    let animationFrame: number | null = null;
    let lastFrameTime = performance.now();

    const measureProgress = () => {
      const rect = scrollContainer.getBoundingClientRect();
      const distance = Math.max(1, scrollContainer.offsetHeight - window.innerHeight);
      return clamp(-rect.top / distance);
    };

    const render = (progress: number, speedMultiplier = 1) => {
      const durations = videos.map((video) => video.duration || 0) as NumberTriplet;
      const timeline = timelineFor(progress, durations);

      setStoryVariables(scene, progress);
      videos.forEach((video, index) => {
        video.style.opacity = timeline.opacities[index].toFixed(3);
      });

      const nextPhase = phaseFor(progress);
      setPhase((current) => (current === nextPhase ? current : nextPhase));

      if (reducedMotion || document.hidden) return false;
      return videos.reduce(
        (needsUpdate, video, index) =>
          timeline.active[index] && advanceVideo(video, timeline.times[index], speedMultiplier)
            ? true
            : needsUpdate,
        false,
      );
    };

    const tick = (time: number) => {
      animationFrame = null;
      const elapsed = Math.min(Math.max(time - lastFrameTime, 0), 64);
      lastFrameTime = time;
      const distance = targetProgress - renderedProgress;

      renderedProgress = reducedMotion || Math.abs(distance) < PROGRESS_EPSILON
        ? targetProgress
        : renderedProgress + distance * (1 - Math.exp(-elapsed / SCROLL_SMOOTHING_MS));

      const velocity = Math.abs(distance);
      const speedMultiplier = Math.min(6, 1 + velocity * 25);
      const videosNeedUpdate = render(renderedProgress, speedMultiplier);
      const progressNeedsUpdate = Math.abs(targetProgress - renderedProgress) >= PROGRESS_EPSILON;

      if (progressNeedsUpdate || videosNeedUpdate) {
        animationFrame = window.requestAnimationFrame(tick);
      }
    };

    const schedule = () => {
      targetProgress = measureProgress();
      if (animationFrame !== null) return;
      lastFrameTime = performance.now();
      animationFrame = window.requestAnimationFrame(tick);
    };

    targetProgress = measureProgress();
    renderedProgress = targetProgress;
    render(renderedProgress);

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    document.addEventListener("visibilitychange", schedule);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("visibilitychange", schedule);
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
    };
  }, [ready, reducedMotion]);

  const retry = () => {
    setFailed(false);
    setLoadProgress(0);
    window.location.reload();
  };

  return (
    <main ref={scrollRef} className="origin-scroll">
      <div ref={sceneRef} className={`origin-scene ${ready ? "is-ready" : ""}`}>
        <div
          className="film-layer"
          role="img"
          aria-label="Filmowa opowieść o przemianie punktu światła w kolibra, który powraca do kosmosu"
        >
          <video
            ref={firstVideoRef}
            className="origin-video origin-video-one"
            src={sourceSet?.[0]}
            muted
            playsInline
            preload="auto"
            tabIndex={-1}
            aria-hidden="true"
          />
          <video
            ref={secondVideoRef}
            className="origin-video origin-video-two"
            src={sourceSet?.[1]}
            muted
            playsInline
            preload="auto"
            tabIndex={-1}
            aria-hidden="true"
          />
          <video
            ref={thirdVideoRef}
            className="origin-video origin-video-three"
            src={sourceSet?.[2]}
            muted
            playsInline
            preload="auto"
            tabIndex={-1}
            aria-hidden="true"
          />
          <div className="reduced-frame reduced-start" />
          <div className="reduced-frame reduced-final" />
        </div>

        <div className="edge-vignette" aria-hidden="true" />

        <div className={`loader ${ready && !failed ? "loader-hidden" : ""}`}>
          <div className="loader-poster" aria-hidden="true" />
          <div className="loader-center">
            <span className="loader-dot" />
            <span className="loader-value">{String(loadProgress).padStart(2, "0")}</span>
          </div>
          <p className="loader-caption">
            {failed ? "THE SEQUENCE COULD NOT FORM" : "ASSEMBLING LIGHT"}
          </p>
          {failed && (
            <button className="retry-button" type="button" onClick={retry}>
              TRY AGAIN
            </button>
          )}
        </div>

        <div className="interface" aria-hidden={!ready}>
          <header className="masthead">
            <span className="wordmark">ORIGIN</span>
            <span className="edition">ANATOMY OF BECOMING / 001</span>
          </header>

          <div className="phase-readout" aria-live="polite">
            <span className="phase-index">
              {String(PHASES.indexOf(phase) + 1).padStart(2, "0")}
            </span>
            <span className="phase-name">{phase}</span>
          </div>

          <div className="progress-rail" aria-label="Postęp opowieści">
            <span className="progress-line" />
            <span className="progress-marker" />
          </div>

          <div className="intro-copy">
            <p className="intro-eyebrow">
              <span>EVERYTHING BEGINS</span>
              <span>00:00:00</span>
            </p>
            <h1 className="intro-title" aria-label="From a point">
              <span className="intro-from">FROM</span>
              <span className="intro-point-word">A POINT</span>
            </h1>
          </div>

          <p className="interlude interlude-energy">COLOR BECOMES ENERGY</p>
          <p className="interlude interlude-form">ENERGY FINDS A FORM</p>
          <p className="interlude interlude-memory">
            <span>LIFE REMEMBERS</span>
            <span>WHAT IT IS MADE OF</span>
          </p>
          <p className="interlude interlude-cosmos">FORM BECOMES INFINITE</p>

          <div className="final-copy">
            <p className="final-kicker">ORIGIN / THE CYCLE CONTINUES</p>
            <p className="final-line final-line-a">NOT AN END</p>
            <p className="final-line final-line-b">A RETURN</p>
          </div>

          <p className="scroll-hint">
            <span>SCROLL</span>
            <span className="scroll-hint-line" />
            <span>TO UNFOLD</span>
          </p>
        </div>
      </div>
    </main>
  );
}
