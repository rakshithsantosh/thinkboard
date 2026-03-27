export const TASK_STATUSES = [
  "IDEATION",
  "TODO",
  "IN_PROGRESS",
  "IMPLEMENTED",
  "GO_LIVE",
] as const;

export type TaskStatusValue = (typeof TASK_STATUSES)[number];

export const TASK_STATUS_META: Record<
  TaskStatusValue,
  {
    label: string;
    description: string;
    chipClassName: string;
    columnClassName: string;
  }
> = {
  IDEATION: {
    label: "Ideation",
    description: "Capture sparks and rough thoughts before they harden.",
    chipClassName: "bg-amber-100 text-amber-900",
    columnClassName: "border-amber-200/80 bg-amber-50/70",
  },
  TODO: {
    label: "To Do",
    description: "Clarified work that is ready to be picked up.",
    chipClassName: "bg-sky-100 text-sky-900",
    columnClassName: "border-sky-200/80 bg-sky-50/70",
  },
  IN_PROGRESS: {
    label: "In Progress",
    description: "Active execution with notes, tradeoffs, and next steps.",
    chipClassName: "bg-violet-100 text-violet-900",
    columnClassName: "border-violet-200/80 bg-violet-50/70",
  },
  IMPLEMENTED: {
    label: "Implemented",
    description: "Built and verified, waiting for final communication.",
    chipClassName: "bg-emerald-100 text-emerald-900",
    columnClassName: "border-emerald-200/80 bg-emerald-50/70",
  },
  GO_LIVE: {
    label: "Go Live",
    description: "Shipped work and launch-ready documentation.",
    chipClassName: "bg-rose-100 text-rose-900",
    columnClassName: "border-rose-200/80 bg-rose-50/70",
  },
};
