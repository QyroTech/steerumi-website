import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseHTML } from "linkedom";

const dist = resolve("dist");
assert.ok(
  existsSync(resolve(dist, "index.html")),
  "Run npm run build before npm test.",
);
const { document } = parseHTML(
  readFileSync(resolve(dist, "index.html"), "utf8"),
);
const base =
  `/${(process.env.BASE_PATH || "/").split("/").filter(Boolean).join("/")}/`.replace(
    /^\/\/$/,
    "/",
  );
const sections = [
  "top",
  "teaser",
  "abstract",
  "umi-collection",
  "workflow",
  "results",
  "demonstrations",
  ...(document.getElementById("citation") ? ["citation"] : []),
];
const positions = [];
const allElements = [...document.querySelectorAll("*")];
for (const id of sections) {
  const section = document.getElementById(id);
  assert.ok(section, `Missing section: ${id}`);
  positions.push(allElements.indexOf(section));
}
assert.deepEqual(
  positions,
  [...positions].sort((a, b) => a - b),
  "Sections must follow the requested order.",
);
assert.equal(document.querySelectorAll("h1").length, 1);
const hero = document.getElementById("top");
assert.equal(
  hero.nextElementSibling?.id,
  "teaser",
  "The English project explainer must follow the title and resource links.",
);
assert.deepEqual(
  [...hero.children].map((node) => node.tagName),
  ["H1", "DIV"],
  "The hero must only contain the title and resource links.",
);
assert.deepEqual(
  [...hero.querySelectorAll(".resource-button")].map((node) =>
    node.textContent.trim().replace(/\s+/g, " "),
  ),
  ["arXiv", "Code", "BibTeX"],
);
assert.deepEqual(
  [...hero.querySelectorAll('.resource-button[aria-disabled="true"]')].map(
    (node) => node.textContent.trim(),
  ),
  ["arXiv", "Code"],
);
assert.equal(
  hero.querySelector("a.resource-button")?.getAttribute("href"),
  "#citation",
);
assert.equal(
  hero.querySelectorAll(
    ".eyebrow, .hero-tagline, .authors, .confidential-notice",
  ).length,
  0,
);
assert.equal(document.documentElement.getAttribute("data-theme"), "device");
const themeToggle = document.querySelector("[data-theme-toggle]");
assert.ok(themeToggle, "The navigation must offer a theme toggle.");
assert.equal(themeToggle.getAttribute("type"), "button");
assert.equal(themeToggle.getAttribute("aria-label"), "Dark mode");
assert.equal(themeToggle.getAttribute("aria-pressed"), "false");
assert.ok(document.querySelector("head script[data-theme-script]"));
// Content regression guard: keep the project page faithful to the supplied paper.
const researchText = document.querySelector("main")?.textContent ?? "";
assert.ok(
  !/32,518|57\.4M|531\.7|89-D|UMI-1|UMI-2|washing machine|laundry basket|clothes on a sofa|Household laundry gallery/i.test(
    researchText,
  ),
  "Non-paper research content must not appear on the page.",
);
const teaserVideo = document.querySelector("#teaser video[data-teaser-video]");
assert.ok(teaserVideo, "Missing opening project explainer.");
assert.equal(document.querySelector("#teaser figcaption"), null);
assert.equal(document.querySelector("main video"), teaserVideo);
assert.equal(
  teaserVideo.getAttribute("src"),
  `${base}videos/steerumi-en-explainer-v3.mp4`,
);
assert.equal(
  teaserVideo.getAttribute("poster"),
  `${base}images/steerumi-en-explainer-v3-poster.jpg`,
);
assert.ok(!teaserVideo.hasAttribute("autoplay"));
assert.ok(!teaserVideo.hasAttribute("loop"));
assert.equal(document.querySelector("#abstract h2")?.textContent, "Abstract");
assert.equal(document.querySelector("#abstract .eyebrow"), null);
const abstractText = document.querySelector("#abstract .abstract-text");
assert.ok(abstractText);
assert.deepEqual(
  [...abstractText.querySelectorAll("strong")].map((node) => node.textContent),
  ["SteerUMI", "28.6%", "33.3%"],
);
assert.match(abstractText.innerHTML, /We present <strong>SteerUMI<\/strong>,/);
assert.equal(document.getElementById("overview"), null);
assert.equal(document.getElementById("method"), null);
assert.equal(document.getElementById("dataset"), null);
const workflow = document.getElementById("workflow");
assert.ok(workflow);
assert.equal(
  workflow.querySelector(".eyebrow")?.textContent,
  "02 / Automated Policy Iteration",
);
assert.equal(
  workflow.querySelector("h2")?.textContent,
  "From distributed collection to auto-training",
);
assert.equal(workflow.querySelector(".section-heading .section-intro"), null);
assert.equal(
  document.querySelector("#results .eyebrow")?.textContent,
  "03 / Experiments",
);
assert.equal(document.querySelector("#results .section-heading .section-intro"), null);
if (document.getElementById("citation")) {
  assert.equal(
    document.querySelector("#citation .eyebrow")?.textContent,
    "04 / Citation",
  );
}
assert.deepEqual(
  [...document.querySelectorAll(".nav-links a")].map((link) => [
    link.getAttribute("href"),
    link.textContent,
  ]),
  [
    ["#umi-collection", "SteerUMI Collection"],
    ["#workflow", "Automated Policy Iteration"],
    ["#results", "Experiments"],
  ],
);
assert.ok(document.querySelector("#results #demonstrations"));
const workflowGallery = workflow.querySelector("#workflow-videos");
assert.equal(workflowGallery?.previousElementSibling?.classList.contains("section-heading"), true);
const roundSteps = workflowGallery?.nextElementSibling?.querySelector(".round-steps");
assert.ok(roundSteps);
assert.deepEqual(
  [...roundSteps.querySelectorAll("h4")].map((heading) => heading.textContent),
  ["Collect in parallel", "Upload & check", "Train at the data quota", "Redeploy & repeat"],
);
const stepsSection = roundSteps.closest(".workflow-subsection");
assert.equal(stepsSection.querySelector("h3")?.textContent, "What happens between rounds");
const figureSection = stepsSection.nextElementSibling;
assert.ok(figureSection?.matches(".workflow-subsection"));
const workflowFigureTitle = figureSection.querySelector("h3");
assert.equal(workflowFigureTitle.textContent, "Cloud-Edge workflow");
const workflowFigure = workflowFigureTitle.nextElementSibling;
assert.ok(workflowFigure?.matches("figure.research-figure"));
assert.equal(workflowFigure.closest("details, [hidden]"), null);
assert.equal(workflowFigure.querySelector("figcaption"), null);
assert.equal(workflowFigure.querySelector("[data-lightbox]")?.getAttribute("data-caption"), "");
assert.equal(workflow.querySelectorAll(".research-figure").length, 1);
const tasks = [
  ["fold-clothes", "Folding clothes"],
  ["fold-towels", "Folding towels"],
  ["stack-cubes", "Stacking cubes"],
  ["clean-up", "Cleaning up a table"],
  ["cap-pen", "Capping a pen"],
];
const photoFiles = [
  "folding-clothes",
  "folding-towels",
  "stacking-cubes",
  "cleaning-table",
  "capping-pen",
];
const robotSpeedLabels = ["25×", "20×", "5×", "20×", "5×"];
const umi = document.querySelector("#umi-collection [data-umi-gallery]");
const robots = document.getElementById("robot-demonstrations");
assert.ok(umi && robots);
const umiOverview = umi.previousElementSibling;
assert.ok(umiOverview?.classList.contains("umi-collection-overview"));
const umiTrack = umi.parentElement;
assert.ok(umiTrack?.classList.contains("umi-aligned-track"));
assert.deepEqual([...umiTrack.children], [umiOverview, umi]);
const umiMedia = umiTrack.closest(".umi-aligned-media");
assert.ok(umiMedia);
assert.equal(umiMedia.getAttribute("tabindex"), "0");
const umiHeading = umiMedia.previousElementSibling?.querySelector(".section-heading");
assert.ok(umiHeading);
assert.equal(umiHeading.querySelector(".section-intro"), null);
assert.doesNotMatch(
  umiMedia.textContent,
  /First-person demonstrations|5 tasks · 15 recordings/,
);
const umiCollectionFigure = umiOverview.querySelector("figure");
assert.match(
  umiCollectionFigure.querySelector("a[data-lightbox]").getAttribute("href"),
  /steerumi-umi-collection\./,
);
assert.match(umiCollectionFigure.querySelector("img").getAttribute("src"), /\.webp$/);
assert.equal(umiCollectionFigure.querySelector("figcaption"), null);
assert.equal(
  umiCollectionFigure.querySelector("a[data-lightbox]").getAttribute("data-caption"),
  "",
);
assert.doesNotMatch(
  document.getElementById("umi-collection").textContent,
  /Collection setup|Equipment and data notes/,
);
const umiDescription = umiMedia.nextElementSibling;
assert.ok(umiDescription?.classList.contains("umi-description"));
const umiTopics = [...umiDescription.children];
assert.deepEqual(
  umiTopics.map((topic) => topic.querySelector("h3")?.textContent.trim()),
  ["OOD Detection", "AR-Guided Collection"],
);
for (const topic of umiTopics) {
  assert.deepEqual([...topic.children].map((node) => node.tagName), ["H3", "P"]);
}
assert.deepEqual(
  umiTopics.map((topic) => [topic.getAttribute("data-topic"), topic.querySelector("p").textContent.trim()]),
  [
    ["ood", "Identify the policy's weaknesses in real-time to enable targeted data collection."],
    ["ar", "Guide operators to collect policy-aligned demonstrations that address these weak spots."],
  ],
);
assert.equal(
  document.querySelector("#umi-collection .eyebrow")?.textContent,
  "01 / SteerUMI Collection",
);
assert.ok(document.querySelector('.nav-links a[href="#umi-collection"]'));
assert.equal(umi.querySelector("[data-task-list], [data-task-panel]"), null);
assert.deepEqual(
  [...umi.querySelectorAll(".umi-card h3")].map((heading) =>
    heading.textContent.trim(),
  ),
  tasks.map(([, title]) => title),
);
assert.equal(umi.querySelectorAll(".umi-card").length, tasks.length);
assert.equal(umi.querySelectorAll("a[data-umi-take]").length, 15);
assert.equal(umi.querySelectorAll("a[data-lightbox]").length, 10);
assert.equal(umi.querySelectorAll("video").length, tasks.length);
assert.equal(umi.querySelectorAll("video[src]").length, 0);
assert.ok(robots.classList.contains("robot-grid"));
assert.equal(robots.querySelectorAll(".robot-card").length, tasks.length);
assert.equal(robots.querySelectorAll("video").length, tasks.length);
assert.equal(
  robots.querySelectorAll("[data-clip-button], [data-task-button]").length,
  0,
);
assert.equal(document.querySelectorAll("[data-recording-pending]").length, 0);
for (const control of document.querySelectorAll(
  "[data-task-button], [data-clip-button]",
)) {
  assert.equal(control.getAttribute("type"), "button");
  assert.ok(document.getElementById(control.getAttribute("aria-controls")));
}
for (const [index, [task, title]] of tasks.entries()) {
  const card = umi.querySelector(`#umi-collection-${task}-card`);
  assert.ok(
    card && !card.hasAttribute("hidden"),
    `Missing UMI card for ${task}`,
  );
  const play = card.querySelector("a[data-umi-play]:not([hidden])");
  assert.ok(play, `Missing play cover for ${task}`);
  assert.equal(
    play.getAttribute("href"),
    `${base}videos/${task}-collection-v2.mp4`,
  );
  const collection = card.querySelector("video[hidden]");
  assert.ok(collection, `Controls must remain hidden until ${task} is played`);
  assert.ok(!collection.hasAttribute("data-src"));
  const recordingIds = [
    `${task}-collection-v2`,
    `${task}-collection-take-02`,
    `${task}-collection-${["stack-cubes", "cap-pen"].includes(task) ? "source" : "take-03"}`,
  ];
  const posters = recordingIds.map(
    (id) => `${base}images/umi-collection/ar/${id}.webp`,
  );
  assert.equal(collection.getAttribute("poster"), posters[0]);
  assert.equal(play.querySelector("img")?.getAttribute("src"), posters[0]);
  const takes = [...card.querySelectorAll("a[data-umi-take]")];
  assert.deepEqual(
    takes.map((take) => take.getAttribute("data-umi-take")),
    ["Recording 1", "Recording 2", "Recording 3"],
  );
  assert.deepEqual(
    takes.map((take) => take.getAttribute("href")),
    recordingIds.map((id) => `${base}videos/${id}.mp4`),
  );
  assert.deepEqual(takes.map((take) => take.getAttribute("data-poster")), posters);
  assert.equal(card.querySelector("[data-umi-label]")?.textContent, "Recording 1");
  assert.deepEqual(
    takes.map((take) => take.getAttribute("aria-current")),
    ["true", null, null],
  );
  for (const take of takes) {
    assert.equal(take.getAttribute("aria-controls"), collection.id);
    assert.match(take.getAttribute("data-duration") ?? "", /^\d+:\d{2}$/);
  }
  const photos = [...card.querySelectorAll(".umi-photos a[data-lightbox]")];
  assert.equal(card.querySelector(".umi-photos figcaption"), null);
  assert.ok(photos.every((photo) => !photo.getAttribute("data-caption")));
  assert.deepEqual(
    photos.map((photo) => photo.getAttribute("href")),
    [
      `${base}images/parallel-umi/${photoFiles[index]}.webp`,
      `${base}images/parallel-umi/${photoFiles[index]}-02.webp`,
    ],
  );
  const robotCard = robots.querySelector(`#robot-demonstrations-${task}-panel`);
  assert.ok(robotCard && !robotCard.hasAttribute("hidden"));
  assert.equal(robotCard.querySelector("h4")?.textContent.trim(), title);
  assert.equal(robotCard.querySelector("figcaption"), null);
  assert.equal(
    robotCard.querySelector(".robot-frame .robot-speed[hidden]")?.textContent.trim(),
    robotSpeedLabels[index],
  );
  const robotCover = robotCard.querySelector("a[data-robot-play]:not([hidden])");
  const robotVideo = robotCard.querySelector("video[hidden]");
  assert.ok(robotCover && robotVideo);
  assert.match(robotCover.getAttribute("aria-label"), /× speed$/);
  assert.match(robotVideo.getAttribute("aria-label"), /× speed$/);
  assert.ok(
    !robotVideo.hasAttribute("src") && !robotVideo.hasAttribute("data-src"),
  );
  assert.equal(
    robotCover.getAttribute("href"),
    `${base}videos/robot-highlights/${task}-robot.mp4`,
  );
  const robotPoster = `${base}images/robot-highlights/${task}-robot.jpg`;
  assert.equal(robotVideo.getAttribute("poster"), robotPoster);
  const robotCoverImage = robotCover.querySelector("img");
  assert.equal(robotCoverImage?.getAttribute("src"), robotPoster);
  assert.equal(robotCoverImage.getAttribute("width"), "640");
  assert.equal(robotCoverImage.getAttribute("height"), "480");
}
assert.equal(
  document.querySelectorAll(
    ".media-placeholder, [data-video-placeholder], .figure-hint",
  ).length,
  0,
  "Generic placeholder notices must not appear.",
);
assert.ok(
  !/Link pending|Video to be added|Figure to be added|will be added locally|to be added after \w+|Copyright information to be added|Confidential (?:\w+ )?copy|Author information withheld/.test(
    document.body.textContent,
  ),
  "Editorial and missing-content notices must not appear on the page.",
);
const robotSection = document.querySelector("#results #demonstrations");
const robotTestsHeading = robotSection.querySelector("h3#robot-tests-heading");
assert.equal(robotTestsHeading?.textContent, "Real-robot tests");
assert.equal(robotSection.getAttribute("aria-labelledby"), robotTestsHeading.id);
assert.deepEqual([...robotSection.children], [robotTestsHeading, robots]);

const results = document.getElementById("results");
assert.equal(document.querySelector("main > #demonstrations"), null);
assert.deepEqual(
  [...results.querySelectorAll(":scope > .section-shell > section")].map(
    (section) => section.id,
  ),
  ["demonstrations", "main-experiment", "repeatability", "hg-dagger-comparison", "ar-ablation"],
);
const experimentHeadings = [...results.querySelectorAll(".experiment-block > h3")];
assert.deepEqual(
  experimentHeadings.map((heading) => heading.textContent.trim()),
  [
    "Experiment 1: SteerUMI vs. conventional UMI",
    "Experiment 2: Repeatability across two independent runs",
    "Experiment 3: Comparison with real-robot HG-DAgger",
    "Experiment 4: AR guidance ablation",
  ],
);
assert.doesNotMatch(results.textContent, /\b03\.[1-4]\b/);
for (const heading of experimentHeadings) {
  assert.equal(heading.parentElement.getAttribute("aria-labelledby"), heading.id);
}
const mainExperiment = results.querySelector("#main-experiment");
assert.equal(mainExperiment.querySelectorAll("figure").length, 1);
const mainTpsFigure = mainExperiment.querySelector(".main-tps-scroll figure");
assert.ok(mainTpsFigure);
assert.match(
  mainTpsFigure.querySelector("a[data-lightbox]").getAttribute("href"),
  /steerumi-task-progress-main\./,
);
assert.equal(mainExperiment.querySelector(".experiment-intro"), null);
assert.equal(mainTpsFigure.querySelector("figcaption"), null);
assert.equal(mainTpsFigure.querySelector("[data-lightbox]").getAttribute("data-caption"), "");
const mainTpsNote = mainTpsFigure.closest(".main-tps-scroll").nextElementSibling;
assert.ok(mainTpsNote?.matches(".results-curve-note"));
assert.equal(mainTpsNote.querySelector("strong")?.textContent, "28.6%");
assert.equal(
  mainTpsNote.textContent.trim().replace(/\s+/g, " "),
  "Both methods start from the same base policy and use the same number of training demonstrations per round. SteerUMI achieves an average improvement of 28.6% in final TPS across the five tasks.",
);
assert.doesNotMatch(mainExperiment.textContent, /range of two runs/i);
assert.equal(
  mainExperiment.querySelector("#final-tps-heading")?.textContent.trim(),
  "Final-round TPS data",
);
const finalTpsTable = mainExperiment.querySelector(".results-details table");
assert.ok(finalTpsTable);
assert.equal(finalTpsTable.closest("details, [hidden]"), null);
const finalTpsRows = [...finalTpsTable.querySelectorAll("tbody tr")];
assert.equal(finalTpsRows.length, tasks.length);
for (const row of finalTpsRows) {
  const cells = [...row.querySelectorAll("td")];
  assert.ok(cells[2].querySelector("strong"));
  assert.equal(cells[1].querySelector("strong"), null);
}
const cleanUpRow = finalTpsRows.find(
  (row) => row.querySelector("th")?.textContent.trim() === "Clean up table",
);
assert.deepEqual(
  [...cleanUpRow.querySelectorAll("td")].map((cell) => cell.textContent.trim()),
  ["4", "0.74", "0.84"],
);
assert.equal(finalTpsTable.querySelector("caption"), null);
assert.equal(mainExperiment.querySelector(".results-note"), null);
const repeatability = results.querySelector("#repeatability");
assert.match(repeatability.textContent, /independently collected/);
const repeatabilityCopy = repeatability.querySelector(".repeatability-copy");
assert.equal(
  repeatabilityCopy.querySelector("p:last-child strong")?.textContent,
  "Both runs improve over the base policy and follow similar learning curves.",
);
assert.match(repeatabilityCopy.querySelector("p:last-child").textContent, /similar\s+learning\s+curves\.[\s\S]*not a confidence interval/);
const repeatabilityAsset = "images/results/tps-stack-cubes-repeatability.svg";
const repeatabilityLink = repeatability.querySelector("figure a[data-lightbox]");
assert.equal(
  repeatabilityLink.getAttribute("href"),
  `${base}${repeatabilityAsset}`,
);
const repeatabilityImage = repeatabilityLink.querySelector("img");
assert.equal(
  repeatabilityImage.getAttribute("src"),
  `${base}${repeatabilityAsset}`,
);
const { document: repeatabilityDocument } = parseHTML(
  readFileSync(resolve(dist, repeatabilityAsset), "utf8"),
);
const repeatabilitySvg = repeatabilityDocument.querySelector("svg");
for (const dimension of ["width", "height"]) {
  assert.equal(
    repeatabilityImage.getAttribute(dimension),
    repeatabilitySvg.getAttribute(dimension),
  );
}
const [, , plotWidth, plotHeight] = repeatabilitySvg
  .getAttribute("viewBox")
  .split(/\s+/)
  .map(Number);
assert.equal(
  plotWidth * Number(repeatabilitySvg.getAttribute("height")),
  plotHeight * Number(repeatabilitySvg.getAttribute("width")),
);
assert.equal(
  repeatabilitySvg.getAttribute("preserveAspectRatio"),
  "xMidYMid meet",
);
assert.deepEqual(
  [...repeatabilitySvg.querySelectorAll('[data-axis="round"] text')].map(
    (label) => label.textContent,
  ),
  ["Base", "R1", "R2", "R3", "R4"],
);
const tpsTicks = [...repeatabilitySvg.querySelectorAll('[data-axis="tps"] text')];
assert.deepEqual(tpsTicks.map((label) => label.textContent), ["100", "80", "60", "40"]);
const tpsAxisTitle = repeatabilitySvg.querySelector('[data-axis-title="tps"]');
assert.equal(tpsAxisTitle?.textContent, "Task Progress Score (TPS, %)");
assert.match(tpsAxisTitle?.getAttribute("transform") ?? "", /rotate\(-90\)/);
const rangeBand = repeatabilitySvg.querySelector(
  'polygon[data-series="two-run-range"]',
);
assert.equal(rangeBand?.getAttribute("fill"), "#94bbea");
assert.equal(rangeBand.hasAttribute("opacity"), false);
assert.equal(repeatabilitySvg.querySelectorAll('polyline[data-series^="run-"]').length, 2);
const arAblation = results.querySelector("#ar-ablation");
const arTable = arAblation.querySelector("table#ar-ablation-table.results-ar-summary");
assert.ok(arTable);
assert.equal(arAblation.querySelectorAll("table").length, 1);
assert.equal(arAblation.querySelector("details"), null);
assert.deepEqual(
  [...arTable.querySelectorAll("thead th")].map((cell) => cell.textContent.trim()),
  ["Task", "Starting model", "OOD only (AR off)", "OOD + AR"],
);
assert.deepEqual(
  [...arTable.querySelectorAll("tbody tr")].map((row) =>
    [
      row.querySelector("th").textContent.trim(),
      ...[...row.querySelectorAll("td")].map((cell) => [
        cell.firstElementChild.textContent.trim(),
        cell.querySelector(".ar-tps").textContent.trim(),
      ]),
    ],
  ),
  [
    ["Fold clothes", ["80% SR", "84.5 TPS"], ["40% SR", "67.5 TPS"], ["90% SR", "91.5 TPS"]],
    ["Stack cubes", ["40% SR", "74 TPS"], ["15% SR", "70 TPS"], ["55% SR", "85 TPS"]],
  ],
);
assert.equal(arTable.querySelectorAll("tbody td:not(:last-child) strong").length, 0);
assert.equal(arTable.querySelectorAll("tbody td:last-child strong").length, 2);
assert.match(arAblation.querySelector("p").textContent, /same OOD detector/);
const comparisonSection = results.querySelector("#hg-dagger-comparison");
const comparison = comparisonSection.querySelector(".results-comparison");
assert.equal(comparisonSection.querySelector(".experiment-intro"), null);
assert.equal(comparison.querySelector("figcaption"), null);
const comparisonCopy = comparison.nextElementSibling;
assert.ok(comparisonCopy.matches(".experiment-copy"));
assert.deepEqual(
  [...comparisonCopy.querySelectorAll(":scope > p strong")].map((el) => el.textContent),
  ["3.0 TPS points", "33.3%"],
);
assert.deepEqual(
  [...comparisonCopy.querySelectorAll(".results-time-list dd")].map((el) => el.textContent.trim()),
  ["≈100 min", "≈150 min"],
);
assert.ok(
  comparison
    .querySelector("a[data-lightbox] img")
    ?.getAttribute("sizes")
    ?.endsWith("560px"),
);

assert.ok(document.querySelector("main"));
assert.ok(document.querySelector("footer"));
assert.ok(document.querySelector("#image-lightbox"));
const citation = document.getElementById("citation");
assert.ok(citation, "The citation section must remain available.");
assert.equal(citation.querySelector("h2"), null, "No duplicate BibTeX heading.");
const code = citation.querySelector("#bibtex-content");
const bibtex = code?.textContent;
assert.ok(bibtex, "BibTeX must be displayed.");
assert.match(bibtex, /^@misc\{xu2026steerumi,/);
assert.equal(code.closest("pre")?.textContent, bibtex, "No extra code-block indentation.");
assert.match(bibtex, /title\s*=\s*\{\{SteerUMI\}: Robot-Free Human-in-the-Loop Post-Training on Distributed \{UMI\} Devices\}/);
assert.match(bibtex, /year\s*=\s*\{2026\}/);
assert.ok(citation.querySelector("[data-copy-citation]"));
const citationAuthors = bibtex.match(/author\s*=\s*\{([^}]+)\}/)?.[1];
assert.ok(citationAuthors, "BibTeX must include authors.");
assert.equal(
  citationAuthors.trim().split(/\s+and\s+/).length,
  15,
  "BibTeX must display all 15 authors.",
);

const ids = [...document.querySelectorAll("[id]")].map((node) => node.id);
assert.equal(new Set(ids).size, ids.length, "HTML ids must be unique.");
for (const anchor of document.querySelectorAll('a[href^="#"]')) {
  assert.ok(
    document.getElementById(anchor.getAttribute("href").slice(1)),
    `Broken anchor: ${anchor.getAttribute("href")}`,
  );
}
const localAsset = (path) => {
  if (!path || /^(?:https?:|mailto:|tel:|data:|#)/i.test(path)) return;
  assert.ok(path.startsWith(base), `Asset lacks base path ${base}: ${path}`);
  const local = decodeURIComponent(path.slice(base.length).split(/[?#]/)[0]);
  assert.ok(existsSync(resolve(dist, local)), `Missing built asset: ${path}`);
};
for (const cover of umi.querySelectorAll("a[data-umi-play], a[data-umi-take]")) {
  localAsset(cover.getAttribute("href"));
}
for (const take of umi.querySelectorAll("a[data-umi-take]")) {
  localAsset(take.getAttribute("data-poster"));
}
for (const link of robots.querySelectorAll("a[data-robot-play]")) {
  localAsset(link.getAttribute("href"));
}
for (const node of document.querySelectorAll(
  "img[src], video[src], script[src], link[rel=stylesheet], link[rel=icon]",
)) {
  localAsset(node.getAttribute("src") || node.getAttribute("href"));
}
for (const node of document.querySelectorAll("[srcset]")) {
  for (const item of node.getAttribute("srcset").split(","))
    localAsset(item.trim().split(/\s+/)[0]);
}
for (const node of document.querySelectorAll("[data-lightbox]")) {
  localAsset(node.getAttribute("href"));
  assert.ok(node.querySelector("img")?.getAttribute("alt"));
}
for (const video of document.querySelectorAll("video")) {
  localAsset(video.getAttribute("data-src"));
  localAsset(video.getAttribute("poster") || video.getAttribute("data-poster"));
  assert.ok(video.hasAttribute("controls"));
  if (video !== teaserVideo) assert.ok(video.hasAttribute("muted"));
  assert.ok(video.hasAttribute("playsinline"));
  assert.equal(video.getAttribute("preload"), "none");
}
const pipelineVideo = document.querySelector(
  "#workflow #workflow-videos-online-steerumi-dagger",
);
assert.ok(
  pipelineVideo,
  "The online DAgger recording belongs in the workflow section.",
);
assert.equal(
  document.querySelector("#workflow-videos-online-pipeline-title")?.textContent,
  "Online DAgger-style training pipeline",
);
assert.equal(
  pipelineVideo.getAttribute("aria-label"),
  "Online DAgger-style training pipeline",
);
assert.equal(
  pipelineVideo.getAttribute("data-src"),
  `${base}videos/online-steerumi-dagger-58s.mp4`,
);
assert.equal(
  pipelineVideo.getAttribute("data-poster"),
  `${base}images/online-steerumi-dagger-58s-poster.jpg`,
);
assert.ok(!pipelineVideo.hasAttribute("loop"));
assert.equal(pipelineVideo.closest("figure").querySelector("figcaption"), null);
assert.equal(
  document.querySelectorAll(
    "[data-play-all], [data-pause-all], [data-group-select], .gallery-toolbar",
  ).length,
  0,
  "Bulk playback controls and group selection must not appear.",
);
assert.equal(
  document.querySelectorAll("iframe").length,
  0,
  "No external embedded players.",
);
if (process.env.REQUIRE_PUBLICATION_READY === "1") {
  assert.ok(
    !document.querySelector('meta[name="robots"][content*="noindex"]'),
    "Confidential content: publication is blocked.",
  );
  assert.ok(
    !document.querySelector("[data-publication-blocker]"),
    "Citation drafts remain: publication is blocked.",
  );
}
console.log(
  `PASS: section order, anchors, asset paths (${base}), lightbox, citation, lazy videos, and native playback controls.`,
);
