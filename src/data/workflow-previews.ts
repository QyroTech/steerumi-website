export const workflowPreviews = [
  { id: "video-first", number: 1, label: "Video first" },
  { id: "efficiency-first", number: 2, label: "Efficiency first" },
  { id: "pipeline-first", number: 3, label: "Pipeline first" },
] as const;

export type WorkflowPreviewId = (typeof workflowPreviews)[number]["id"];
