"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const SOURCES = {
  large: [
    "/assets/video/scene-01-point-explosion-1080p-gop1.mp4",
    "/assets/video/scene-02-hummingbird-1080p-gop1.mp4",
    "/assets/video/scene-03-hummingbird-cosmos-1080p-gop1.mp4",
  ],
  small: [
    "/assets/video/scene-01-point-explosion-720p-gop1.mp4",
    "/assets/video/scene-02-hummingbird-720p-gop1.mp4",
    "/assets/video/scene-03-hummingbird-cosmos-720p-gop1.mp4",
  ],
} as const;

const PHASES: Phase[] = ["POINT", "MATTER", "TRANSIT", "LIFE", "RELEASE", "COSMOS"];

type Phase = "POINT" | "MATTER" | "TRANSIT" | "LIFE" | "RELEASE" | "COSMOS";

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

function drawCover(
  context: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  width: number,
  height: number,
  alpha = 1,
) {
  if (video.readyState < 2 || !video.videoWidth || !video.videoHeight) return;

  const scale = Math.max(width / video.videoWidth, height / video.videoHeight);
  const drawWidth = video.videoWidth * scale;
  const drawHeight = video.videoHeight * scale;
  const x = (width - drawWidth) / 2;
  const y = (height - drawHeight) / 2;

  context.save();
  context.globalAlpha = alpha;
  context.drawImage(video, x, y, drawWidth, drawHeight);
  context.restore();
}

export default function OriginExperience() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const firstVideoRef = useRef<HTMLVideoElement>(null);
  const secondVideoRef = useRef<HTMLVideoElement>(null);
  const thirdVideoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const videoFrameRefs = useRef<[number | null, number | null, number | null]>([
    null,
    null,
    null,
  ]);
  const loadingTimerRef = useRef<number | null>(null);
  const loadedRef = useRef([false, false, false]);
  const [sourceSet, setSourceSet] = useState<
    readonly [string, string, string] | null
  >(null);
  const [ready, setReady] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [failed, setFailed] = useState(false);
  const [phase, setPhase] = useState<Phase>("POINT");
  const [reducedMotion, setReducedMotion] = useState(false);

  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const first = firstVideoRef.current;
    const second = secondVideoRef.current;
    const third = thirdVideoRef.current;
    if (!canvas || !first || !second || !third) return;

    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;

    const progress = progressRef.current;
    const width = canvas.width;
    const height = canvas.height;

    const hasFirstFrame = first.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA;
    const hasSecondFrame = second.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA;
    const hasThirdFrame = third.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA;
    const requiredFramesReady =
      progress < 0.34
        ? hasFirstFrame
        : progress <= 0.39
          ? hasFirstFrame && hasSecondFrame
          : progress < 0.68
            ? hasSecondFrame
            : progress <= 0.73
              ? hasSecondFrame && hasThirdFrame
              : hasThirdFrame;

    // Seeking temporarily drops readyState. Keep the last decoded canvas frame
    // visible instead of clearing it to black while the next frame is decoded.
    if (!requiredFramesReady) return;

    context.fillStyle = "#000";
    context.fillRect(0, 0, width, height);

    if (progress < 0.34) {
      drawCover(context, first, width, height);
      return;
    }

    if (progress <= 0.39) {
      const mix = smoothstep(range(progress, 0.34, 0.39));
      drawCover(context, first, width, height, 1);
      drawCover(context, second, width, height, mix);
      return;
    }

    if (progress < 0.68) {
      drawCover(context, second, width, height);
      return;
    }

    if (progress <= 0.73) {
      const mix = smoothstep(range(progress, 0.68, 0.73));
      drawCover(context, second, width, height, 1);
      drawCover(context, third, width, height, mix);
      return;
    }

    drawCover(context, third, width, height);
  }, []);

  const seekVideos = useCallback(
    (progress: number) => {
      const first = firstVideoRef.current;
      const second = secondVideoRef.current;
      const third = thirdVideoRef.current;
      if (!first || !second || !third || !ready) return;

      const firstEnd = Math.max(0, first.duration - 0.04);
      const secondEnd = Math.max(0, second.duration - 0.04);
      const thirdEnd = Math.max(0, third.duration - 0.04);
      let firstTime = 0.02;
      let secondTime = 0.02;
      let thirdTime = 0.02;
      let didSeek = false;

      const seek = (video: HTMLVideoElement, time: number, index: 0 | 1 | 2) => {
        if (Math.abs(video.currentTime - time) <= 1 / 48) return;

        didSeek = true;
        video.currentTime = time;

        if (
          typeof video.requestVideoFrameCallback === "function" &&
          videoFrameRefs.current[index] === null
        ) {
          videoFrameRefs.current[index] = video.requestVideoFrameCallback(() => {
            videoFrameRefs.current[index] = null;
            renderFrame();
          });
        }
      };

      if (progress < 0.06) {
        firstTime = 0.02;
      } else if (progress < 0.34) {
        firstTime = 0.2 + range(progress, 0.06, 0.34) * (9.65 - 0.2);
      } else if (progress <= 0.39) {
        const transition = range(progress, 0.34, 0.39);
        firstTime = 9.65 + transition * (firstEnd - 9.65);
        secondTime = 0.02 + transition * (0.35 - 0.02);
      } else if (progress < 0.68) {
        secondTime = 0.35 + range(progress, 0.39, 0.68) * (9.65 - 0.35);
      } else if (progress <= 0.73) {
        const transition = range(progress, 0.68, 0.73);
        secondTime = 9.65 + transition * (secondEnd - 9.65);
        thirdTime = 0.02 + transition * (0.4 - 0.02);
      } else if (progress < 0.97) {
        thirdTime = 0.4 + range(progress, 0.73, 0.97) * (9.6 - 0.4);
      } else {
        thirdTime = 9.6 + range(progress, 0.97, 1) * (thirdEnd - 9.6);
      }

      if (progress <= 0.39) seek(first, firstTime, 0);
      if (progress >= 0.34 && progress <= 0.73) seek(second, secondTime, 1);
      if (progress >= 0.68) seek(third, thirdTime, 2);

      if (!didSeek) renderFrame();
    },
    [ready, renderFrame],
  );

  const updateProgress = useCallback(() => {
    frameRef.current = null;
    const scrollContainer = scrollRef.current;
    const scene = sceneRef.current;
    if (!scrollContainer || !scene) return;

    const rect = scrollContainer.getBoundingClientRect();
    const distance = Math.max(1, scrollContainer.offsetHeight - window.innerHeight);
    const progress = clamp(-rect.top / distance);
    progressRef.current = progress;
    const nextPhase = phaseFor(progress);
    setPhase((current) => (current === nextPhase ? current : nextPhase));

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

    if (!reducedMotion) seekVideos(progress);
  }, [reducedMotion, seekVideos]);

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
    const callbackHandles = videoFrameRefs.current;

    loadedRef.current = [false, false, false];
    setFailed(false);
    setReady(false);
    setLoadProgress(0);

    const updateBuffered = () => {
      let total = 0;
      videos.forEach((video, index) => {
        if (!video) return;
        if (loadedRef.current[index]) {
          total += 1;
          return;
        }
        const duration = Number.isFinite(video.duration) ? video.duration : 0;
        const end = video.buffered.length
          ? video.buffered.end(video.buffered.length - 1)
          : 0;
        total += duration > 0 ? Math.min(0.92, end / duration) : 0;
      });
      setLoadProgress(Math.round((total / 3) * 100));
    };

    const markReady = (index: number) => {
      loadedRef.current[index] = true;
      updateBuffered();
      if (loadedRef.current.every(Boolean)) {
        if (loadingTimerRef.current) window.clearTimeout(loadingTimerRef.current);
        setLoadProgress(100);
        setReady(true);
      }
    };

    const onError = () => setFailed(true);
    const disposers: Array<() => void> = [];
    videos.forEach((video, index) => {
      if (!video) return;
      const readyHandler = () => markReady(index);
      video.addEventListener("loadeddata", readyHandler, { once: true });
      video.addEventListener("progress", updateBuffered);
      video.addEventListener("seeked", renderFrame);
      video.addEventListener("error", onError);
      video.load();
      disposers.push(() => {
        video.removeEventListener("loadeddata", readyHandler);
        video.removeEventListener("progress", updateBuffered);
        video.removeEventListener("seeked", renderFrame);
        video.removeEventListener("error", onError);
      });
    });

    loadingTimerRef.current = window.setTimeout(() => {
      if (!loadedRef.current.every(Boolean)) setFailed(true);
    }, 26000);

    return () => {
      disposers.forEach((dispose) => dispose());
      videos.forEach((video, index) => {
        const handle = callbackHandles[index];
        if (
          video &&
          handle !== null &&
          typeof video.cancelVideoFrameCallback === "function"
        ) {
          video.cancelVideoFrameCallback(handle);
          callbackHandles[index] = null;
        }
      });
      if (loadingTimerRef.current) window.clearTimeout(loadingTimerRef.current);
    };
  }, [sourceSet, reducedMotion, renderFrame]);

  useEffect(() => {
    if (!ready) return;
    const handleScroll = () => {
      if (frameRef.current === null) {
        frameRef.current = window.requestAnimationFrame(updateProgress);
      }
    };
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(window.innerWidth * ratio);
        canvas.height = Math.round(window.innerHeight * ratio);
      }
      updateProgress();
      renderFrame();
    };

    handleResize();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    };
  }, [ready, renderFrame, updateProgress]);

  const retry = () => {
    setFailed(false);
    setLoadProgress(0);
    loadedRef.current = [false, false, false];
    firstVideoRef.current?.load();
    secondVideoRef.current?.load();
    thirdVideoRef.current?.load();
    window.location.reload();
  };

  return (
    <main ref={scrollRef} className="origin-scroll">
      <div ref={sceneRef} className={`origin-scene ${ready ? "is-ready" : ""}`}>
        <div className="film-layer">
          <canvas
            ref={canvasRef}
            className="film-canvas"
            aria-label="Filmowa opowieść o przemianie punktu światła w kolibra, który powraca do kosmosu"
          />
          <div className="reduced-frame reduced-start" />
          <div className="reduced-frame reduced-final" />
        </div>

        <video
          ref={firstVideoRef}
          src={sourceSet?.[0]}
          muted
          playsInline
          preload="auto"
          tabIndex={-1}
          aria-hidden="true"
        />
        <video
          ref={secondVideoRef}
          src={sourceSet?.[1]}
          muted
          playsInline
          preload="auto"
          tabIndex={-1}
          aria-hidden="true"
        />
        <video
          ref={thirdVideoRef}
          src={sourceSet?.[2]}
          muted
          playsInline
          preload="auto"
          tabIndex={-1}
          aria-hidden="true"
        />

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
