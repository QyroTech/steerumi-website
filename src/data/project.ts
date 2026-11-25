import type { ImageMetadata } from "astro";
import collectionOverview from "../assets/steerumi-umi-collection.webp";
import framework from "../assets/steerumi-framework.png";
import progress from "../assets/steerumi-task-progress-main.png";
import comparison from "../assets/steerumi-hg-dagger.png";

export interface Author {
  name: string;
  url?: string;
  affiliation?: string;
}
export interface ResourceLink {
  label: string;
  url?: string;
}
export interface ResearchFigure {
  image?: ImageMetadata | string;
  alt: string;
  caption: string;
  width?: number;
  height?: number;
}
type CollectionPhoto = Required<
  Pick<ResearchFigure, "image" | "width" | "height" | "alt" | "caption">
>;
export interface VideoItem {
  id: string;
  label: string;
  src?: string;
  poster?: string;
  caption?: string;
  durationSeconds?: number;
  aspectRatio?: "16 / 9" | "4 / 3" | "1 / 1";
  loop?: boolean;
  /** Human UMI collection (default) or real-robot execution. */
  source?: "umi" | "robot";
  /** Speed-up baked into the highlight, relative to its source footage. */
  speedUp?: number;
}
export interface VideoGroup {
  id: string;
  label: string;
  description?: string;
  columns: 2 | 3;
  sync: boolean;
  videos: VideoItem[];
}
export interface Project {
  name: string;
  title: string;
  tagline: string;
  description: string;
  confidential: boolean;
  authors: Author[];
  resources: ResourceLink[];
  navigation: { id: string; label: string }[];
  teaser: {
    video?: string;
    poster?: string;
    figure?: ResearchFigure;
    caption?: string;
  };
  abstract: string;
  umiCollection: {
    title: string;
    figure: ResearchFigure;
    topics: { id: "ood" | "ar"; title: string; text: string }[];
  };
  overview: {
    title: string;
    intro: string;
    figure?: ResearchFigure;
    contributions: { title: string; text: string }[];
  };
  dataset: {
    photoGroups: {
      id: string;
      photos: [CollectionPhoto, CollectionPhoto];
    }[];
  };
  workflow: {
    title: string;
    figure: ResearchFigure;
    steps: { title: string; text: string }[];
    videos: VideoGroup[];
  };
  results: {
    title: string;
    meanRelativeGain: string;
    progressFigure: ResearchFigure;
    repeatabilityFigure: ResearchFigure;
    comparisonFigure: ResearchFigure;
    collectionTimes: { method: string; minutes: number; ours?: boolean }[];
    finalScores: {
      id: string;
      task: string;
      rounds: number;
      conventional: string;
      steerumi: string;
    }[];
    ablations: {
      task: string;
      method: string;
      withAR: boolean;
      startSR: number;
      startTPS: number;
      afterSR: number;
      afterTPS: number;
    }[];
  };
  demonstrations: { groups: VideoGroup[] };
  citation: { isDraft: boolean; bibtex: string };
  footer: {
    team?: string;
    contact?: string;
    repository?: string;
    acknowledgment?: string;
    copyright?: string;
  };
}

const collectionVideo = (
  id: string,
  label: string,
  durationSeconds: number,
): VideoItem => ({
  id,
  label,
  durationSeconds,
  src: `videos/${id}.mp4`,
  poster: `images/umi-collection/ar/${id}.webp`,
  aspectRatio: "1 / 1",
});
const robotVideo = (id: string, speedUp: number): VideoItem => ({
  id,
  label: "Policy rollout",
  src: `videos/robot-highlights/${id}.mp4`,
  poster: `images/robot-highlights/${id}.jpg`,
  aspectRatio: "4 / 3",
  source: "robot",
  speedUp,
});
const collectionPhoto = (
  id: string,
  width: number,
  height: number,
  alt: string,
): CollectionPhoto => ({
  image: `images/parallel-umi/${id}.webp`,
  width,
  height,
  caption: "",
  alt,
});

// Edit this file to customize the active project page. Undefined URLs and media
// render placeholders.
export const project: Project = {
  name: "SteerUMI",
  title:
    "SteerUMI: Robot-Free Human-in-the-Loop Post-Training on Distributed UMI Devices",
  tagline: "Collect without robots. Learn with policy feedback.",
  description:
    "Robot-free, policy-guided VLA post-training with distributed UMI devices and augmented-reality guidance.",
  confidential: false,
  authors: [],
  resources: [
    { label: "arXiv" },
    { label: "Code" },
    { label: "BibTeX", url: "#citation" },
  ],
  navigation: [
    { id: "umi-collection", label: "SteerUMI Collection" },
    { id: "workflow", label: "Automated Policy Iteration" },
    { id: "results", label: "Experiments" },
  ],
  teaser: {
    video: "videos/steerumi-en-explainer-v3.mp4",
    poster: "images/steerumi-en-explainer-v3-poster.jpg",
  },
  abstract:
    "Adapting vision-language-action (VLA) models to a deployment requires demonstrations that cover the states the policy actually visits, yet robot-executed human-in-the-loop methods rely on costly physical policy rollouts. We present **SteerUMI**, a cloud-edge framework for robot-free, policy-guided post-training using distributed handheld Universal Manipulation Interface (UMI) devices. During collection, we take timestamp-aligned human–policy disagreement as a proxy for policy-specific challenging regions, referred to operationally as out-of-distribution (OOD) regions. Asynchronous evaluation provides feedback without pausing human collection, while augmented reality (AR) guidance encourages locally compatible corrective demonstrations. The collected data support automated DAgger-style iterative aggregation and policy updates. We evaluate five real-world dual-arm manipulation tasks using 2–8 devices per experiment within a deployment of over 50 UMI devices. With matched per-round episode counts, SteerUMI achieves a **28.6%** mean relative improvement in final-round Task Progress Score (TPS) over conventional UMI collection, averaged across the five tasks. On stack cubes, it narrows the gap to real-robot HG-DAgger to 3.0 TPS points after three rounds, and with one additional round it achieves a higher final TPS in less collection time, reducing per-round collection time by **33.3%** in our single-unit comparison.",
  umiCollection: {
    title: "Robot-free data collection",
    figure: {
      image: collectionOverview,
      alt: "Five SteerUMI task panels show operators folding clothes, folding towels, stacking cubes, cleaning up a table, and capping a pen. Each panel shows a cloud policy and operator examples that either trigger OOD detection and AR-guided correction or continue without intervention.",
      caption: "",
    },
    topics: [
      {
        id: "ood",
        title: "OOD Detection",
        text: "Identify the policy's weaknesses in real-time to enable targeted data collection.",
      },
      {
        id: "ar",
        title: "AR-Guided Collection",
        text: "Guide operators to collect policy-aligned demonstrations that address these weak spots.",
      },
    ],
  },
  overview: {
    title: "Human demonstrations, guided by the policy",
    intro:
      "A cloud-edge learning loop connects handheld human demonstrations to continuous policy improvement, without physical robot rollouts during post-training collection.",
    contributions: [
      {
        title: "Distributed, robot-free collection",
        text: "Handheld UMI devices share a cloud policy. Experiments use 2–8 devices within an overall deployment of more than 50 units, not 50 simultaneously active devices.",
      },
      {
        title: "Policy-aware corrective data",
        text: "Timestamp-aligned human–policy disagreement flags policy-specific challenging regions. Feedback does not interrupt ongoing human manipulation.",
      },
      {
        title: "AR-guided local exploration",
        text: "Operators see predicted trajectories and observation-time OOD markers to collect locally compatible corrections rather than unconstrained demonstrations.",
      },
      {
        title: "Iterative VLA post-training",
        text: "An automated pipeline mixes new OOD suffixes 1:1 with historical data, updates the policy, and evaluates it on five real-world dual-arm tasks.",
      },
    ],
  },
  dataset: {
    photoGroups: [
      {
        id: "fold-clothes",
        photos: [
          collectionPhoto(
            "folding-clothes",
            1080,
            1440,
            "At the start of clothes folding, the foreground operator reaches toward an unfolded blue shirt beside other UMI stations.",
          ),
          collectionPhoto(
            "folding-clothes-02",
            1080,
            1440,
            "A compact folded blue shirt rests on the foreground table while other UMI operators continue collecting.",
          ),
        ],
      },
      {
        id: "fold-towels",
        photos: [
          collectionPhoto(
            "folding-towels",
            1200,
            1600,
            "At the start of towel folding, the foreground operator reaches for a loose white towel at the table edge.",
          ),
          collectionPhoto(
            "folding-towels-02",
            1200,
            1600,
            "A folded white towel rests on the foreground table while neighboring operators continue their demonstrations.",
          ),
        ],
      },
      {
        id: "stack-cubes",
        photos: [
          collectionPhoto(
            "stacking-cubes",
            1600,
            1200,
            "Operators approach the cubes at their separate stations, with a red cube standing alone on the nearest table.",
          ),
          collectionPhoto(
            "stacking-cubes-02",
            1600,
            1200,
            "A blue cube is stacked on a red cube at the nearest station while the other operators continue collecting.",
          ),
        ],
      },
      {
        id: "clean-up",
        photos: [
          collectionPhoto(
            "cleaning-table",
            1440,
            1080,
            "Loose objects lie beside sorting trays at two table-cleaning stations, before the operators begin sorting them.",
          ),
          collectionPhoto(
            "cleaning-table-02",
            1600,
            1200,
            "The foreground operator reaches into a yellow sorting tray while the other continues moving objects at the next station.",
          ),
        ],
      },
      {
        id: "cap-pen",
        photos: [
          collectionPhoto(
            "capping-pen",
            1440,
            1080,
            "Separate pen pieces rest on the desks while the operators position their grippers to begin.",
          ),
          collectionPhoto(
            "capping-pen-02",
            1440,
            1080,
            "Operators bring their grippers together over the desks to align the pens and caps.",
          ),
        ],
      },
    ],
  },
  workflow: {
    title: "From distributed collection to auto-training",
    figure: {
      image: framework,
      alt: "Cloud-edge pipeline with asynchronous batched VLA inference, timestamp-aligned OOD detection, AR-guided collection, data cleaning, 1:1 data mixing, training, and redeployment.",
      caption: "",
    },
    steps: [
      {
        title: "Collect in parallel",
        text: "Operators use multiple handheld UMI devices to gather demonstrations under the current policy.",
      },
      {
        title: "Upload & check",
        text: "Recordings upload asynchronously. The cloud cleans, annotates, and checks the data.",
      },
      {
        title: "Train at the data quota",
        text: "Once enough valid data is ready, the cloud starts the next policy update automatically.",
      },
      {
        title: "Redeploy & repeat",
        text: "The new checkpoint is deployed in the cloud, and the system publishes the next collection task.",
      },
    ],
    videos: [
      {
        id: "online-pipeline",
        label: "Online DAgger-style training pipeline",
        columns: 2,
        sync: false,
        videos: [
          {
            id: "online-steerumi-dagger",
            label: "Online DAgger-style training pipeline",
            src: "videos/online-steerumi-dagger-58s.mp4",
            poster: "images/online-steerumi-dagger-58s-poster.jpg",
            aspectRatio: "16 / 9",
            loop: false,
          },
        ],
      },
    ],
  },
  results: {
    title: "Better corrective data. Stronger policies.",
    meanRelativeGain: "28.6%",
    progressFigure: {
      image: progress,
      alt: "Task Progress Score by round for folding clothes, folding towels, stacking cubes, cleaning up a table, and capping a pen, comparing conventional UMI with SteerUMI.",
      caption: "",
    },
    repeatabilityFigure: {
      image: "images/results/tps-stack-cubes-repeatability.svg",
      width: 1120,
      height: 748,
      alt: "Task Progress Score on stack cubes across four post-training rounds. Two independent SteerUMI runs start from the same base and follow similar upward trends. The light-blue band shows the range of the two runs.",
      caption: "Stack cubes · Task Progress Score (TPS, %), adapted from Figure 4.",
    },
    comparisonFigure: {
      image: comparison,
      alt: "HG-DAgger and SteerUMI compared by round and collection time on stack cubes.",
      caption: "",
    },
    collectionTimes: [
      { method: "SteerUMI", minutes: 100, ours: true },
      { method: "Real-robot HG-DAgger", minutes: 150 },
    ],
    finalScores: [
      {
        id: "fold-clothes",
        task: "Fold clothes",
        rounds: 3,
        conventional: "0.78",
        steerumi: "1.00",
      },
      {
        id: "fold-towels",
        task: "Fold towels",
        rounds: 3,
        conventional: "0.64",
        steerumi: "0.95",
      },
      {
        id: "stack-cubes",
        task: "Stack cubes",
        rounds: 4,
        conventional: "0.79",
        steerumi: "0.94",
      },
      {
        id: "clean-up",
        task: "Clean up table",
        rounds: 4,
        conventional: "0.74",
        steerumi: "0.84",
      },
      {
        id: "cap-pen",
        task: "Cap pen",
        rounds: 4,
        conventional: "0.64",
        steerumi: "0.85",
      },
    ],
    ablations: [
      {
        task: "Fold clothes",
        method: "Without AR",
        withAR: false,
        startSR: 80,
        startTPS: 84.5,
        afterSR: 40,
        afterTPS: 67.5,
      },
      {
        task: "Fold clothes",
        method: "With AR (ours)",
        withAR: true,
        startSR: 80,
        startTPS: 84.5,
        afterSR: 90,
        afterTPS: 91.5,
      },
      {
        task: "Stack cubes",
        method: "Without AR",
        withAR: false,
        startSR: 40,
        startTPS: 74,
        afterSR: 15,
        afterTPS: 70,
      },
      {
        task: "Stack cubes",
        method: "With AR (ours)",
        withAR: true,
        startSR: 40,
        startTPS: 74,
        afterSR: 55,
        afterTPS: 85,
      },
    ],
  },
  demonstrations: {
    groups: [
      {
        id: "fold-clothes",
        label: "Folding clothes",
        columns: 2,
        sync: false,
        videos: [
          collectionVideo("fold-clothes-collection-v2", "Recording 1", 61),
          collectionVideo("fold-clothes-collection-take-02", "Recording 2", 63),
          collectionVideo("fold-clothes-collection-take-03", "Recording 3", 66),
          robotVideo("fold-clothes-robot", 25),
        ],
      },
      {
        id: "fold-towels",
        label: "Folding towels",
        columns: 2,
        sync: false,
        videos: [
          collectionVideo("fold-towels-collection-v2", "Recording 1", 53),
          collectionVideo("fold-towels-collection-take-02", "Recording 2", 52),
          collectionVideo("fold-towels-collection-take-03", "Recording 3", 51),
          robotVideo("fold-towels-robot", 20),
        ],
      },
      {
        id: "stack-cubes",
        label: "Stacking cubes",
        columns: 2,
        sync: false,
        videos: [
          collectionVideo("stack-cubes-collection-v2", "Recording 1", 14),
          collectionVideo("stack-cubes-collection-take-02", "Recording 2", 13),
          collectionVideo("stack-cubes-collection-source", "Recording 3", 16),
          robotVideo("stack-cubes-robot", 5),
        ],
      },
      {
        id: "clean-up",
        label: "Cleaning up a table",
        columns: 2,
        sync: false,
        videos: [
          collectionVideo("clean-up-collection-v2", "Recording 1", 65),
          collectionVideo("clean-up-collection-take-02", "Recording 2", 73),
          collectionVideo("clean-up-collection-take-03", "Recording 3", 52),
          robotVideo("clean-up-robot", 20),
        ],
      },
      {
        id: "cap-pen",
        label: "Capping a pen",
        columns: 2,
        sync: false,
        videos: [
          collectionVideo("cap-pen-collection-v2", "Recording 1", 18),
          collectionVideo("cap-pen-collection-take-02", "Recording 2", 21),
          collectionVideo("cap-pen-collection-source", "Recording 3", 26),
          robotVideo("cap-pen-robot", 5),
        ],
      },
    ],
  },
  citation: {
    isDraft: false,
    bibtex: `@misc{xu2026steerumi,
  title = {{SteerUMI}: Robot-Free Human-in-the-Loop Post-Training on Distributed {UMI} Devices},
  author = {Jiafeng Xu and Qi Li and Xinke Chai and Xiurui Guo and Xiaoqi Li and Xuanming Cheng
            and Xiang Li and Shaowen He and Hongfei Niu and Bingye Chen and Songpeng Zhang
            and Yifan Yang and Qian Zhu and Ran Cheng and Hao Dong},
  year = {2026},
}`,
  },
  footer: {},
};
