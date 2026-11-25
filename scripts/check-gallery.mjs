import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { parseHTML } from "linkedom";
import ts from "typescript";

const clips = {
  "fold-clothes": ["fold-clothes-collection"],
  "stack-cubes": [
    "stack-cubes-collection",
    "stack-cubes-collection-alternate",
    "stack-cubes-collection-source",
  ],
  "clean-up": ["clean-up-collection"],
  "cap-pen": [
    "cap-pen-collection-01",
    "cap-pen-collection-02",
    "cap-pen-collection-source",
  ],
};
const html = `<html><body><div data-task-gallery data-recording-gallery>
  <div data-task-list hidden>${Object.keys(clips)
    .map(
      (task) =>
        `<button type="button" data-task-button id="robot-demonstrations-${task}-tab" aria-controls="robot-demonstrations-${task}-panel">${task}</button>`,
    )
    .join("")}</div>
  ${Object.entries(clips)
    .map(
      ([
        task,
        videos,
      ]) => `<section data-task-panel data-recording-panel id="robot-demonstrations-${task}-panel">
    <div data-clip-list hidden>${videos.map((id) => `<button type="button" data-clip-button aria-controls="robot-demonstrations-${id}-frame"></button>`).join("")}</div>
    ${videos.map((id) => `<figure data-clip-frame id="robot-demonstrations-${id}-frame"><video id="robot-demonstrations-${id}" data-src="/videos/${id}.mp4"></video></figure>`).join("")}
  </section>`,
    )
    .join("")}
</div></body></html>`;
const compiled = ts.transpileModule(
  readFileSync("src/scripts/task-gallery.ts", "utf8"),
  {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
    },
  },
).outputText;
const exports = {};
runInNewContext(compiled, { exports });
const { initTaskGallery, initRecordingGrid } = exports;

function page(mode = "tasks") {
  const { document, window } = parseHTML(html);
  const gallery = document.querySelector(
    "[data-task-gallery], [data-recording-gallery]",
  );
  const media = new Map();
  for (const video of gallery.querySelectorAll("video")) {
    const state = { pauses: 0, loads: 0 };
    media.set(video.id, state);
    video.pause = () => state.pauses++;
    video.load = () => state.loads++;
  }
  const hydrated = [];
  const hydrate = (video) => {
    hydrated.push(video.id);
    video.setAttribute("src", video.dataset.src);
  };
  const buttons = [...gallery.querySelectorAll("[data-task-button]")];
  const panels =
    mode === "tasks"
      ? [...gallery.querySelectorAll("[data-task-panel]")]
      : [...gallery.querySelectorAll("[data-recording-panel]")].filter(
          (panel) => panel.querySelector("video"),
        );
  const click = (element) =>
    element.dispatchEvent(new window.Event("click", { bubbles: true }));
  const key = (element, value) => {
    const event = new window.Event("keydown", {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(event, "key", { value });
    element.dispatchEvent(event);
  };
  return {
    document,
    gallery,
    media,
    hydrated,
    buttons,
    panels,
    click,
    key,
    init: () =>
      mode === "tasks"
        ? initTaskGallery(gallery, hydrate)
        : initRecordingGrid(gallery, hydrate),
  };
}

test("initialization exposes one task/recording without eager media loading", () => {
  const app = page();
  assert.ok(app.panels.every((panel) => !panel.hidden));
  app.init();
  assert.equal(app.gallery.querySelector("[data-task-list]").hidden, false);
  assert.equal(app.buttons[0].getAttribute("role"), "tab");
  assert.deepEqual(
    app.panels.map((panel) => panel.hidden),
    [false, true, true, true],
  );
  assert.deepEqual(
    app.buttons.map((button) => button.getAttribute("tabindex")),
    ["0", "-1", "-1", "-1"],
  );
  assert.equal(app.gallery.querySelectorAll("video[src]").length, 0);
  assert.deepEqual(app.hydrated, []);
});

test("task changes bind only the selected recording and unload the previous one", () => {
  const app = page();
  app.init();
  app.click(app.buttons[1]);
  const first = app.document.getElementById(
    "robot-demonstrations-stack-cubes-collection",
  );
  assert.ok(first.hasAttribute("src"));
  app.click(app.buttons[3]);
  assert.equal(first.hasAttribute("src"), false);
  assert.equal(app.media.get(first.id).loads, 1);
  assert.ok(app.media.get(first.id).pauses > 0);
  assert.equal(app.gallery.querySelectorAll("video[src]").length, 1);
  assert.equal(app.buttons[3].getAttribute("aria-selected"), "true");
});

test("recording choices update visibility and retain the selected version per task", () => {
  const app = page();
  app.init();
  app.click(app.buttons[1]);
  const choices = [...app.panels[1].querySelectorAll("[data-clip-button]")];
  app.click(choices[1]);
  assert.deepEqual(
    choices.map((choice) => choice.getAttribute("aria-pressed")),
    ["false", "true", "false"],
  );
  assert.deepEqual(
    [...app.panels[1].querySelectorAll("[data-clip-frame]")].map(
      (frame) => frame.hidden,
    ),
    [true, false, true],
  );
  app.click(app.buttons[3]);
  app.click(app.buttons[1]);
  assert.equal(choices[1].getAttribute("aria-pressed"), "true");
  assert.ok(
    app.document
      .getElementById("robot-demonstrations-stack-cubes-collection-alternate")
      .hasAttribute("src"),
  );
  assert.equal(app.gallery.querySelectorAll("video[src]").length, 1);
});

test("Arrow keys, Home and End navigate task tabs with a single tab stop", () => {
  const app = page();
  app.init();
  app.key(app.buttons[0], "ArrowLeft");
  assert.equal(app.buttons[3].getAttribute("aria-selected"), "true");
  app.key(app.buttons[3], "ArrowRight");
  assert.equal(app.buttons[0].getAttribute("aria-selected"), "true");
  app.key(app.buttons[0], "End");
  assert.equal(app.buttons[3].getAttribute("tabindex"), "0");
  app.key(app.buttons[3], "Home");
  assert.equal(app.buttons[0].getAttribute("tabindex"), "0");
  assert.equal(
    app.buttons.filter((button) => button.getAttribute("tabindex") === "0")
      .length,
    1,
  );
});

test("initializing twice does not duplicate handlers", () => {
  const app = page();
  app.init();
  app.init();
  app.click(app.buttons[1]);
  assert.deepEqual(app.hydrated, [
    "robot-demonstrations-stack-cubes-collection",
  ]);
});

test("recording grids preserve one visible clip per task without eager loading", () => {
  const app = page("recordings");
  app.init();
  assert.equal(app.gallery.querySelectorAll("video[src]").length, 0);
  assert.ok(
    app.panels.every(
      (panel) =>
        [...panel.querySelectorAll("[data-clip-frame]")].filter(
          (frame) => !frame.hidden,
        ).length === 1,
    ),
  );
});

test("recording selection does not stop another task's video", () => {
  const app = page("recordings");
  app.init();
  const other = app.panels[3].querySelector("video");
  other.setAttribute("src", other.dataset.src);
  const pauses = app.media.get(other.id).pauses;
  const choices = [...app.panels[1].querySelectorAll("[data-clip-button]")];
  app.click(choices[1]);
  assert.equal(app.media.get(other.id).pauses, pauses);
  assert.ok(other.hasAttribute("src"));
  assert.equal(choices[1].getAttribute("aria-pressed"), "true");
});

test("missing panel markup leaves the static fallback untouched", () => {
  const app = page();
  app.panels[0].remove();
  app.init();
  assert.equal(app.gallery.querySelector("[data-task-list]").hidden, true);
  assert.equal(app.gallery.dataset.taskReady, undefined);
  assert.deepEqual(app.hydrated, []);
});
