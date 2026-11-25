import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { parseHTML } from "linkedom";

const html = readFileSync("dist/index.html", "utf8");

function page({
  dark = false,
  saved,
  blockRead = false,
  blockWrite = false,
} = {}) {
  const { document, window: dom } = parseHTML(html);
  const values = saved instanceof Map ? saved : new Map();
  if (typeof saved === "string") values.set("steerumi-theme", saved);
  const mediaListeners = new Map();
  const windowListeners = new Map();
  const media = {
    matches: dark,
    addEventListener: (type, callback) => mediaListeners.set(type, callback),
  };
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      if (blockWrite) throw new Error("Storage writes blocked");
      values.set(key, value);
    },
  };
  const window = {
    matchMedia: () => media,
    addEventListener: (type, callback) => windowListeners.set(type, callback),
    get localStorage() {
      if (blockRead) throw new Error("Storage access blocked");
      return storage;
    },
  };
  const script = document.querySelector("head script[data-theme-script]");
  assert.ok(script, "Theme initialization must run in the head before paint.");
  runInNewContext(script.textContent, { document, window });
  const beforeReady = document.documentElement.dataset.theme;
  document.dispatchEvent(new dom.Event("DOMContentLoaded"));
  const button = document.querySelector("[data-theme-toggle]");
  assert.equal(button.hidden, false);
  return {
    document,
    button,
    values,
    beforeReady,
    theme: () => document.documentElement.dataset.theme,
    click: () => button.dispatchEvent(new dom.Event("click")),
    changeSystem: (value) => {
      media.matches = value;
      mediaListeners.get("change")();
    },
    storageEvent: (key, newValue) =>
      windowListeners.get("storage")({ key, newValue }),
  };
}

test("defaults to the system theme before DOM ready and follows system changes", () => {
  const app = page({ dark: true });
  assert.equal(app.beforeReady, "dark");
  assert.equal(app.button.getAttribute("aria-pressed"), "true");
  assert.equal(app.button.title, "Switch to light mode");
  assert.equal(
    app.document.querySelector('meta[name="theme-color"]').content,
    "#111722",
  );
  app.changeSystem(false);
  assert.equal(app.theme(), "light");
  assert.equal(app.button.getAttribute("aria-pressed"), "false");
});

test("the toggle persists a choice across reloads and overrides the system", () => {
  const app = page();
  app.click();
  assert.equal(app.theme(), "dark");
  assert.equal(app.values.get("steerumi-theme"), "dark");
  app.changeSystem(false);
  assert.equal(app.theme(), "dark");
  const reloaded = page({ saved: app.values });
  assert.equal(reloaded.beforeReady, "dark");
  reloaded.click();
  assert.equal(reloaded.theme(), "light");
  assert.equal(reloaded.values.get("steerumi-theme"), "light");
});

test("a saved light preference wins over an OS dark preference", () => {
  const app = page({ dark: true, saved: "light" });
  assert.equal(app.beforeReady, "light");
  app.changeSystem(true);
  assert.equal(app.theme(), "light");
});

test("invalid stored preferences fall back to the system", () => {
  assert.equal(page({ dark: true, saved: "invalid" }).theme(), "dark");
});

test("switching still works when storage reads or writes are blocked", () => {
  for (const options of [{ blockRead: true }, { blockWrite: true }]) {
    const app = page(options);
    app.click();
    assert.equal(app.theme(), "dark");
    app.click();
    assert.equal(app.theme(), "light");
  }
});

test("theme changes in other tabs are applied without reacting to unrelated keys", () => {
  const app = page({ dark: true });
  app.storageEvent("other-key", "light");
  assert.equal(app.theme(), "dark");
  app.storageEvent("steerumi-theme", "light");
  assert.equal(app.theme(), "light");
  app.storageEvent("steerumi-theme", null);
  assert.equal(app.theme(), "dark");
  app.storageEvent("steerumi-theme", "light");
  app.storageEvent(null, null);
  assert.equal(app.theme(), "dark");
});
