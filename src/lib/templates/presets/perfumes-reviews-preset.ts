import type { EditorNode } from "@/lib/visual-editor/node-tree";

export const PERFUMES_REVIEWS_PRESET: EditorNode[] = [
  {
    id: "perfumes-reviews-hero",
    type: "perfumesReviewsHero",
    settings: {
      title: "Reviews",
    },
  },
  {
    id: "perfumes-reviews-grid",
    type: "perfumesReviewsGrid",
    settings: {
      columns: 3,
    },
  },
];
