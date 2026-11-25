import { initTaskGallery, initRecordingGrid } from "./task-gallery";

// Lightweight page behavior. No analytics, external players, or remote requests.
document.body.classList.add("js-enabled");
const navButton = document.querySelector<HTMLButtonElement>(".nav-toggle");
const navLinks = document.querySelector<HTMLElement>(".nav-links");
navButton?.addEventListener("click", () => {
  const open = navButton.getAttribute("aria-expanded") !== "true";
  navButton.setAttribute("aria-expanded", String(open));
  navLinks?.classList.toggle("is-open", open);
});
navLinks?.querySelectorAll("a").forEach((link) =>
  link.addEventListener("click", () => {
    navButton?.setAttribute("aria-expanded", "false");
    navLinks.classList.remove("is-open");
    const target = document.querySelector<HTMLElement>(
      link.getAttribute("href") ?? "",
    );
    if (target) {
      target.tabIndex = -1;
      window.requestAnimationFrame(() => target.focus({ preventScroll: true }));
    }
  }),
);
document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    navButton?.getAttribute("aria-expanded") === "true"
  ) {
    navButton.setAttribute("aria-expanded", "false");
    navLinks?.classList.remove("is-open");
    navButton.focus();
  }
});

const lightbox = document.querySelector<HTMLDialogElement>("#image-lightbox");
const lightboxImage =
  document.querySelector<HTMLImageElement>("#lightbox-image");
const lightboxCaption =
  document.querySelector<HTMLElement>("#lightbox-caption");
let returnFocus: HTMLElement | null = null;
let previousOverflow = "";
document
  .querySelectorAll<HTMLAnchorElement>("[data-lightbox]")
  .forEach((link) => {
    link.addEventListener("click", (event) => {
      // Keep open-in-new-tab and the no-JS full-image fallback working.
      if (
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        !lightbox?.showModal ||
        !lightboxImage
      )
        return;
      event.preventDefault();
      returnFocus = link;
      lightboxImage.src = link.href;
      lightboxImage.alt = link.querySelector("img")?.alt ?? "Research figure";
      if (lightboxCaption)
        lightboxCaption.textContent = link.dataset.caption ?? "";
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      lightbox.showModal();
    });
  });
lightbox
  ?.querySelector("[data-close-lightbox]")
  ?.addEventListener("click", () => lightbox.close());
lightbox?.addEventListener("click", (event) => {
  if (event.target !== lightbox) return;
  const box = lightbox.getBoundingClientRect();
  if (
    event.clientX < box.left ||
    event.clientX > box.right ||
    event.clientY < box.top ||
    event.clientY > box.bottom
  )
    lightbox.close();
});
lightbox?.addEventListener("close", () => {
  document.body.style.overflow = previousOverflow;
  lightboxImage?.removeAttribute("src");
  returnFocus?.focus({ preventScroll: true });
});

const copyButton = document.querySelector<HTMLButtonElement>(
  "[data-copy-citation]",
);
const copyStatus = document.querySelector<HTMLElement>("#copy-status");
copyButton?.addEventListener("click", async () => {
  const code = document.querySelector<HTMLElement>("#bibtex-content");
  if (!code || !copyStatus) return;
  try {
    if (!navigator.clipboard?.writeText)
      throw new Error("Clipboard unavailable");
    await navigator.clipboard.writeText(code.textContent ?? "");
    copyStatus.textContent = "Citation copied to clipboard.";
    copyButton.textContent = "Copied";
    window.setTimeout(() => {
      copyButton.textContent = "Copy citation";
    }, 2000);
  } catch {
    const range = document.createRange();
    range.selectNodeContents(code);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    copyStatus.textContent =
      "Clipboard unavailable. Citation selected; press Ctrl+C or Command+C to copy.";
  }
});

function hydrate(video: HTMLVideoElement): void {
  if (video.closest("[hidden]")) return;
  if (video.dataset.poster && !video.poster)
    video.poster = video.dataset.poster;
  if (!video.getAttribute("src") && video.dataset.src)
    video.src = video.dataset.src;
}
function prepare(video: HTMLVideoElement): Promise<void> {
  hydrate(video);
  if (video.readyState >= 1 && Number.isFinite(video.duration))
    return Promise.resolve();
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      window.clearTimeout(timeout);
      video.removeEventListener("loadedmetadata", ready);
      video.removeEventListener("error", failed);
    };
    const ready = () => {
      cleanup();
      resolve();
    };
    const failed = () => {
      cleanup();
      reject(new Error("Video could not be loaded"));
    };
    const timeout = window.setTimeout(failed, 15000);
    video.addEventListener("loadedmetadata", ready, { once: true });
    video.addEventListener("error", failed, { once: true });
    video.preload = "metadata";
    video.load();
  });
}

class PlaybackGroup {
  readonly videos: HTMLVideoElement[];
  private locked = false;
  private version = 0;
  private timer?: number;
  private readonly synchronized: boolean;
  constructor(
    readonly element: HTMLElement,
    private status: HTMLElement | null,
  ) {
    this.videos = [
      ...element.querySelectorAll<HTMLVideoElement>("video[data-demo-video]"),
    ];
    this.synchronized = element.dataset.sync === "true";
    for (const video of this.videos) {
      video.muted = true;
      if (!this.synchronized) continue;
      // Synchronized groups restart together at the end of their shortest view.
      video.loop = false;
      video.addEventListener("play", () => {
        if (!this.locked) void this.play(video.currentTime);
      });
      video.addEventListener("pause", () => {
        if (!this.locked && !video.ended) this.pause();
      });
      video.addEventListener("seeked", () => {
        if (this.locked) return;
        const time = this.clampTime(video.currentTime);
        this.locked = true;
        for (const peer of this.videos) {
          if (peer.readyState >= 1 && Math.abs(peer.currentTime - time) > 0.08)
            peer.currentTime = time;
        }
        this.locked = false;
      });
      video.addEventListener("ratechange", () => {
        if (this.locked) return;
        this.locked = true;
        this.videos.forEach((peer) => {
          peer.playbackRate = video.playbackRate;
        });
        this.locked = false;
      });
      video.addEventListener("ended", () => {
        if (!this.locked) void this.play(0);
      });
    }
    element.querySelector("[data-sync-play]")?.addEventListener("click", () => {
      void this.play(0);
    });
  }
  private duration(): number {
    const durations = this.videos
      .map((v) => v.duration)
      .filter((d) => Number.isFinite(d) && d > 0);
    return durations.length ? Math.min(...durations) : Infinity;
  }
  private clampTime(time: number): number {
    return Math.max(0, Math.min(time, this.duration() - 0.05));
  }
  async play(time = 0): Promise<void> {
    if (!this.videos.length) return;
    const version = ++this.version;
    this.locked = true;
    this.clearTimer();
    this.videos.forEach((video) => video.pause());
    try {
      await Promise.all(this.videos.map(prepare));
      if (version !== this.version) return;
      const start = this.synchronized ? this.clampTime(time) : time;
      this.videos.forEach((video) => {
        video.muted = true;
        video.currentTime = Math.min(start, Math.max(0, video.duration - 0.05));
      });
      const outcomes = await Promise.allSettled(
        this.videos.map((video) => video.play()),
      );
      if (version !== this.version) return;
      if (outcomes.some((outcome) => outcome.status === "rejected"))
        throw new Error("Playback blocked");
      this.locked = false;
      if (this.status)
        this.status.textContent = "Playing synchronized local videos.";
      if (this.synchronized)
        this.timer = window.setInterval(() => {
          const master = this.videos[0];
          if (!master || master.paused || this.locked) return;
          if (master.currentTime >= this.duration() - 0.1) {
            void this.play(0);
            return;
          }
          this.locked = true;
          for (const peer of this.videos.slice(1)) {
            if (
              !peer.seeking &&
              Math.abs(peer.currentTime - master.currentTime) > 0.12
            )
              peer.currentTime = master.currentTime;
          }
          this.locked = false;
        }, 200);
    } catch {
      if (version !== this.version) return;
      this.pause();
      if (this.status)
        this.status.textContent =
          "Unable to play this group. Check the local video files and use each player’s controls to retry.";
    }
  }
  pause(): void {
    ++this.version;
    this.locked = true;
    this.clearTimer();
    this.videos.forEach((video) => video.pause());
    this.locked = false;
  }
  private clearTimer(): void {
    if (this.timer !== undefined) window.clearInterval(this.timer);
    this.timer = undefined;
  }
}

const allGroups: PlaybackGroup[] = [];
document
  .querySelectorAll<HTMLElement>("[data-video-gallery]")
  .forEach((gallery) => {
    const status = gallery.querySelector<HTMLElement>("[data-playback-status]");
    const groups = [
      ...gallery.querySelectorAll<HTMLElement>("[data-video-group]"),
    ].map((element) => new PlaybackGroup(element, status));
    allGroups.push(...groups);
  });

document
  .querySelectorAll<HTMLElement>("[data-task-gallery]")
  .forEach((gallery) => initTaskGallery(gallery, hydrate));
document
  .querySelectorAll<HTMLElement>("[data-recording-gallery]")
  .forEach((gallery) => initRecordingGrid(gallery, hydrate));

const lazyVideos =
  document.querySelectorAll<HTMLVideoElement>("video[data-src]");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const video = entry.target as HTMLVideoElement;
        hydrate(video); // preload=none: media is not downloaded until playback.
        observer.unobserve(video);
      }
    },
    { rootMargin: "200px" },
  );
  lazyVideos.forEach((video) => observer.observe(video));
} else lazyVideos.forEach(hydrate);

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) return;
  allGroups.forEach((group) => group.pause());
  document.querySelector<HTMLVideoElement>("[data-teaser-video]")?.pause();
});
