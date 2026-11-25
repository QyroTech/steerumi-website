interface TaskPanel {
  button: HTMLButtonElement;
  panel: HTMLElement;
  frames: HTMLElement[];
  choices: HTMLButtonElement[];
  selected: HTMLElement;
}

export function initTaskGallery(
  gallery: HTMLElement,
  hydrate: (video: HTMLVideoElement) => void,
): void {
  if (gallery.dataset.taskReady === "true") return;
  const list = gallery.querySelector<HTMLElement>("[data-task-list]");
  if (!list) return;
  const panels = new Map(
    [...gallery.querySelectorAll<HTMLElement>("[data-task-panel]")].map(
      (panel) => [panel.id, panel],
    ),
  );
  const tasks: TaskPanel[] = [];
  for (const button of list.querySelectorAll<HTMLButtonElement>(
    "[data-task-button]",
  )) {
    const panel = panels.get(button.getAttribute("aria-controls") ?? "");
    const frames = panel
      ? [...panel.querySelectorAll<HTMLElement>("[data-clip-frame]")]
      : [];
    if (!panel || !frames.length) return;
    tasks.push({
      button,
      panel,
      frames,
      choices: [
        ...panel.querySelectorAll<HTMLButtonElement>("[data-clip-button]"),
      ],
      selected: frames[0],
    });
  }
  if (!tasks.length) return;
  let active = tasks[0];

  function pauseOthers(selected: HTMLVideoElement | null): void {
    for (const video of gallery.querySelectorAll<HTMLVideoElement>("video")) {
      if (video === selected) continue;
      video.pause();
      if (video.hasAttribute("src")) {
        video.removeAttribute("src");
        video.preload = "none";
        video.load();
      }
    }
  }
  function selectRecording(task: TaskPanel, frame: HTMLElement): void {
    task.selected = frame;
    task.frames.forEach((item) => {
      item.hidden = item !== frame;
    });
    task.choices.forEach((choice) => {
      choice.setAttribute(
        "aria-pressed",
        String(choice.getAttribute("aria-controls") === frame.id),
      );
    });
  }
  function selectTask(index: number, focus = false, load = true): void {
    active = tasks[index];
    tasks.forEach((task) => {
      const selected = task === active;
      task.button.setAttribute("aria-selected", String(selected));
      task.button.tabIndex = selected ? 0 : -1;
      task.panel.hidden = !selected;
    });
    const video = active.selected.querySelector<HTMLVideoElement>("video");
    pauseOthers(video);
    if (load && video) hydrate(video);
    if (focus) active.button.focus({ preventScroll: true });
  }

  list.setAttribute("role", "tablist");
  tasks.forEach((task, index) => {
    task.button.setAttribute("role", "tab");
    task.panel.setAttribute("role", "tabpanel");
    task.panel.setAttribute("aria-labelledby", task.button.id);
    task.panel.tabIndex = 0;
    selectRecording(task, task.selected);
    task.panel
      .querySelector<HTMLElement>("[data-clip-list]")
      ?.removeAttribute("hidden");
    task.button.addEventListener("click", () => selectTask(index));
    task.choices.forEach((choice) => {
      choice.addEventListener("click", () => {
        const frame = task.frames.find(
          (item) => item.id === choice.getAttribute("aria-controls"),
        );
        if (!frame || frame === task.selected) return;
        selectRecording(task, frame);
        const video = active.selected.querySelector<HTMLVideoElement>("video");
        pauseOthers(video);
        if (task === active && video) hydrate(video);
      });
    });
  });
  list.addEventListener("keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const target = (event.target as HTMLElement).closest<HTMLButtonElement>(
      "[data-task-button]",
    );
    const index = tasks.findIndex((task) => task.button === target);
    if (index < 0) return;
    let next: number;
    switch (event.key) {
      case "ArrowRight":
        next = (index + 1) % tasks.length;
        break;
      case "ArrowLeft":
        next = (index - 1 + tasks.length) % tasks.length;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = tasks.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    selectTask(next, true);
  });
  selectTask(0, false, false);
  list.hidden = false;
  gallery.dataset.taskReady = "true";
}

export function initRecordingGrid(
  gallery: HTMLElement,
  hydrate: (video: HTMLVideoElement) => void,
): void {
  if (gallery.dataset.recordingsReady === "true") return;
  gallery
    .querySelectorAll<HTMLElement>("[data-recording-panel]")
    .forEach((panel) => {
      const frames = [
        ...panel.querySelectorAll<HTMLElement>("[data-clip-frame]"),
      ];
      if (!frames.length) return;
      const choices = [
        ...panel.querySelectorAll<HTMLButtonElement>("[data-clip-button]"),
      ];
      let selected = frames[0];
      function select(frame: HTMLElement, load: boolean): void {
        selected = frame;
        frames.forEach((item) => {
          item.hidden = item !== frame;
          if (item === frame) return;
          const video = item.querySelector<HTMLVideoElement>("video");
          video?.pause();
          if (video?.hasAttribute("src")) {
            video.removeAttribute("src");
            video.preload = "none";
            video.load();
          }
        });
        choices.forEach((choice) => {
          choice.setAttribute(
            "aria-pressed",
            String(choice.getAttribute("aria-controls") === frame.id),
          );
        });
        const video = frame.querySelector<HTMLVideoElement>("video");
        if (load && video) hydrate(video);
      }
      select(selected, false);
      panel
        .querySelector<HTMLElement>("[data-clip-list]")
        ?.removeAttribute("hidden");
      choices.forEach((choice) => {
        choice.addEventListener("click", () => {
          const frame = frames.find(
            (item) => item.id === choice.getAttribute("aria-controls"),
          );
          if (frame && frame !== selected) select(frame, true);
        });
      });
    });
  gallery.dataset.recordingsReady = "true";
}
